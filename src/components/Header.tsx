import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Languages, LogIn, Menu, Moon, ShoppingCart, Sun, User, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/auth';
import { useCart } from '@/cart';
import { useLang } from '@/i18n';
import { useTheme } from '@/theme';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { NotificationBell } from '@/components/Notifications';
import { WhatsAppIcon } from './art';

const NAV = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الإطارات', to: '/tires' },
  { label: 'البطاريات', to: '/batteries' },
  { label: 'خدمات السيارات', to: '/services' },
  { label: 'الأقسام', to: '/taxonomy' },
  { label: 'فروعنا', to: '/branches' },
];

/** Arabic ⇄ English switcher */
export function LangToggle({ className = '' }: { className?: string }) {
  const { isAr, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border px-3 h-10 text-sm font-extrabold text-ink hover:border-ink transition-colors ${className}`}
    >
      <Languages className="h-4 w-4" />
      {isAr ? 'EN' : 'عربي'}
    </button>
  );
}

/** Light ⇄ Dark switcher */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('الوضع الفاتح') : t('الوضع الداكن')}
      title={isDark ? t('الوضع الفاتح') : t('الوضع الداكن')}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink hover:border-ink transition-colors ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Logo({ className = 'h-9' }: { className?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="EmadGad - الرئيسية">
      <span className="inline-flex items-center rounded-lg px-1.5 py-1 dark:bg-brand transition-colors">
        <img src="/assets/logo-dark.png" alt="EmadGad" width={638} height={141} className={`${className} w-auto`} />
      </span>
    </Link>
  );
}

export default function Header() {
  const { user } = useAuth();
  const { count } = useCart();
  const { t, num } = useLang();
  const waUrl = useWhatsappUrl();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
      isActive ? 'bg-coal text-brand' : 'text-ink hover:bg-brand-light'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-border transition-shadow ${
        scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.08)]' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Logo className="h-8" />

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navCls}>
                {t(item.label)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <LangToggle className="hidden sm:inline-flex" />

            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 h-10 text-sm font-extrabold hover:opacity-90 transition-opacity"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t('واتساب')}
            </a>

            <NotificationBell />

            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-coal text-brand hover:bg-coal-soft transition-colors"
              aria-label={t('السلة')}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -start-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand text-coal text-[11px] font-black px-1 border-2 border-white">
                  {num(count)}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="inline-flex h-10 w-10 sm:w-auto sm:px-4 items-center justify-center gap-2 rounded-full bg-brand text-sm font-extrabold text-coal hover:bg-brand/90 transition-colors"
                title={t('حسابي')}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-10 w-10 sm:w-auto sm:px-4 items-center justify-center gap-2 rounded-full border border-border text-sm font-extrabold text-ink hover:border-ink transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t('دخول')}</span>
              </Link>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
                  aria-label={t('القائمة')}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Logo className="h-8" />
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted"
                    aria-label={t('إغلاق')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex flex-col p-3" aria-label="Mobile menu">
                  {NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-3.5 rounded-xl text-base font-bold ${isActive ? 'bg-coal text-brand' : 'hover:bg-brand-light'}`
                      }
                    >
                      {t(item.label)}
                    </NavLink>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <LangToggle className="flex-1 justify-center h-12 rounded-xl" />
                    <ThemeToggle className="h-12 w-12 rounded-xl shrink-0" />
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white h-12 font-extrabold"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    {t('كلمنا واتساب')}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
