import { Check } from 'lucide-react';
import { useLang } from '@/i18n';

const STEPS = ['الفرع', 'الخدمة', 'الميعاد', 'بياناتك'];

export function Stepper({ step }: { step: number }) {
  const { num, t } = useLang();
  return (
    <ol className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-colors ${
              i < step ? 'bg-coal text-brand' : i === step ? 'bg-brand text-coal border-2 border-coal' : 'bg-muted text-ink-mute'
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : num(i + 1)}
          </span>
          <span className={`hidden sm:block text-sm font-extrabold ${i === step ? 'text-ink' : 'text-ink-mute'}`}>{t(s)}</span>
          {i < STEPS.length - 1 && <span className="h-0.5 w-5 sm:w-8 bg-border rounded" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
