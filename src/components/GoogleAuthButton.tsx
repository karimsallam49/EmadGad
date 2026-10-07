import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/auth';
import { useLang } from '@/i18n';
import {
  getOtpSetting,
  restoreDeletedAccount,
  sendOwnershipOtp,
  sendPhoneVerificationOtp,
  socialLogin,
  updateSocialMobile,
  verifyAndMergeAccounts,
  verifyPhoneAndSetMobile,
} from '@/lib/api';
import { GoogleCancelledError, signInWithGoogle } from '@/lib/google';
import type { SocialAuthResponseModel } from '@/types/api';

type Step = 'idle' | 'busy' | 'phone' | 'otp-social' | 'otp-merge' | 'ownership' | 'restore';

interface PendingSocial {
  medium: 'google' | 'apple';
  unique_id: string;
  email?: string;
  name?: string;
  user_id?: number | null;
  /** provider access token — needed to replay login after account restore */
  providerToken?: string;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

/** Normalize Egyptian numbers to +20xxxxxxxxxx */
function normalizePhone(p: string) {
  const digits = p.replace(/\D/g, '');
  if (digits.startsWith('20')) return `+${digits}`;
  if (digits.startsWith('0')) return `+2${digits}`;
  return `+${digits}`;
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </svg>
  );
}

const inputCls =
  'w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold text-ink focus:outline-none focus:border-ink transition-colors';

/**
 * "Continue with Google" — full social-auth flow:
 * social-customer-login → token | phone-binding (OTP or direct) | ownership merge | account restore
 */
