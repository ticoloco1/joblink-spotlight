import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Key, Globe, Rocket, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { CENTER_URL, type StorefrontConfig } from '@/config/storefronts';

interface StorefrontLandingProps {
  storefront?: StorefrontConfig;
  hostname?: string;
}

const displayDomain = (host: string) => host.replace(/^www\./, '');

export default function StorefrontLanding({
  storefront,
  hostname,
}: StorefrontLandingProps) {
  const resolvedHostname =
    hostname ||
    (typeof window !== 'undefined' ? window.location.hostname : 'jobinlink.com');

  const resolvedStorefront: StorefrontConfig =
    storefront || {
      domain: resolvedHostname,
      name: 'JobinLink',
      slugPrefix: 's',
    };

  const [mode, setMode] = useState<'s' | 'handle'>(resolvedStorefront.slugPrefix);
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const domain = displayDomain(resolvedHostname);
  const prefix = mode === 'handle' ? '@' : '/';
  const placeholder = `${domain}/${prefix}${mode === 'handle' ? 'seuhandle' : 'sua-pagina'}`;

  const handleSearch = () => {
    const q = query.trim().replace(/^@|\/$/g, '').replace(/\s+/g, '-').toLowerCase();
    if (!q) {
      setSearchError('Digite um domínio ou handle.');
      return;
    }
    setSearchError('');
    const target = `${CENTER_URL}/marketplace?q=${encodeURIComponent(q)}`;
    window.location.href = target;
  };

  const features = [
    {
      title: 'Exclusive Ownership',
      titlePt: 'Propriedade Exclusiva',
      icon: Key,
      desc: 'Keywords are unique and locked to you while your plan is active.',
      descPt: 'Palavras-chave únicas e bloqueadas para você enquanto seu plano estiver ativo.',
      cta: 'ONE OF A KIND',
      href: `${CENTER_URL}/signup`,
      className: 'border-amber-500/30 bg-amber-500/5',
      iconClass: 'text-amber-500',
    },
    {
      title: 'Luxury Mini-Site',
      titlePt: 'Mini-Site Premium',
      icon: Globe,
      desc: 'Bio, videos, paywall, AI assistant, CV, links — indexed on Google from day one.',
      descPt: 'Bio, vídeos, paywall, assistente IA, CV, links — indexados no Google desde o primeiro dia.',
      cta: null,
      href: null,
      className: 'border-blue-500/30 bg-blue-500/5',
      iconClass: 'text-blue-500',
    },
    {
      title: 'Rise in Rankings',
      titlePt: 'Suba no Ranking',
      icon: Rocket,
      desc: 'Boost your position in the directory for $1.50 per spot — increase global visibility.',
      descPt: 'Impulsione sua posição no diretório por $1,50 por posição — maior visibilidade global.',
      cta: 'BOOST SYSTEM',
      href: `${CENTER_URL}/directory`,
      className: 'border-emerald-500/30 bg-emerald-500/5',
      iconClass: 'text-emerald-500',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{resolvedStorefront.name} — One keyword. Infinite authority.</title>
        <meta
          name="description"
          content={`Buscar e comprar domínios e slugs em ${resolvedStorefront.name}. Mini-sites no JobinLink.`}
        />
        <meta property="og:title" content={`${resolvedStorefront.name} | ${domain}`} />
        <link rel="canonical" href={`https://${domain}`} />
      </Helmet>

      {/* Nav mínima para vitrine */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-bold text-foreground">{resolvedStorefront.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${CENTER_URL}/login`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Login
            </a>
            <a href={`${CENTER_URL}/signup`}>
              <Button size="sm" className="bg-primary text-primary-foreground">
                Criar conta
              </Button>
            </a>
            <a
              href={CENTER_URL}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              JobinLink
            </a>
          </div>
        </div>
      </nav>

      <main className="min-h-screen">
        {/* Hero + Busca */}
        <section className="border-b border-border bg-muted/20 py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight md:text-5xl"
            >
              One keyword. <span className="text-primary">Infinite authority.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-muted-foreground"
            >
              Uma palavra-chave. Autoridade infinita.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 rounded-xl border border-border bg-card p-4 shadow-sm md:p-6"
            >
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Buscar e comprar domínios / slugs
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-lg border border-border bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('s')}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === 's' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    /s Página
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('handle')}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'handle' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    /@ Handle
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{domain}/{prefix}</span>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setSearchError(''); }}
                      placeholder={mode === 'handle' ? 'seuhandle' : 'sua-pagina'}
                      className="ml-1 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button onClick={handleSearch} className="gap-2 bg-primary text-primary-foreground">
                    <Search className="h-4 w-4" /> Buscar
                  </Button>
                </div>
              </div>
              {searchError && (
                <p className="mt-2 text-sm text-destructive">{searchError}</p>
              )}
            </motion.div>
          </div>
        </section>

        {/* 3 colunas */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`rounded-2xl border p-6 ${f.className}`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-current/10 ${f.iconClass}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.titlePt}</p>
                  <p className="mt-3 text-sm text-foreground/90">{f.descPt}</p>
                  {f.cta && f.href && (
                    <a href={f.href} className="mt-4 block">
                      <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                        {f.cta}
                      </Button>
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA centro */}
        <section className="border-t border-border bg-muted/20 py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Mini-sites, dashboard e gestão em um só lugar.
            </p>
            <a href={CENTER_URL} className="mt-4 inline-block font-semibold text-primary hover:underline">
              Acessar JobinLink →
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by <a href={CENTER_URL} className="font-medium text-foreground hover:underline">JobinLink</a>
        </div>
      </footer>
    </>
  );
}
