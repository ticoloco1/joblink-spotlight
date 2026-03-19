import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language, languageNames } from '@/i18n/translations';
import { Globe, Menu, X, LayoutDashboard, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';
import SlugTicker from '@/components/SlugTicker';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc('is_admin', { _user_id: user.id }).then(({ data }) => {
      if (data === true) setIsAdmin(true);
    }).catch(() => setIsAdmin(false));
  }, [user]);

  const languages: Language[] = ['en', 'pt', 'es', 'fr'];

  return (
    <>
      <SlugTicker />
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={typeof logoImg === 'string' ? logoImg : logoImg.src} alt="JobinLink" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-xl font-bold font-display text-foreground">JobinLink</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.home')}
          </Link>
          <Link to="/directory" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.directory')}
          </Link>
          <Link to="/jobs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.jobs')}
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.howItWorks')}
          </Link>
          <Link to="/videos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.videos')}
          </Link>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.pricing')}
          </a>
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.marketplace')}
          </Link>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              {languageNames[language]}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 rounded-lg border border-border bg-popover p-1 shadow-elevated">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted ${lang === language ? 'font-semibold text-primary' : 'text-popover-foreground'}`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Shield className="h-4 w-4 mr-1" /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-hero text-primary-foreground border-0">
                  {t('nav.signup')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>

        {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.home')}</Link>
            <Link to="/directory" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.directory')}</Link>
            <Link to="/jobs" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.jobs')}</Link>
            <Link to="/how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.howItWorks')}</Link>
            <Link to="/videos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.videos')}</Link>
            <a href="/#pricing" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.pricing')}</a>
            <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{t('nav.marketplace')}</Link>
            <div className="flex gap-2 pt-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); }}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${lang === language ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30">
                        <Shield className="h-4 w-4 mr-1" /> Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { signOut(); setMobileOpen(false); }}>
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full gradient-hero text-primary-foreground border-0">{t('nav.signup')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
    </>
  );
};

export default Navbar;
