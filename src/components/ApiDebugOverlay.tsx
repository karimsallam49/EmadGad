import { useEffect, useState } from 'react';
import { Bug, Copy, Trash2, X } from 'lucide-react';
import {
  apiDebugEnabled,
  apiLogReport,
  bindLifecycleLogging,
  clearApiLog,
  getApiLogEntries,
  onApiLog,
  type ApiLogEntry,
} from '@/lib/api-debug';
import { API_BASE } from '@/lib/endpoints';

const PHASE_COLOR: Record<ApiLogEntry['phase'], string> = {
  start: 'text-sky-300',
  ok: 'text-emerald-300',
  'http-error': 'text-amber-300',
  'network-error': 'text-red-400',
  'parse-error': 'text-fuchsia-300',
  retry: 'text-orange-300',
  probe: 'text-yellow-200',
  info: 'text-white/60',
};

if (typeof window !== 'undefined' && apiDebugEnabled()) bindLifecycleLogging();

/** On-screen API log for devices without DevTools — enable with ?debug=1 (sticky) or localStorage 'emadgad-api-debug'='1' */
export function ApiDebugOverlay() {
  const [enabled] = useState(apiDebugEnabled);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ApiLogEntry[]>(() => [...getApiLogEntries()]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    return onApiLog((entry) => setEntries((prev) => [...prev.slice(-199), entry]));
  }, [enabled]);

  if (!enabled) return null;

  const shown = entries.filter((e) => e.phase !== 'start');
  const failCount = shown.filter((e) => e.phase === 'network-error' || e.phase === 'http-error' || e.phase === 'parse-error').length;

  const copy = async () => {
    const text = apiLogReport();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 left-3 z-[9999] flex items-center gap-1.5 rounded-full bg-black/85 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur"
        dir="ltr"
      >
        <Bug className="h-4 w-4" />
        API {shown.length}
        {failCount > 0 && (
          <span className="rounded-full bg-red-500 px-1.5 text-[10px] leading-4">{failCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[9998] max-h-[65vh] overflow-y-auto rounded-t-2xl bg-black/95 p-3 font-mono text-[11px] leading-5 text-white shadow-2xl" dir="ltr">
          <div className="sticky top-0 -mx-3 -mt-3 mb-2 flex items-start justify-between gap-2 bg-black/95 p-3">
            <div>
              <p className="font-black">API debug — base: <span className="text-brand">{API_BASE || '(same-origin / vite proxy)'}</span></p>
              <p className="text-white/60">dev: {String(import.meta.env.DEV)} · url: {window.location.origin}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={copy} className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1.5 font-black text-coal" aria-label="copy">
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={() => { clearApiLog(); setEntries([]); }} className="rounded-full bg-white/15 p-1.5" aria-label="clear">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-full bg-white/15 p-1.5" aria-label="close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {shown.length === 0 && <p className="text-white/50">No requests yet…</p>}
          {shown.map((e) => (
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
