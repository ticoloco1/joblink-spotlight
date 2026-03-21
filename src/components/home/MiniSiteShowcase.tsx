import { Link } from "react-router-dom";
import { Globe, Link2, Video, FileText, Palette, GripVertical, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "1. Crie seu Mini Site",
    desc: "Escolha seu slug único, adicione foto, bio e escolha entre 20 temas.",
    mockup: (
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-xl p-4 text-center space-y-2 h-full">
        <div className="w-10 h-10 rounded-full bg-purple-500 mx-auto" />
        <div className="h-3 w-20 bg-white/30 rounded mx-auto" />
        <div className="h-2 w-32 bg-white/15 rounded mx-auto" />
        <div className="h-2 w-28 bg-white/10 rounded mx-auto" />
      </div>
    ),
  },
  {
    icon: Palette,
    title: "2. Personalize Tudo",
    desc: "40 cores de texto, imagem de fundo, vídeo de apresentação, tamanho de fonte e foto.",
    mockup: (
      <div className="bg-gradient-to-b from-cyan-900 to-blue-900 rounded-xl p-4 space-y-2 h-full">
        <div className="flex gap-1.5 flex-wrap">
          {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c084fc", "#fb923c"].map(c => (
            <div key={c} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="h-2 w-24 bg-cyan-400/30 rounded" />
        <div className="h-12 bg-white/10 rounded-lg" />
        <div className="h-2 w-16 bg-white/20 rounded" />
      </div>
    ),
  },
  {
    icon: Link2,
    title: "3. Adicione Links",
    desc: "Instagram, YouTube, TikTok, X e mais — todos em um lugar com ícones sociais.",
    mockup: (
      <div className="bg-white rounded-xl p-3 space-y-1.5 h-full">
        {["Instagram", "YouTube", "TikTok"].map(n => (
          <div key={n} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-accent/30" />
            <span className="text-[10px] font-bold text-gray-700">{n}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Video,
    title: "4. Vídeos com Paywall",
    desc: "Publique vídeos do YouTube e cobre por acesso — NFT ou paywall simples.",
    mockup: (
      <div className="bg-gray-900 rounded-xl p-3 space-y-2 h-full">
        <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 bg-white/20 rounded" />
          <span className="text-[9px] font-bold text-green-400">$0.60</span>
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "5. CV Profissional",
    desc: "Adicione experiência, educação, skills. Empresas pagam $20 para ver seu contato.",
    mockup: (
      <div className="bg-amber-50 rounded-xl p-3 space-y-2 h-full">
        <div className="h-2.5 w-28 bg-amber-900/20 rounded" />
        <div className="h-2 w-20 bg-amber-900/10 rounded" />
        <div className="flex gap-1 flex-wrap">
          {["React", "Node", "Python"].map(s => (
            <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-200/60 text-amber-800 rounded-full">{s}</span>
          ))}
        </div>
        <div className="bg-amber-100 rounded-lg p-2 mt-1">
          <div className="h-2 w-16 bg-amber-900/15 rounded mb-1" />
          <div className="h-1.5 w-24 bg-amber-900/10 rounded" />
        </div>
      </div>
    ),
  },
  {
    icon: GripVertical,
    title: "6. Drag & Drop",
    desc: "Reordene os módulos — Feed, Links, Vídeos, Mapa, Apresentação — como quiser.",
    mockup: (
      <div className="bg-slate-900 rounded-xl p-3 space-y-1.5 h-full">
        {["📝 Feed", "🔗 Links", "🎬 Vídeos", "📍 Mapa"].map((m) => (
          <div key={m} className="flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded-lg border border-white/10 text-[10px] text-white/80 font-bold">
            <GripVertical className="w-3 h-3 text-white/30" />
            {m}
          </div>
        ))}
      </div>
    ),
  },
];

const MiniSiteShowcase = () => (
  <section className="py-16 px-6 bg-secondary/30">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-center mb-3 text-foreground">
        Como Funciona o Mini Site
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Crie sua presença profissional em minutos. Veja as funcionalidades:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div key={step.title} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="h-40 p-3">{step.mockup}</div>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-sm font-black text-foreground">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/site/edit"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm shadow-lg transition-opacity hover:opacity-90 bg-accent text-accent-foreground"
        >
          Criar Meu Mini Site <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default MiniSiteShowcase;
