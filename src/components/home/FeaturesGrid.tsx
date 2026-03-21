import { Link2, Video, FileText, Image, Lock, Zap, Globe, DollarSign } from "lucide-react";

const features = [
  { icon: Globe, title: "Custom Subdomain", desc: "Get your own hashpo.com/s/your-name page with a unique slug." },
  { icon: Link2, title: "Social Links", desc: "Add all your social profiles, website, portfolio links in one place." },
  { icon: Video, title: "Paywall Videos", desc: "Upload videos and set a price. Viewers pay to watch your premium content." },
  { icon: FileText, title: "Professional CV", desc: "Add your experience, skills, education and portfolio. Companies pay $20 to unlock." },
  { icon: Image, title: "Photo Gallery", desc: "Upload profile photos, banners and showcase your visual work." },
  { icon: Lock, title: "CV Paywall", desc: "Your CV stays locked. Each unlock earns you $10 (50/50 split with platform)." },
  { icon: Zap, title: "Boost to Featured", desc: "Boost your mini site, CV or videos to appear in the featured section." },
  { icon: DollarSign, title: "Earn Revenue", desc: "Monetize your content, CV and professional presence — all from one page." },
];

const FeaturesGrid = () => (
  <section className="py-16 px-6 bg-secondary/30">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-center mb-3 text-foreground">
        Everything You Need in One Page
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Your mini site is your digital business card, portfolio, and revenue engine.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => (
          <div key={f.title} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <f.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-black text-foreground mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
