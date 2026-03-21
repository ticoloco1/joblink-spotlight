import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import AvatarMenu from "@/components/AvatarMenu";
import WalletButton from "@/components/WalletButton";
import NotificationBell from "@/components/NotificationBell";
import VerificationModal from "@/components/VerificationModal";
import { TrendingUp, HelpCircle, ShoppingBag, Briefcase, Crown, Globe, BadgeCheck, Link2 } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { data: settings } = useSettings();
  const { user } = useAuth();
  const [showVerification, setShowVerification] = useState(false);

  const platformName = settings?.platform_name || "HASHPO";
  const logoUrl = settings?.logo_url;

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 sticky top-0 z-50 bg-primary border-b-2 border-accent">
        <Link to="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={platformName} className="h-8 w-auto object-contain" />
          ) : (
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          )}
          <div className="flex flex-col">
            <span className="text-primary-foreground font-black text-lg tracking-tight font-mono leading-none">
              {platformName}
            </span>
            <span className="text-accent text-[8px] font-mono uppercase tracking-[0.2em] leading-none font-bold">
              Videos • Mini Sites • Jobs
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/how-it-works" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <HelpCircle className="w-3.5 h-3.5" /> How It Works
          </Link>
          <Link to="/marketplace" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" /> Marketplace
          </Link>
          <Link to="/domains" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Globe className="w-3.5 h-3.5" /> Domains
          </Link>
          <Link to="/slugs" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Slugs
          </Link>
          <Link to="/careers" className="hidden sm:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Briefcase className="w-3.5 h-3.5" /> Jobs
          </Link>
          <Link to="/site/edit" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Crown className="w-3.5 h-3.5" /> Mini Site
          </Link>
          {user && (
            <button onClick={() => setShowVerification(true)} className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
              <BadgeCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <WalletButton />
          <NotificationBell />
          <AvatarMenu />
        </nav>
      </header>
      {user && <VerificationModal open={showVerification} onClose={() => setShowVerification(false)} />}
    </>
  );
};

export default Header;
