import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
              <span className="text-sm font-bold font-display text-primary-foreground">J</span>
            </div>
            <span className="font-display font-bold text-foreground">JobinLink</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          <div className="flex gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">{t('nav.home')}</Link>
            <Link to="/directory" className="text-sm text-muted-foreground hover:text-foreground">{t('nav.directory')}</Link>
            <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">{t('nav.marketplace')}</Link>
            <Link to="/advertise" className="text-sm text-muted-foreground hover:text-foreground">Advertise</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} JobinLink. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
