import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, FileText, Search, Globe, Lock, Languages, Star, Briefcase, Crown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import { Helmet } from 'react-helmet-async';
import heroBanner from '@/assets/hero-banner.jpg';

const featureIcons = [User, FileText, Search, Globe, Lock, Languages];

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { key: 'minisite', icon: featureIcons[0] },
    { key: 'cv', icon: featureIcons[1] },
    { key: 'seo', icon: featureIcons[2] },
    { key: 'directory', icon: featureIcons[3] },
    { key: 'privacy', icon: featureIcons[4] },
    { key: 'multilang', icon: featureIcons[5] },
  ];

  const seekerFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'];
  const companyFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'];

  return (
    <>
      <Helmet>
        <title>JobinLink — Your Professional Identity, One Link Away</title>
        <meta name="description" content="Create your professional mini-site with CV, portfolio, and links. Get discovered by top companies worldwide. JobinLink connects job seekers with employers." />
        <link rel="canonical" href="https://jobinlink.com" />
        <meta property="og:title" content="JobinLink — Professional Mini-Sites & CV Directory" />
        <meta property="og:description" content="Create your professional mini-site with CV, portfolio, and links. Get discovered by top companies worldwide." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jobinlink.com" />
        <meta property="og:image" content="https://jobinlink.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JobinLink — Your Professional Identity, One Link Away" />
        <meta name="twitter:description" content="Create your professional mini-site with CV, portfolio, and links." />
        <meta name="keywords" content="professional profile, CV, portfolio, mini-site, job search, recruitment, career, resume builder" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "JobinLink",
          url: "https://jobinlink.com",
          description: "Create your professional mini-site with CV, portfolio, and links. Get discovered by top companies worldwide.",
          applicationCategory: "BusinessApplication",
          offers: [
            { "@type": "Offer", name: "Job Seeker", price: "40", priceCurrency: "USD", billingDuration: "P1Y" },
            { "@type": "Offer", name: "Company", price: "799", priceCurrency: "USD", billingDuration: "P1Y" },
          ],
        })}</script>
      </Helmet>
      <Navbar />
      <AdBanner placement="header" className="py-2 bg-muted/30" />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0">
            <img src={heroBanner.src} alt="Professional networking" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
            >
              {t('hero.title')}{' '}
              <span className="text-gradient">{t('hero.titleHighlight')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/signup">
                <Button size="lg" className="gradient-hero text-primary-foreground border-0 px-8 text-base shadow-soft">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/directory">
                <Button size="lg" variant="outline" className="px-8 text-base bg-background/60 backdrop-blur-sm">
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{t('features.title')}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t('features.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ key, icon: Icon }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-hero">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t(`features.${key}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28 gradient-warm">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{t('pricing.title')}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t('pricing.subtitle')}</p>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Job Seeker */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-8 shadow-card"
              >
                <h3 className="text-xl font-semibold">{t('pricing.jobseeker')}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{t('pricing.jobseeker.price')}</span>
                  <span className="text-muted-foreground">{t('pricing.jobseeker.period')}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {seekerFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {t(`pricing.jobseeker.${f}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full gradient-hero text-primary-foreground border-0">
                    {t('pricing.jobseeker.cta')}
                  </Button>
                </Link>
              </motion.div>

              {/* Company */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-elevated"
              >
                <div className="absolute -top-3 right-6 rounded-full gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Popular
                </div>
                <h3 className="text-xl font-semibold">{t('pricing.company')}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{t('pricing.company.price')}</span>
                  <span className="text-muted-foreground">{t('pricing.company.period')}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {companyFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {t(`pricing.company.${f}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full gradient-hero text-primary-foreground border-0">
                    {t('pricing.company.cta')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Premium Plans */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{t('premium.title')}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t('premium.subtitle')}</p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              {/* Featured User */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold">{t('premium.featured.title')}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$200</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t('premium.featured.desc')}</p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t('premium.featured.f1')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t('premium.featured.f2')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t('premium.featured.f3')}</li>
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full border-amber-500 text-amber-600 hover:bg-amber-50" variant="outline">
                    {t('premium.featured.cta')}
                  </Button>
                </Link>
              </motion.div>

              {/* Job Posting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border-2 border-primary bg-card p-8 shadow-elevated relative"
              >
                <div className="absolute -top-3 right-6 rounded-full gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Popular
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{t('premium.jobs.title')}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$400</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t('premium.jobs.desc')}</p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" />{t('premium.jobs.f1')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" />{t('premium.jobs.f2')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" />{t('premium.jobs.f3')}</li>
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full gradient-hero text-primary-foreground border-0">
                    {t('premium.jobs.cta')}
                  </Button>
                </Link>
              </motion.div>

              {/* Featured Highlight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-8 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                  <Crown className="h-6 w-6 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold">{t('premium.highlight.title')}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t('premium.highlight.desc')}</p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-violet-500" />{t('premium.highlight.f1')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-violet-500" />{t('premium.highlight.f2')}</li>
                  <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-violet-500" />{t('premium.highlight.f3')}</li>
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full border-violet-500 text-violet-600 hover:bg-violet-50" variant="outline">
                    {t('premium.highlight.cta')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <AdBanner placement="footer" className="py-2 bg-muted/30" />
      <Footer />
    </>
  );
};

export default Index;
