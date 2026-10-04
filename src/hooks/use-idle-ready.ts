import { useEffect, useState } from 'react';

/**
 * Becomes true after the browser goes idle (or ~1.5s, whichever comes first).
 * Use it to gate non-critical queries so they don't compete with the LCP path.
 */
export function useIdleReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, []);
  return ready;
}
