import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { useSettings } from "@/hooks/useSettings";
import HeroSection from "@/components/home/HeroSection";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import MiniSiteShowcase from "@/components/home/MiniSiteShowcase";
import DirectorySection from "@/components/home/DirectorySection";

const Index = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="HASHPO – Mini Sites, Paywall Videos & Jobs"
        description="Create your professional mini site with links, paywall videos, CV and portfolio. Companies pay to unlock CVs. Earn 50% of every unlock."
      />
      <Header />
      <HeroSection />
      <FeaturesGrid />
      <MiniSiteShowcase />
      <DirectorySection />

      <footer className="bg-primary text-primary-foreground py-4 px-6">
        <p className="text-[9px] font-mono text-center opacity-70">
          {(settings as any)?.footer_text || "HASHPO IS A TECH PLATFORM. CONTENT IS CREATOR RESPONSIBILITY. © 2026 HASHPO"}
        </p>
      </footer>
    </div>
  );
};

export default Index;
