'use client';
import { useLanguage } from '@/i18n/LanguageContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Search, Rocket, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoostBar from '@/components/BoostBar';
import { Helmet } from 'react-helmet-async';
import { demoDirectoryProfiles } from '@/data/demoContent';


interface DirectoryProfile {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  location: string | null;
  photo_url: string | null;
  bio: string | null;
  skills: string[] | null;
  user_type: string;
  boost_score: number;
  homepage_until: string | null;
  paywall_enabled?: boolean;
  paywall_mode?: string;
  isDemo?: boolean;
}

const Directory = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sealsConfig, setSealsConfig] = useState({
    enabled: true,
    personMinBoost: 1,
    companyMinBoost: 1,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);

    // Config do selo (editável no Admin)
    const keys = [
      'directory_seals_enabled',
      'directory_person_seal_min_boost',
      'directory_company_seal_min_boost',
    ];
    const { data: settingsData } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', keys)
      .eq('category', 'directory');

    const settingsMap = new Map<string, string>((settingsData || []).map((s: any) => [s.key, s.value]));
    const enabledRaw = settingsMap.get('directory_seals_enabled');
    const enabled =
      enabledRaw === undefined || enabledRaw === null ? true : ['true', '1'].includes(String(enabledRaw).toLowerCase());
    const personMinBoost = Number(settingsMap.get('directory_person_seal_min_boost') ?? 1);
    const companyMinBoost = Number(settingsMap.get('directory_company_seal_min_boost') ?? 1);

    setSealsConfig({
      enabled,
      personMinBoost: Number.isFinite(personMinBoost) ? personMinBoost : 1,
      companyMinBoost: Number.isFinite(companyMinBoost) ? companyMinBoost : 1,
    });

    // Perfis do diretório
    const { data } = await supabase
      .from('profiles')
      .select(
        'id, slug, name, title, location, photo_url, bio, skills, user_type, boost_score, homepage_until, paywall_enabled, paywall_mode'
      )
      .eq('is_published', true)
      .order('boost_score', { ascending: false })
      .order('updated_at', { ascending: false });

    const loaded = (data as DirectoryProfile[]) || [];
    setProfiles(loaded.length > 0 ? loaded : (demoDirectoryProfiles as DirectoryProfile[]));
    setLoading(false);
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q) ||
      (p.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleBoosted = (profileId: string, newScore: number) => {
    setProfiles(prev =>
      prev.map(p => p.id === profileId ? { ...p, boost_score: newScore } : p)
        .sort((a, b) => b.boost_score - a.boost_score)
    );
  };

  const defaultPhoto = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face';

  return (
    <>
      <Helmet>
        <title>{t('directory.title')} | JobinLink</title>
        <meta name="description" content={t('directory.subtitle')} />
        <link rel="canonical" href="https://jobinlink.com/directory" />
        <meta property="og:title" content={`${t('directory.title')} | JobinLink`} />
        <meta property="og:description" content={t('directory.subtitle')} />
        <meta property="og:url" content="https://jobinlink.com/directory" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t('directory.title'),
            description: t('directory.subtitle'),
            url: "https://jobinlink.com/directory",
            isPartOf: { "@type": "WebSite", name: "JobinLink", url: "https://jobinlink.com" },
          })}
        </script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen">
        <section className="gradient-warm py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold md:text-5xl">{t('directory.title')}</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t('directory.subtitle')}</p>
            <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 shadow-card">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('directory.search')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="py-20 text-center text-muted-foreground">Loading...</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((profile, i) => {
                  const prefix = profile.user_type === 'company' ? 'c' : 'u';
                  const isOnHomepage = profile.homepage_until && new Date(profile.homepage_until) > new Date();
                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <div className={`rounded-xl border bg-card shadow-card transition-all hover:shadow-elevated ${isOnHomepage ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        <Link
                          href={`/${prefix}/${profile.slug}`}
                          className="group block p-6"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={profile.photo_url || defaultPhoto}
                              alt={profile.name}
                              className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                              loading="lazy"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h2 className="truncate text-lg font-semibold group-hover:text-primary transition-colors">
                                  {profile.name}
                                </h2>

                                {sealsConfig.enabled &&
                                  (profile.user_type === 'company'
                                    ? profile.boost_score >= sealsConfig.companyMinBoost
                                    : profile.boost_score >= sealsConfig.personMinBoost) && (
                                    <span
                                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                        profile.user_type === 'company'
                                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                          : 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                                      }`}
                                      aria-label={profile.user_type === 'company' ? 'Gold seal' : 'Blue seal'}
                                    >
                                      <Star className="h-3 w-3" />
                                    </span>
                                  )}

                                {profile.boost_score > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-primary font-semibold">
                                    <Rocket className="h-3 w-3" /> {profile.boost_score}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {profile.title ||
                                  (profile.user_type === 'company' ? t('auth.company') : t('auth.seeker'))}
                              </p>
                              {profile.paywall_enabled && profile.paywall_mode && profile.paywall_mode !== 'none' && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {t('directory.paywallTeaser')}
                                  </span>
                                </div>
                              )}
                              {profile.location && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {profile.location}
                                </div>
                              )}
                            </div>
                          </div>
                          {profile.skills && profile.skills.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {profile.skills.slice(0, 4).map((skill) => (
                                <span key={skill} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                  {skill}
                                </span>
                              ))}
                              {profile.skills.length > 4 && (
                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                  +{profile.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                          {profile.bio && (
                            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
                          )}
                        </Link>
                        {/* Boost Bar */}
                        {!profile.isDemo && (
                          <div className="px-6 pb-4">
                            <BoostBar
                              profileId={profile.id}
                              profileName={profile.name}
                              boostScore={profile.boost_score}
                              homepageUntil={profile.homepage_until}
                              onBoosted={(newScore) => handleBoosted(profile.id, newScore)}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <p className="py-20 text-center text-muted-foreground">No professionals found matching your search.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Directory;
