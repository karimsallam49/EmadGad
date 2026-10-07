import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/auth';
import { useLang } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = t('مطلوب');
    if (!lastName.trim()) e.lastName = t('مطلوب');
    if (!mobile.trim()) e.mobile = t('مطلوب');
    if (!email.trim()) e.email = t('مطلوب');
    else if (!EMAIL_RE.test(email)) e.email = t('البريد الإلكتروني غير صحيح');
    if (!password) e.password = t('مطلوب');
    else if (password.length < 6) e.password = t('كلمة المرور 6 أحرف على الأقل');
    if (confirmPassword !== password) e.confirmPassword = t('كلمة المرور غير متطابقة');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const field = (key: string, setter: (v: string) => void) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        mobile: mobile.trim(),
        email: email.trim(),
        password,
      });
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'AUTO_LOGIN_FAILED'
          ? t('تم إنشاء الحساب بس تسجيل الدخول فشل — سجّل دخول يدويًا')
          : err instanceof Error
            ? err.message
            : t('فشل إنشاء الحساب'),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (key: string) =>
    `h-12 text-base ${errors[key] ? 'border-red-500' : ''}`;
  const fieldErr = (key: string) =>
    errors[key] ? <p className="mt-1 text-[11px] font-bold text-red-600">{errors[key]}</p> : null;

  return (
    <div className="min-h-screen bg-paper py-20 px-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-black text-ink text-center">{t('إنشاء حساب')}</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-[0_8px_0_#f6c744]">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('الاسم الأول')}</label>
              <Input value={firstName} {...field('firstName', setFirstName)} placeholder={t('اسمك')} className={inputCls('firstName')} />
              {fieldErr('firstName')}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('اسم العيلة')}</label>
              <Input value={lastName} {...field('lastName', setLastName)} placeholder={t('العيلة')} className={inputCls('lastName')} />
              {fieldErr('lastName')}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('رقم الموبايل')}</label>
            <Input value={mobile} {...field('mobile', setMobile)} placeholder="01xxxxxxxxx" inputMode="tel" className={inputCls('mobile')} />
            {fieldErr('mobile')}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('البريد الإلكتروني')}</label>
            <Input value={email} {...field('email', setEmail)} type="email" placeholder="email@example.com" className={inputCls('email')} />
            {fieldErr('email')}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('كلمة المرور')}</label>
            <Input value={password} {...field('password', setPassword)} type="password" placeholder="••••••••" className={inputCls('password')} />
            {fieldErr('password')}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('تأكيد كلمة المرور')}</label>
            <Input value={confirmPassword} {...field('confirmPassword', setConfirmPassword)} type="password" placeholder="••••••••" className={inputCls('confirmPassword')} />
            {fieldErr('confirmPassword')}
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-black">
            {loading ? t('جاري التسجيل...') : t('سجّل')}
          </Button>
          <div className="flex items-center gap-3 text-xs font-black text-ink-mute">
            <span className="h-px flex-1 bg-border" />
            {t('أو')}
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleAuthButton />
          <p className="text-center text-sm font-bold text-ink-mute">
            {t('عندك حساب؟')}{' '}
            <Link to="/login" className="font-black text-ink underline hover:text-brand">
              {t('دخول')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
