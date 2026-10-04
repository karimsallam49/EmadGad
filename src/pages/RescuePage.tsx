import { useNavigate } from 'react-router';
import { Truck } from 'lucide-react';
import { useLang } from '@/i18n';
import RescueForm from '@/components/RescueForm';

export default function RescuePage() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coal text-brand">
            <Truck className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-ink">{t('طلب إنقاذ')}</h1>
          <p className="mt-2 text-lg font-semibold text-ink-mute">{t('سيب بياناتك وهنيجيلك في أسرع وقت.')}</p>
        </div>

        <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-5 sm:p-8 shadow-[0_10px_0_#f6c744]">
          <RescueForm onCancel={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
}
