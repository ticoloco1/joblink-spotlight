import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdBanner from "@/components/AdBanner";
import {
  Search, Globe, Lock, ExternalLink, Video, FileText,
  Zap, Play, Eye, DollarSign, Briefcase, MapPin
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const BOOST_PRICE = 1.50;
const BOOST_HOMEPAGE_PRICE = 1000;
const BOOST_HOMEPAGE_DAYS = 7;

/* ─── hooks ─── */
function useDirectorySites() {
  return useQuery({
    queryKey: ["directory-sites"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, show_cv, contact_price, published, boost_rank, boost_expires_at")
        .eq("published", true)
        .eq("blocked", false)
        .order("boost_rank", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });
}

function useDirectoryCVs() {
  return useQuery({
    queryKey: ["directory-cvs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, show_cv, contact_price, cv_headline, cv_location, cv_skills, boost_rank, boost_expires_at")
        .eq("published", true)
        .eq("show_cv", true)
        .eq("blocked", false)
        .order("boost_rank", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });
}

function useDirectoryVideos() {
  return useQuery({
    queryKey: ["directory-videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_site_videos")
        .select("id, site_id, title, thumbnail_url, nft_enabled, nft_price, paywall_enabled, paywall_price, user_id, created_at, mini_sites:site_id(slug, site_name, avatar_url, boost_rank, boost_expires_at)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });
}

function useDirectoryJobs() {
  return useQuery({
    queryKey: ["directory-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
  });
}

/* ─── helpers ─── */
function isBoosted(item: any) {
  return item.boost_rank > 0 && item.boost_expires_at && new Date(item.boost_expires_at) > new Date();
}

const Directory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("sites");
  const [boostTarget, setBoostTarget] = useState<any>(null);
  const [boostType, setBoostType] = useState<"standard" | "homepage">("standard");

  const { data: sites, isLoading: loadingSites } = useDirectorySites();
  const { data: cvs, isLoading: loadingCVs } = useDirectoryCVs();
  const { data: videos, isLoading: loadingVideos } = useDirectoryVideos();
  const { data: jobs, isLoading: loadingJobs } = useDirectoryJobs();

  const boostSite = useMutation({
    mutationFn: async ({ siteId, type }: { siteId: string; type: "standard" | "homepage" }) => {
      const amount = type === "homepage" ? BOOST_HOMEPAGE_PRICE : BOOST_PRICE;
      const days = type === "homepage" ? BOOST_HOMEPAGE_DAYS : 1;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const newRank = type === "homepage" ? 9999 : 10;

      const { error } = await supabase
        .from("mini_sites")
        .update({
          boost_rank: newRank,
          boost_expires_at: expiresAt.toISOString(),
        })
        .eq("id", siteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["directory-sites"] });
      qc.invalidateQueries({ queryKey: ["directory-cvs"] });
      toast.success(boostType === "homepage"
        ? `Destaque na Home por ${BOOST_HOMEPAGE_DAYS} dias ativado!`
        : "Boost ativado por 24h!");
      setBoostTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const q = search.toLowerCase();

  const filteredSites = useMemo(() => {
    if (!sites) return [];
    if (!q) return sites;
    return sites.filter((s: any) =>
      s.slug?.toLowerCase().includes(q) || s.site_name?.toLowerCase().includes(q) || s.bio?.toLowerCase().includes(q)
    );
  }, [sites, q]);

  const filteredCVs = useMemo(() => {
    if (!cvs) return [];
    if (!q) return cvs;
    return cvs.filter((s: any) =>
      s.slug?.toLowerCase().includes(q) || s.site_name?.toLowerCase().includes(q) || s.cv_headline?.toLowerCase().includes(q)
    );
  }, [cvs, q]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (!q) return videos;
    return videos.filter((v: any) => v.title?.toLowerCase().includes(q));
  }, [videos, q]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!q) return jobs;
    return jobs.filter((j: any) => j.title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q));
  }, [jobs, q]);

  // Get user's sites for boost
  const { data: mySites } = useQuery({
    queryKey: ["my-sites-boost", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("mini_sites").select("id, slug, site_name").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Diretório — Mini Sites, CVs e Vídeos" description="Explore mini sites, CVs profissionais e vídeos com paywall." />
      <Header />

      {/* Boost Dialog */}
      <AlertDialog open={!!boostTarget} onOpenChange={o => !o && setBoostTarget(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-accent" /> Boost Mini Site</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>Destaque <strong>{boostTarget?.site_name || boostTarget?.slug}</strong> no diretório.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBoostType("standard")}
                    className={`p-3 rounded-lg border text-center transition-all ${boostType === "standard" ? "border-accent bg-accent/10" : "border-border"}`}
                  >
                    <p className="text-xl font-black text-accent">${BOOST_PRICE}</p>
                    <p className="text-[10px] text-muted-foreground">24 horas</p>
                    <p className="text-[9px] text-muted-foreground">Destaque no diretório</p>
                  </button>
                  <button
                    onClick={() => setBoostType("homepage")}
                    className={`p-3 rounded-lg border text-center transition-all ${boostType === "homepage" ? "border-accent bg-accent/10" : "border-border"}`}
                  >
                    <p className="text-xl font-black text-accent">${BOOST_HOMEPAGE_PRICE.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{BOOST_HOMEPAGE_DAYS} dias</p>
                    <p className="text-[9px] text-muted-foreground">Topo da Home</p>
                  </button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => boostSite.mutate({ siteId: boostTarget.id, type: boostType })}
              className="bg-accent text-accent-foreground"
            >
              Boost por ${boostType === "homepage" ? BOOST_HOMEPAGE_PRICE.toLocaleString() : BOOST_PRICE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="px-6 py-8 mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Diretório</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore mini sites, CVs e vídeos de criadores</p>
        </div>

        {/* Search + Boost */}
        <div className="max-w-md mx-auto mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {user && mySites && mySites.length > 0 && (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <span className="text-[10px] text-muted-foreground">Boost:</span>
              {mySites.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => setBoostTarget(s)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full border border-accent/20 hover:bg-accent/20"
                >
                  <Zap className="w-3 h-3" /> {s.site_name || s.slug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing banner */}
        <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-6 text-center">
          <p className="text-xs text-muted-foreground">
            <Zap className="w-3 h-3 inline text-accent" /> Boost: <strong className="text-foreground">${BOOST_PRICE}</strong> por 24h no diretório •
            <strong className="text-foreground"> ${BOOST_HOMEPAGE_PRICE.toLocaleString()}</strong> = Topo da Home por {BOOST_HOMEPAGE_DAYS} dias
          </p>
        </div>

        {/* Ad Banner 728x90 */}
        <div className="mb-6">
          <AdBanner size="728x90" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mx-auto flex w-fit mb-6">
            <TabsTrigger value="sites" className="gap-1"><Globe className="w-3.5 h-3.5" /> Mini Sites</TabsTrigger>
            <TabsTrigger value="cvs" className="gap-1"><FileText className="w-3.5 h-3.5" /> CVs</TabsTrigger>
            <TabsTrigger value="videos" className="gap-1"><Video className="w-3.5 h-3.5" /> Vídeos</TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1"><Briefcase className="w-3.5 h-3.5" /> Empregos</TabsTrigger>
          </TabsList>

          {/* ═══ MINI SITES ═══ */}
          <TabsContent value="sites">
            {loadingSites ? (
              <p className="text-center text-sm text-muted-foreground py-10">Carregando...</p>
            ) : filteredSites.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Nenhum mini site encontrado</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSites.map((site: any) => (
                  <Link key={site.id} to={`/s/${site.slug}`} className="group">
                    <Card className={`hover:shadow-lg transition-all h-full ${isBoosted(site) ? "border-accent ring-1 ring-accent/30" : "border-border/60"}`}>
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        {isBoosted(site) && (
                          <Badge className="mb-2 bg-accent/10 text-accent text-[9px] gap-1">
                            <Zap className="w-3 h-3" /> Boosted
                          </Badge>
                        )}
                        {site.avatar_url ? (
                          <img src={site.avatar_url} alt={site.site_name || site.slug} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 mb-3" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary font-bold text-lg">
                            {(site.slug || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {site.site_name || site.slug}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono">/s/{site.slug}</span>
                        {site.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{site.bio}</p>}
                        <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
                          {site.show_cv && (
                            <Badge variant="outline" className="text-[10px] border-accent text-accent gap-1">
                              <Lock className="w-3 h-3" /> CV ${site.contact_price || 20}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <ExternalLink className="w-3 h-3" /> Visitar
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ CVs ═══ */}
          <TabsContent value="cvs">
            {loadingCVs ? (
              <p className="text-center text-sm text-muted-foreground py-10">Carregando...</p>
            ) : filteredCVs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Nenhum CV encontrado</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCVs.map((cv: any) => (
                  <Link key={cv.id} to={`/s/${cv.slug}`} className="group">
                    <Card className={`hover:shadow-lg transition-all h-full ${isBoosted(cv) ? "border-accent ring-1 ring-accent/30" : "border-border/60"}`}>
                      <CardContent className="p-4">
                        {isBoosted(cv) && (
                          <Badge className="mb-2 bg-accent/10 text-accent text-[9px] gap-1">
                            <Zap className="w-3 h-3" /> Boosted
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          {cv.avatar_url ? (
                            <img src={cv.avatar_url} alt={cv.site_name || cv.slug} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                              {(cv.slug || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {cv.site_name || cv.slug}
                            </h3>
                            {cv.cv_headline && (
                              <p className="text-xs text-muted-foreground truncate">{cv.cv_headline}</p>
                            )}
                            {cv.cv_location && (
                              <p className="text-[10px] text-muted-foreground">{cv.cv_location}</p>
                            )}
                          </div>
                        </div>
                        {cv.cv_skills && cv.cv_skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {cv.cv_skills.slice(0, 5).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-[9px]">{skill}</Badge>
                            ))}
                            {cv.cv_skills.length > 5 && (
                              <Badge variant="secondary" className="text-[9px]">+{cv.cv_skills.length - 5}</Badge>
                            )}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-accent text-accent gap-1">
                            <Lock className="w-3 h-3" /> Desbloquear ${cv.contact_price || 20}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ VÍDEOS ═══ */}
          <TabsContent value="videos">
            {loadingVideos ? (
              <p className="text-center text-sm text-muted-foreground py-10">Carregando...</p>
            ) : filteredVideos.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Nenhum vídeo encontrado</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVideos.map((v: any) => {
                  const site = v.mini_sites as any;
                  const videoBoosted = site && isBoosted(site);
                  return (
                    <Link key={v.id} to={site ? `/s/${site.slug}` : "#"} className="group">
                      <Card className={`hover:shadow-lg transition-all h-full overflow-hidden ${videoBoosted ? "border-accent ring-1 ring-accent/30" : "border-border/60"}`}>
                        <div className="relative aspect-video bg-muted">
                          {v.thumbnail_url ? (
                            <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          )}
                          {videoBoosted && (
                            <Badge className="absolute top-2 left-2 bg-accent/90 text-accent-foreground text-[9px] gap-1">
                              <Zap className="w-3 h-3" /> Boost
                            </Badge>
                          )}
                          {v.paywall_enabled && (
                            <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[9px] gap-1">
                              <Lock className="w-3 h-3" /> ${Number(v.paywall_price || 0).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {v.title}
                          </h3>
                          {site && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {site.avatar_url ? (
                                <img src={site.avatar_url} className="w-4 h-4 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-primary/10" />
                              )}
                              <span className="text-[10px] text-muted-foreground">{site.site_name || site.slug}</span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {v.nft_enabled && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <DollarSign className="w-3 h-3" /> NFT ${Number(v.nft_price).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ═══ EMPREGOS ═══ */}
          <TabsContent value="jobs">
            {loadingJobs ? (
              <p className="text-center text-sm text-muted-foreground py-10">Carregando...</p>
            ) : filteredJobs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Nenhuma vaga encontrada</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all h-full border-border/60">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                        <Badge variant="secondary" className="text-[9px] shrink-0">{job.job_type}</Badge>
                      </div>
                      {job.description && <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>}
                      <div className="flex items-center gap-3 flex-wrap">
                        {job.location && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                            <DollarSign className="w-3 h-3" /> {job.salary_range}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[9px]">{job.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ad Banner 300x250 sidebar */}
        <div className="mt-8 flex justify-center">
          <AdBanner size="300x250" />
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-4 px-6 mt-8">
        <p className="text-[9px] font-mono text-center opacity-70">
          HASHPO IS A TECH PLATFORM. © 2026 HASHPO
        </p>
      </footer>
    </div>
  );
};

export default Directory;