export function GoogleAuthButton({ onDone }: { onDone?: () => void }) {
  const { t, isAr } = useLang();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('idle');
  const [pending, setPending] = useState<PendingSocial | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [ownership, setOwnership] = useState<{ id: number; name?: string } | null>(null);
  const [restoreUserId, setRestoreUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = step === 'busy' || submitting;

  const finish = async (token: string) => {
    await loginWithToken(token);
    setStep('idle');
    if (onDone) onDone();
    else navigate('/');
  };

  /** Shared response router: token → done, soft-deleted → restore, ownership → confirm, no-token success → phone */
  const routeResponse = async (res: SocialAuthResponseModel) => {
    if (res.is_soft_deleted && res.user_id) {
      setRestoreUserId(res.user_id);
      setStep('restore');
      return;
    }
    if (res.token) {
      await finish(res.token);
      return;
    }
    if (res.phone_already_linked || res.action === 'confirm_ownership') {
      const existing = res.existing_user;
      if (!existing?.id) {
        setError(res.message || t('حصلت مشكلة — جرب تاني'));
        return;
      }
      setOwnership({ id: existing.id, name: existing.name });
      setStep('ownership');
      return;
    }
    if (res.success !== false) {
      setStep('phone');
      return;
    }
    setError(res.message || t('حصلت مشكلة — جرب تاني'));
  };

  const startGoogle = async () => {
    if (!CLIENT_ID) {
      toast.error(t('تسجيل الدخول بجوجل مش متظبط لسه'));
      return;
    }
    setError(null);
    setStep('busy');
    try {
      const g = await signInWithGoogle(CLIENT_ID);
      const body: PendingSocial = {
        medium: 'google',
        unique_id: g.uniqueId,
        email: g.email,
        name: g.name,
        providerToken: g.token,
      };
      setPending(body);
      const res = await socialLogin({
        medium: 'google',
        unique_id: g.uniqueId,
        ...(g.email ? { email: g.email } : {}),
        ...(g.name ? { name: g.name } : {}),
        token: g.token,
      });
      await routeResponse(res);
    } catch (err) {
      if (!(err instanceof GoogleCancelledError)) {
        toast.error(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
      }
      setStep('idle');
    }
  };

  const submitPhone = async () => {
    if (!pending) return;
    setError(null);
    setSubmitting(true);
    const normalized = normalizePhone(phone);
    const base = {
      phone: normalized,
      email: pending.email,
      name: pending.name,
      medium: pending.medium,
      unique_id: pending.unique_id,
      user_id: pending.user_id ?? undefined,
    };
    try {
      const otpRequired = await getOtpSetting();
      if (otpRequired) {
        const res = await sendPhoneVerificationOtp(base);
        if (res.token) return await finish(res.token);
        if (res.phone_already_linked || res.action === 'confirm_ownership') return await routeResponse(res);
        if (res.is_soft_deleted && res.user_id) {
          setRestoreUserId(res.user_id);
          return setStep('restore');
        }
        setOtp('');
        setStep('otp-social');
      } else {
        const res = await updateSocialMobile(base);
        await routeResponse(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async () => {
    if (!pending) return;
    setError(null);
    setSubmitting(true);
    try {
      if (step === 'otp-merge' && ownership) {
        const res = await verifyAndMergeAccounts({
          existing_user_id: ownership.id,
          phone: normalizePhone(phone),
          otp: otp.trim(),
          social_email: pending.email,
          medium: pending.medium,
          unique_id: pending.unique_id,
        });
        if (res.token) return await finish(res.token);
        setError(res.message || t('كود التحقق غلط — جرب تاني'));
      } else {
        const res = await verifyPhoneAndSetMobile({
          phone: normalizePhone(phone),
          otp: otp.trim(),
          email: pending.email,
          name: pending.name,
          medium: pending.medium,
          unique_id: pending.unique_id,
          user_id: pending.user_id ?? undefined,
        });
        if (res.token) return await finish(res.token);
        if (res.is_soft_deleted && res.user_id) {
          setRestoreUserId(res.user_id);
          return setStep('restore');
        }
        setError(res.message || t('كود التحقق غلط — جرب تاني'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmOwnership = async () => {
    if (!ownership) return;
    setError(null);
    setSubmitting(true);
    try {
      await sendOwnershipOtp({ existing_user_id: ownership.id, phone: normalizePhone(phone) });
      setOtp('');
      setStep('otp-merge');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRestore = async () => {
    if (!restoreUserId || !pending) return;
    setError(null);
    setSubmitting(true);
    try {
      await restoreDeletedAccount(restoreUserId);
      // replay the original login — backend now returns a token
      const res = await socialLogin({
        medium: pending.medium,
        unique_id: pending.unique_id,
        ...(pending.email ? { email: pending.email } : {}),
        ...(pending.name ? { name: pending.name } : {}),
        ...(pending.providerToken ? { token: pending.providerToken } : {}),
      });
      await routeResponse(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('حصلت مشكلة — جرب تاني'));
    } finally {
      setSubmitting(false);
    }
  };

  const dialogOpen = step !== 'idle' && step !== 'busy';

  return (
    <>
      <button
        type="button"
        onClick={startGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 h-12 rounded-xl border-2 border-ink bg-white font-black text-ink hover:bg-muted disabled:opacity-60 transition-colors"
      >
        {step === 'busy' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleG />}
        {t('كمّل بجوجل')}
      </button>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setStep('idle')}>
        <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-md">
          {step === 'phone' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-ink">{t('كمّل رقم موبايلك')}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-ink-mute">
                  {t('محتاجين رقمك عشان نكمل إنشاء حسابك')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  inputMode="tel"
                  dir="ltr"
                  className={`${inputCls} ${isAr ? 'text-right' : 'text-left'}`}
                />
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
                <button
                  onClick={submitPhone}
                  disabled={submitting || phone.trim().length < 10}
                  className="w-full h-12 rounded-xl bg-brand text-coal font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 transition-all"
                >
                  {submitting ? t('جاري الإرسال...') : t('كمّل')}
                </button>
              </div>
            </>
          )}

          {(step === 'otp-social' || step === 'otp-merge') && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-ink">{t('كود التحقق')}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-ink-mute">
                  {t('بعنالك كود على رقمك — اكتبه هنا')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="12345"
                  inputMode="numeric"
                  dir="ltr"
                  className={`${inputCls} text-center text-2xl tracking-[0.5em]`}
                />
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
                <button
                  onClick={submitOtp}
                  disabled={submitting || otp.length < 4}
                  className="w-full h-12 rounded-xl bg-brand text-coal font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 transition-all"
                >
                  {submitting ? t('جاري التحقق...') : t('تأكيد')}
                </button>
              </div>
            </>
          )}

          {step === 'ownership' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-ink">{t('الرقم ده مربوط بحساب تاني')}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-ink-mute">
                  {t('لو الحساب ده بتاعك، هنبعتلك كود تأكيد على رقمك ونربط حساب جوجل بنفس الحساب')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
                <button
                  onClick={confirmOwnership}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-brand text-coal font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 transition-all"
                >
                  {submitting ? t('جاري الإرسال...') : t('أيوه ده حسابي — ابعت الكود')}
                </button>
                <button
                  onClick={() => setStep('idle')}
                  className="w-full h-11 rounded-xl border-2 border-border font-black text-ink hover:border-ink transition-colors"
                >
                  {t('مش بتاعي')}
                </button>
              </div>
            </>
          )}

          {step === 'restore' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-ink">{t('حسابك ده متقفل')}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-ink-mute">
                  {t('عايز تسترجع حسابك القديم بدل ما تعمل حساب جديد؟')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
                <button
                  onClick={confirmRestore}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-brand text-coal font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 transition-all"
                >
                  {submitting ? t('جاري الاسترجاع...') : t('استرجع حسابي')}
                </button>
                <button
                  onClick={() => setStep('idle')}
                  className="w-full h-11 rounded-xl border-2 border-border font-black text-ink hover:border-ink transition-colors"
                >
                  {t('لأ، ارجع')}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
