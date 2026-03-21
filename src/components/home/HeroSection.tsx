import { Link } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";

const HeroSection = () => (
  <section className="relative overflow-hidden py-24 px-6" style={{ background: "linear-gradient(135deg, hsl(220 60% 14%), hsl(220 55% 22%), hsl(43 90% 30%))" }}>
    <div className="max-w-5xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full mb-6 text-sm font-bold text-white/90">
        <Globe className="w-4 h-4" /> Your professional presence starts here
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5 text-white">
        Create Your <span style={{ color: "hsl(43 90% 55%)" }}>Mini Site</span>
        <br />
        <span className="text-2xl md:text-3xl font-bold text-white/75">Links, Videos, CV & Portfolio — all in one page</span>
      </h1>
      <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
        Build your personal page with paywall videos, professional CV, photo gallery, social links and more.
        Companies pay to unlock your CV. You earn <strong className="text-white">50% of every unlock</strong>.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/site/edit"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg shadow-lg transition-opacity hover:opacity-90"
          style={{ background: "hsl(43 90% 50%)", color: "hsl(220 60% 12%)" }}
        >
          Create Your Mini Site <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
        >
          How It Works
        </Link>
      </div>
    </div>
    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: "hsl(43 90% 50% / 0.15)" }} />
    <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ background: "hsl(43 90% 50% / 0.08)" }} />
  </section>
);

export default HeroSection;
