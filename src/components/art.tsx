import type { JSX, SVGProps } from 'react';

/** Stylized tire with tread — used in hero, product cards, and icons */
export function TireArt({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden {...props}>
      <circle cx="60" cy="60" r="56" fill="#191919" />
      <g stroke="#2e2e2e" strokeWidth="5" strokeLinecap="round">
        <path d="M60 6v10" /><path d="M60 104v10" /><path d="M6 60h10" /><path d="M104 60h10" />
        <path d="M22 22l7 7" /><path d="M91 91l7 7" /><path d="M98 22l-7 7" /><path d="M29 91l-7 7" />
        <path d="M38 9.5l3.5 9" /><path d="M78.5 101.5l3.5 9" /><path d="M9.5 38l9 3.5" />
        <path d="M101.5 78.5l9 3.5" /><path d="M82 9.5l-3.5 9" /><path d="M41.5 101.5l-3.5 9" />
        <path d="M9.5 82l9-3.5" /><path d="M101.5 41.5l9-3.5" />
      </g>
      <circle cx="60" cy="60" r="38" fill="#f6c744" />
      <circle cx="60" cy="60" r="38" fill="url(#rimgrad)" />
      <circle cx="60" cy="60" r="30" fill="#e9e9e9" />
      <g fill="#c9c9c9">
        <path d="M60 34l5 14h-10z" />
        <path d="M82.5 51.5l-8.6 12.6 8.6 5.4z" transform="rotate(72 60 60)" />
        <path d="M60 34l5 14h-10z" transform="rotate(72 60 60)" />
        <path d="M60 34l5 14h-10z" transform="rotate(144 60 60)" />
        <path d="M60 34l5 14h-10z" transform="rotate(216 60 60)" />
        <path d="M60 34l5 14h-10z" transform="rotate(288 60 60)" />
      </g>
      <circle cx="60" cy="60" r="8" fill="#191919" />
      <defs>
        <radialGradient id="rimgrad" cx="0.5" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#f6c744" stopOpacity="0" />
          <stop offset="100%" stopColor="#00000033" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Stylized car battery */
export function BatteryArt({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden {...props}>
      <rect x="18" y="34" width="84" height="62" rx="8" fill="#191919" />
      <rect x="18" y="34" width="84" height="18" rx="8" fill="#2a2a2a" />
      <rect x="30" y="26" width="16" height="10" rx="3" fill="#d43d2a" />
      <rect x="74" y="26" width="16" height="10" rx="3" fill="#3c3c3c" />
      <rect x="30" y="58" width="18" height="6" rx="3" fill="#f6c744" />
      <path d="M80 55h7v7h7v7h-7v7h-7v-7h-7v-7h7z" fill="#f6c744" transform="translate(-2 0)" />
      <rect x="24" y="88" width="72" height="4" rx="2" fill="#f6c744" opacity="0.25" />
    </svg>
  );
}

/** Wrench / service glyphs */
const paths: Record<string, JSX.Element> = {
  tire: <circle cx="12" cy="12" r="8" />,
  repair: <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L4 17l3 3 4.7-4.7a4.5 4.5 0 0 0 6-6l-3 3-2.5-.5-.5-2.5 3-3z" />,
  balance: <path d="M12 3v18M5 7l7-2 7 2M3 12a4 4 0 0 0 8 0M13 12a4 4 0 0 0 8 0M7 21h10" />,
  align: <path d="M4 6h16M4 12h16M4 18h10M18 16l3 2-3 2" />,
  battery: <path d="M3 8h14v10H3zM17 10h4v6h-4M6.5 11v4M10.5 11v4" />,
  inspect: <path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM14.5 14.5 20 20" />,
  oil: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  pin: <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
};

export function ServiceIcon({ name, className }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z" />
    </svg>
  );
}
