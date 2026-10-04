import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, register as apiRegister, setApiToken, getCustomerInfo } from '@/lib/api';
import type { CustomerInfoModel } from '@/types/api';

const STORAGE_KEY = 'emadgad-token';

interface AuthCtx {
  user: CustomerInfoModel | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  register: (body: { mobile: string; password: string; name?: string; email?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function storeToken(res: { data?: unknown; token?: string | null }) {
  // API shape isn't consistent — probe token / data.token / data.data.token
  const data = res.data as { token?: string; data?: { token?: string } } | null | undefined;
  const token = res.token ?? data?.token ?? data?.data?.token ?? null;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
    setApiToken(token);
  }
  return token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerInfoModel | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadCustomer = async () => {
    try {
      const info = await getCustomerInfo();
      setUser(info ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiToken(saved);
      loadCustomer();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (mobile: string, password: string) => {
    const res = await apiLogin({ mobile, password, device_type: 'web' });
    storeToken(res);
    queryClient.clear(); // drop the previous account's cached data
    await loadCustomer();
  };

  const register = async (body: { mobile: string; password: string; name?: string; email?: string }) => {
    // 2-step chain: signup-email creates the account, then auto-login with the
    // same credentials to obtain the token (login identity is mobile).
    await apiRegister(body);
    try {
      const res = await apiLogin({ mobile: body.mobile, password: body.password, device_type: 'web' });
      storeToken(res);
      queryClient.clear();
      await loadCustomer();
    } catch {
      throw new Error('AUTO_LOGIN_FAILED');
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiToken(null);
    setUser(null);
    queryClient.clear();
  };

  const refreshUser = async () => {
    await loadCustomer();
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
