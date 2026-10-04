import { useEffect, useState } from 'react';

const SPLASH_MS = 4000;
const FADE_MS = 400;

export default function SplashScreen() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_MS);
    const doneTimer = setTimeout(() => setMounted(false), SPLASH_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-brand transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src="/assets/ezgif-76ee578630df5013.gif"
        alt=""
        className="w-60 sm:w-80"
        draggable={false}
      />
    </div>
  );
}
