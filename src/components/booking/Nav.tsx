import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLang } from '@/i18n';

export function Nav({
  step,
  canNext,
  isPending,
  setStep,
  confirm,
}: {
  step: number;
  canNext: boolean;
  isPending: boolean;
  setStep: (fn: (s: number) => number) => void;
  confirm: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <button
        onClick={() => setStep((s) => Math.max(0, s - 1))}
        disabled={step === 0}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-5 h-12 font-black text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" /> {t('رجوع')}
      </button>
      {step < 3 ? (
        <button
          onClick={() => canNext && setStep((s) => s + 1)}
          disabled={!canNext}
          className="inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-7 h-12 font-black shadow-[0_4px_0_#00000055] hover:translate-y-[2px] hover:shadow-[0_2px_0_#00000055] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all"
        >
          {t('التالي')} <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
        </button>
      ) : (
        <button
          onClick={confirm}
          disabled={!canNext || isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-brand text-coal px-7 h-12 font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <span>{t('جاري الإرسال...')}</span>
          ) : (
            <>
              <Check className="h-5 w-5" /> {t('تأكيد الحجز')}
            </>
          )}
        </button>
      )}
    </div>
  );
}
