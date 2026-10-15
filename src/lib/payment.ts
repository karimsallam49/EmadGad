/** Stashed before redirecting to the gateway webview, so the ?flag=... return has context */
export const PENDING_PAYMENT_KEY = 'emadgad-pending-payment';
export interface PendingPayment {
  order_id?: number;
  order_no?: string;
  payment_id?: number;
  gateway?: string;
}

export function readGatewayReturn(): { flag: string; pending: PendingPayment | null; token: string | null } | null {
  const params = new URLSearchParams(window.location.search);
  const flag = params.get('flag');
  if (flag !== 'success' && flag !== 'fail') return null;
  let pending: PendingPayment | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_PAYMENT_KEY) ?? 'null');
  } catch { /* malformed cache */ }
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  const token = params.get('token');
  window.history.replaceState(null, '', window.location.pathname);
  return { flag, pending, token };
}

/** The gateway token is base64 of `key=value&&key=value` — e.g. payment_method=paymob_accept&&order_id=42 */
export function decodePaymentToken(token: string | null): { order_id?: number; transaction_reference?: string } {
  if (!token) return {};
  try {
    const fields: Record<string, string> = {};
    for (const pair of atob(token).split('&&')) {
      const eq = pair.indexOf('=');
      if (eq > 0) fields[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
    return {
      order_id: Number(fields.order_id) || undefined,
      transaction_reference: fields.transaction_reference || undefined,
    };
  } catch {
    return {};
  }
}

export function goToGateway(url: string, info: PendingPayment) {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(info));
  } catch { /* private mode — the return will just lack context */ }
  window.location.assign(url);
}

/** Payment methods that never go through an online gateway */
export const OFFLINE_PAYMENT_METHODS = ['pay_at_branch', 'cash_on_delivery'];

/** Strip the `_failed` suffix the backend appends after a failed attempt */
export function gatewayFromPaymentMethod(method?: string | null): string | null {
  if (!method) return null;
  const gateway = method.replace(/_failed$/, '');
  return OFFLINE_PAYMENT_METHODS.includes(gateway) ? null : gateway;
}
