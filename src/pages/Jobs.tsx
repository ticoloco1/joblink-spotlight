'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Search, Briefcase, Clock } from 'lucide-react';
import { demoJobs } from '@/data/demoContent';

interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  skills: string[] | null;
  created_at: string;
  isDemo?: boolean;
}


const Jobs = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title, description, location, job_type, salary_range, skills, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const loaded = (data as Job[]) || [];
    setJobs(loaded.length > 0 ? loaded : (demoJobs as Job[]));
    setLoading(false);
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      (j.description || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.skills || []).some(s => s.toLowerCase().includes(q))
    );
  });

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <>
      <Helmet>
        <title>Job Listings — Find Your Next Opportunity | JobinLink</title>
        <meta
          name="description"
          content="Browse the latest job listings from top companies. Find full-time, part-time, and remote opportunities on JobinLink."
        />
        <link rel="canonical" href="https://jobinlink.com/jobs" />
        <meta property="og:title" content="Job Listings | JobinLink" />
        <meta property="og:description" content="Browse the latest job listings from top companies worldwide." />
        <meta property="og:url" content="https://jobinlink.com/jobs" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Job Listings",
            description: "Browse job listings from top companies worldwide.",
            url: "https://jobinlink.com/jobs",
            isPartOf: { "@type": "WebSite", name: "JobinLink", url: "https://jobinlink.com" },
          })}
        </script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen">
        <section className="gradient-warm py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold md:text-5xl">Job Listings</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Find your next opportunity from top companies worldwide.
            </p>
            <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 shadow-card">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, skill, or location..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {loading ? (
              <p className="py-20 text-center text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No job listings found. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{job.title}</h2>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          )}
                          {job.job_type && (
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.job_type}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      {job.salary_range && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{job.salary_range}</span>
                      )}
                    </div>
                    {job.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                    )}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 6).map(skill => (
                          <span key={skill} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{skill}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Jobs;
