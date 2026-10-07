// Lightweight API request logger — console + in-memory ring buffer + event for
// the on-screen overlay (mobile has no DevTools, so failures must be visible).

export interface ApiLogEntry {
  id: number;
  at: number; // epoch ms
  phase: 'start' | 'ok' | 'http-error' | 'network-error' | 'parse-error';
  method: string;
  url: string;
  status?: number;
  ms?: number;
  detail?: string;
}

const MAX_ENTRIES = 80;
const entries: ApiLogEntry[] = [];
let seq = 0;
const EVT = 'emadgad-api-log';

export function apiDebugEnabled(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has('debug')) return true;
    return localStorage.getItem('emadgad-api-debug') === '1';
  } catch {
    return false;
  }
}

export function apiLog(entry: Omit<ApiLogEntry, 'id' | 'at'>) {
  const full: ApiLogEntry = { ...entry, id: ++seq, at: Date.now() };
  entries.push(full);
  if (entries.length > MAX_ENTRIES) entries.shift();

  const tag = `[api:${full.phase}]`;
  const msg = `${full.method} ${full.url}${full.status != null ? ` → ${full.status}` : ''}${full.ms != null ? ` (${Math.round(full.ms)}ms)` : ''}${full.detail ? ` — ${full.detail}` : ''}`;
  if (full.phase === 'ok') console.debug(tag, msg);
  else console.warn(tag, msg);

  try {
    window.dispatchEvent(new CustomEvent(EVT, { detail: full }));
  } catch {
    /* SSR / non-dom */
  }
}

export function getApiLogEntries(): ApiLogEntry[] {
  return entries;
}

export function onApiLog(cb: (entry: ApiLogEntry) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ApiLogEntry>).detail);
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}
