import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { forgotPassword, resetPassword } from '@/lib/api';
import { useLang } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Step = 'mobile' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { t, num } = useLang();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const fieldErr = (key: string) =>
    errors[key] ? <p className="mt-1 text-[11px] font-bold text-red-600">{errors[key]}</p> : null;

  const sendOtp = async () => {
    setError('');
    const trimmed = mobile.trim();
    if (!trimmed) {
      setErrors({ mobile: t('مطلوب') });
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ mobile: trimmed });
      setStep('reset');
      setCooldown(30); // backend enforces a 30s gap between OTP requests
    } catch (err) {
      setError(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs: Record<string, string> = {};
    if (otp.length !== 5) errs.otp = t('الكود 5 أرقام');
    if (!password) errs.password = t('مطلوب');
    else if (password.length < 6) errs.password = t('كلمة المرور 6 أحرف على الأقل');
    if (confirmPassword !== password) errs.confirmPassword = t('كلمة المرور غير متطابقة');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await resetPassword({ mobile: mobile.trim(), otp, new_password: password });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('الكود غلط أو منتهي — جرب تاني'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-20 px-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-black text-ink text-center">{t('نسيت كلمة المرور؟')}</h1>

        {step === 'done' ? (
          <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-6 text-center shadow-[0_8px_0_#f6c744]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand">
              <CheckCircle2 className="h-7 w-7 text-coal" />
            </span>
            <p className="mt-4 text-lg font-black text-ink">{t('كلمة المرور اتغيرت')}</p>
            <p className="mt-2 text-sm font-bold text-ink-mute leading-relaxed">
              {t('سجّل دخول برقم الموبايل وكلمة المرور الجديدة.')}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-coal text-base font-black text-brand shadow-[0_4px_0_#00000055] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_#00000055]"
            >
              {t('دخول')}
            </Link>
          </div>
        ) : step === 'reset' ? (
          <form onSubmit={submitReset} className="mt-8 space-y-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-[0_8px_0_#f6c744]">
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand">
                <ShieldCheck className="h-7 w-7 text-coal" />
              </span>
              <p className="mt-3 text-sm font-bold text-ink-mute leading-relaxed">
                {t('بعتنالك كود تحقق على')} <span className="ltr font-extrabold text-ink">{mobile}</span>
              </p>
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('كود التحقق')}</label>
              <Input
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 5));
                  if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));
                }}
                inputMode="numeric"
                placeholder="•••••"
                className={`h-12 text-center text-xl font-black tracking-[0.5em] ${errors.otp ? 'border-red-500' : ''}`}
              />
              {fieldErr('otp')}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('كلمة المرور الجديدة')}</label>
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                }}
                type="password"
                placeholder="••••••••"
                className={`h-12 text-base ${errors.password ? 'border-red-500' : ''}`}
              />
              {fieldErr('password')}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('تأكيد كلمة المرور')}</label>
              <Input
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                type="password"
                placeholder="••••••••"
                className={`h-12 text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {fieldErr('confirmPassword')}
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-black">
              {loading ? t('جاري الحفظ...') : t('احفظ كلمة المرور')}
            </Button>
            <p className="text-center text-sm font-bold text-ink-mute">
              {t('موصلكش الكود؟')}{' '}
              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={loading || cooldown > 0}
                className="font-black text-ink underline hover:text-brand disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `${t('ابعت تاني')} (${num(cooldown)})` : t('ابعت تاني')}
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
            className="mt-8 space-y-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-[0_8px_0_#f6c744]"
          >
            <p className="text-sm font-bold text-ink-mute leading-relaxed">
              {t('اكتب رقم الموبايل اللي سجلت بيه وهنبعتلك كود تحقق.')}
            </p>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('رقم الموبايل')}</label>
              <Input
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (errors.mobile) setErrors((p) => ({ ...p, mobile: '' }));
                }}
                inputMode="tel"
                placeholder="01xxxxxxxxx"
                className={`h-12 text-base ${errors.mobile ? 'border-red-500' : ''}`}
              />
              {fieldErr('mobile')}
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-black">
              {loading ? t('جاري الإرسال...') : t('ابعت الكود')}
            </Button>
            <p className="text-center text-sm font-bold text-ink-mute">
              <Link to="/login" className="font-black text-ink underline hover:text-brand">
                {t('ارجع لتسجيل الدخول')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
