import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/auth';
import { useLang } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobile, password);
      navigate('/');
    } catch (err) {
      const apiMessage = err instanceof Error ? err.message : t('فشل تسجيل الدخول');
      const userMessage =
        apiMessage === 'Unauthenticated.'
          ? t('رقم الموبايل أو كلمة المرور غير صحيحة')
          : apiMessage;
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-20 px-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-black text-ink text-center">{t('تسجيل الدخول')}</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-[0_8px_0_#f6c744]">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('رقم الموبايل')}</label>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="01xxxxxxxxx"
              inputMode="tel"
              className="h-12 text-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('كلمة المرور')}</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="h-12 text-base"
            />
            <div className="mt-1.5 text-end">
              <Link to="/forgot-password" className="text-xs font-extrabold text-ink-mute underline hover:text-brand">
                {t('نسيت كلمة المرور؟')}
              </Link>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-black">
            {loading ? t('جاري الدخول...') : t('دخول')}
          </Button>
          <p className="text-center text-sm font-bold text-ink-mute">
            {t('مش عندك حساب؟')}{' '}
            <Link to="/register" className="font-black text-ink underline hover:text-brand">
              {t('سجّل جديد')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
