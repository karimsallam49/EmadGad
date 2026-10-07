import { useEffect, useState } from 'react';
import { Bug, X } from 'lucide-react';
import { apiDebugEnabled, getApiLogEntries, onApiLog, type ApiLogEntry } from '@/lib/api-debug';
import { API_BASE } from '@/lib/endpoints';

const PHASE_COLOR: Record<ApiLogEntry['phase'], string> = {
  start: 'text-sky-300',
  ok: 'text-emerald-300',
  'http-error': 'text-amber-300',
  'network-error': 'text-red-400',
  'parse-error': 'text-fuchsia-300',
};

/** On-screen API log for devices without DevTools — enable with ?debug=1 or localStorage 'emadgad-api-debug'='1' */
export function ApiDebugOverlay() {
  const [enabled] = useState(apiDebugEnabled);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ApiLogEntry[]>(() => [...getApiLogEntries()]);
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    return onApiLog((entry) => {
      setEntries((prev) => [...prev.slice(-79), entry]);
      if (entry.phase !== 'start' && entry.phase !== 'ok') setFailCount((n) => n + 1);
    });
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 left-3 z-[9999] flex items-center gap-1.5 rounded-full bg-black/85 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur"
        dir="ltr"
      >
        <Bug className="h-4 w-4" />
        API {entries.length}
        {failCount > 0 && (
          <span className="rounded-full bg-red-500 px-1.5 text-[10px] leading-4">{failCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[9998] max-h-[55vh] overflow-y-auto rounded-t-2xl bg-black/95 p-3 font-mono text-[11px] leading-5 text-white shadow-2xl" dir="ltr">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="font-black">API debug — base: <span className="text-brand">{API_BASE || '(same-origin / vite proxy)'}</span></p>
              <p className="text-white/60">dev: {String(import.meta.env.DEV)} · url: {window.location.origin}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white/15 p-1.5" aria-label="close">
              <X className="h-4 w-4" />
            </button>
          </div>
          {entries.length === 0 && <p className="text-white/50">No requests yet…</p>}
          {entries.map((e) => (
            <p key={e.id} className={`break-all ${PHASE_COLOR[e.phase]}`}>
              {new Date(e.at).toLocaleTimeString('en-GB')} · {e.phase} · {e.method} {e.url}
              {e.status != null ? ` → ${e.status}` : ''}
              {e.ms != null ? ` · ${Math.round(e.ms)}ms` : ''}
              {e.detail ? ` — ${e.detail}` : ''}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
