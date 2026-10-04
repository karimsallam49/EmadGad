import { Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLang } from '@/i18n';
import RescueForm from '@/components/RescueForm';

export default function RescueDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLang();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-ink p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-ink text-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coal text-brand">
              <Truck className="h-5 w-5" />
            </span>
            {t('طلب إنقاذ')}
          </DialogTitle>
        </DialogHeader>
        {/* remount on every open so the form starts fresh */}
        {open && <RescueForm onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
