import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, Palette, Eye, Rocket, DollarSign, Video, Share2, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: UserPlus, key: 'step1', color: 'bg-primary/10 text-primary' },
    { icon: Palette, key: 'step2', color: 'bg-accent/10 text-accent' },
    { icon: Eye, key: 'step3', color: 'bg-secondary text-secondary-foreground' },
    { icon: Rocket, key: 'step4', color: 'bg-amber-500/10 text-amber-600' },
  ];

  const highlights = [
    { icon: Video, key: 'video' },
    { icon: Share2, key: 'social' },
    { icon: DollarSign, key: 'earn' },
    { icon: Shield, key: 'privacy' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('how.meta.title')}</title>
        <meta name="description" content={t('how.meta.desc')} />
      </Helmet>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 gradient-warm">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold md:text-5xl lg:text-6xl"
            >
              {t('how.hero.title')}{' '}
              <span className="text-gradient">{t('how.hero.highlight')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              {t('how.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold md:text-4xl">{t('how.steps.title')}</h2>
            <div className="mx-auto mt-16 max-w-4xl space-y-12">
              {steps.map(({ icon: Icon, key, color }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-start gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mt-2 h-12 w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-muted-foreground">
                        {t('how.step')} {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">{t(`how.${key}.title`)}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{t(`how.${key}.desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-20 md:py-28 gradient-warm">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold md:text-4xl">{t('how.highlights.title')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{t('how.highlights.subtitle')}</p>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map(({ icon: Icon, key }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 text-center shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-hero">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">{t(`how.hl.${key}.title`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t(`how.hl.${key}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Free model explanation */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl rounded-2xl border-2 border-primary bg-card p-10 shadow-elevated"
            >
              <h2 className="text-3xl font-bold">{t('how.free.title')}</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t('how.free.desc')}</p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/signup">
                  <Button size="lg" className="gradient-hero text-primary-foreground border-0 px-8">
                    {t('how.free.cta')}
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button size="lg" variant="outline" className="px-8">
                    {t('how.free.templates')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorks;
