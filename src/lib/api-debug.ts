// API diagnostics — console + ring buffer (persisted, survives iOS page reloads) +
// event for the on-screen overlay. Enable with ?debug=1 (sticky) or
// localStorage 'emadgad-api-debug'='1'.

export interface ApiLogEntry {
  id: number;
  at: number; // epoch ms
  phase: 'start' | 'ok' | 'http-error' | 'network-error' | 'parse-error' | 'retry' | 'probe' | 'info';
  method: string;
  url: string;
  status?: number;
  ms?: number;
  detail?: string;
}

const MAX_ENTRIES = 200;
const STORE_KEY = 'emadgad-api-log';
const EVT = 'emadgad-api-log';
const entries: ApiLogEntry[] = [];
let seq = 0;
let inflight = 0;

export function apiDebugEnabled(): boolean {
  try {
    const { search, hash, pathname } = window.location;
    if (new URLSearchParams(search).has('debug') || hash.includes('debug') || pathname.replace(/\/+$/, '').endsWith('/debug')) {
      localStorage.setItem('emadgad-api-debug', '1');
      return true;
    }
    return localStorage.getItem('emadgad-api-debug') === '1';
  } catch {
    return false;
  }
}

export function apiInflight(delta = 0): number {
  inflight = Math.max(0, inflight + delta);
  return inflight;
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* quota / private mode */
  }
}

// restore entries from the previous page life (iOS often kills + reloads tabs)
try {
  const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '[]') as ApiLogEntry[];
  if (Array.isArray(prev)) {
    entries.push(...prev.slice(-MAX_ENTRIES));
    seq = entries.reduce((m, e) => Math.max(m, e.id), 0);
  }
} catch {
  /* ignore */
}

export function apiLog(entry: Omit<ApiLogEntry, 'id' | 'at'>) {
  const full: ApiLogEntry = { ...entry, id: ++seq, at: Date.now() };
  entries.push(full);
  if (entries.length > MAX_ENTRIES) entries.shift();

  const tag = `[api:${full.phase}]`;
  const msg = `${full.method} ${full.url}${full.status != null ? ` → ${full.status}` : ''}${full.ms != null ? ` (${Math.round(full.ms)}ms)` : ''}${full.detail ? ` — ${full.detail}` : ''}`;
  if (full.phase === 'ok' || full.phase === 'start' || full.phase === 'info') console.debug(tag, msg);
  else console.warn(tag, msg);

  if (full.phase !== 'start') persist();
  try {
    window.dispatchEvent(new CustomEvent(EVT, { detail: full }));
  } catch {
    /* SSR / non-dom */
  }
}

export function getApiLogEntries(): ApiLogEntry[] {
  return entries;
}

export function clearApiLog() {
  entries.length = 0;
  persist();
}

export function onApiLog(cb: (entry: ApiLogEntry) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ApiLogEntry>).detail);
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}

/** Runtime context attached to every failure */
export function apiContext(): string {
  try {
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
    return [
      `inflight=${inflight}`,
      `t+${Math.round(performance.now())}ms`,
      `vis=${document.visibilityState}`,
      `online=${navigator.onLine}`,
      `net=${nav.connection?.effectiveType ?? '?'}`,
    ].join(' ');
  } catch {
    return '';
  }
}

/** Plain-text dump for copy/paste (summary + every entry) */
export function apiLogReport(): string {
  const non = entries.filter((e) => e.phase !== 'start');
  const count = (p: ApiLogEntry['phase']) => non.filter((e) => e.phase === p).length;
  const ok = non.filter((e) => e.phase === 'ok' && e.ms != null).map((e) => e.ms as number).sort((a, b) => a - b);
  const p95 = ok.length ? Math.round(ok[Math.floor(ok.length * 0.95)] ?? ok[ok.length - 1]) : 0;
  const head = [
    `UA: ${navigator.userAgent}`,
    `origin: ${location.origin}  page: ${location.pathname}`,
    `ok=${count('ok')} http-error=${count('http-error')} network-error=${count('network-error')} parse-error=${count('parse-error')} retry=${count('retry')}`,
    `ok latency p95=${p95}ms max=${ok.length ? Math.round(ok[ok.length - 1]) : 0}ms`,
    '---',
  ];
  const lines = non.map(
    (e) =>
      `${new Date(e.at).toISOString().slice(11, 23)} ${e.phase} ${e.method} ${e.url}${e.status != null ? ` -> ${e.status}` : ''}${e.ms != null ? ` ${Math.round(e.ms)}ms` : ''}${e.detail ? ` | ${e.detail}` : ''}`,
  );
  return [...head, ...lines].join('\n');
}

let lifecycleBound = false;
/** Page lifecycle events — iOS suspends/kills tabs; in-flight fetches die with "Load failed" */
export function bindLifecycleLogging() {
  if (lifecycleBound || typeof window === 'undefined') return;
  lifecycleBound = true;
  const info = (detail: string) => apiLog({ phase: 'info', method: 'EVT', url: location.pathname, detail: `${detail} ${apiContext()}` });
  info(`page-load nav=${(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type ?? '?'}`);
  document.addEventListener('visibilitychange', () => info(`visibility=${document.visibilityState}`));
  window.addEventListener('pagehide', (e) => info(`pagehide persisted=${(e as PageTransitionEvent).persisted}`));
  window.addEventListener('pageshow', (e) => info(`pageshow persisted=${(e as PageTransitionEvent).persisted}`));
  window.addEventListener('online', () => info('network online'));
  window.addEventListener('offline', () => info('network offline'));
  window.addEventListener('unhandledrejection', (e) =>
    info(`unhandledrejection ${e.reason instanceof Error ? `${e.reason.name}: ${e.reason.message}` : String(e.reason)}`),
  );
}
