/** Google Identity Services loader + OAuth token sign-in (web equivalent of google_sign_in) */

export interface GoogleIdentity {
  /** Google user id (`sub`) */
  uniqueId: string;
  email?: string;
  name?: string;
  /** Google OAuth access token sent to the backend */
  token: string;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleOauth2 {
  initTokenClient(cfg: {
    client_id: string;
    scope: string;
    callback: (resp: TokenResponse) => void;
    error_callback?: (err: { type?: string }) => void;
  }): { requestAccessToken(opts?: { prompt?: string }): void };
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOauth2 } };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisPromise: Promise<void> | null = null;

/** Injects the GIS script once */
export function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('gis load failed')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gis load failed'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

/** Thrown when the user closes Google's consent sheet without picking an account */
export class GoogleCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'GoogleCancelledError';
  }
}

/**
 * Runs the Google consent flow (access-token client) and resolves with the
 * identity the backend expects: unique_id (sub), email, name, access token.
 */
export async function signInWithGoogle(clientId: string): Promise<GoogleIdentity> {
  await loadGis();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google sign-in unavailable');

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (resp) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error || 'no token'));
      },
      error_callback: (err) => {
        reject(err?.type === 'popup_closed' ? new GoogleCancelledError() : new Error('google sign-in failed'));
      },
    });
    client.requestAccessToken();
  });

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('google userinfo failed');
  const info = (await res.json()) as { sub?: string; email?: string; name?: string };
  if (!info.sub) throw new Error('google userinfo missing sub');

  return { uniqueId: info.sub, email: info.email, name: info.name, token: accessToken };
}
