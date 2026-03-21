import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Lock, Eye, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

const DirectorySection = () => {
  const [search, setSearch] = useState("");

  const { data: sites, isLoading } = useQuery({
    queryKey: ["directory-sites", search],
    queryFn: async () => {
      let q = supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, cv_headline, cv_location, show_cv, user_id")
        .eq("published", true);
      if (search.trim()) {
        q = q.or(`site_name.ilike.%${search}%,cv_headline.ilike.%${search}%,cv_location.ilike.%${search}%`);
      }
      const { data } = await q.order("updated_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Mini Sites Directory</h2>
            <p className="text-sm text-muted-foreground mt-1">Discover professionals, creators and their portfolios</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, skill, location..."
                className="pl-10"
              />
            </div>
            <Link
              to="/site/edit"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Globe className="w-4 h-4" /> Create Yours
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading...</p>
        ) : (sites || []).length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-2">No mini sites yet</p>
            <p className="text-sm text-muted-foreground mb-6">Be the first to create your professional mini site!</p>
            <Link
              to="/site/edit"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-lg font-bold text-sm"
            >
              Create Mini Site
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(sites || []).map((site: any) => (
              <Link
                key={site.id}
                to={`/s/${site.slug}`}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  {site.avatar_url ? (
                    <img src={site.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                      {(site.site_name || "?")?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-foreground truncate group-hover:text-accent transition-colors">
                      {site.site_name || "Unnamed"}
                    </h3>
                    {site.cv_headline && (
                      <p className="text-xs text-accent font-bold truncate">{site.cv_headline}</p>
                    )}
                    {site.cv_location && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {site.cv_location}
                      </p>
                    )}
                  </div>
                </div>
                {site.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{site.bio}</p>
                )}
                <div className="flex items-center gap-2">
                  {site.show_cv && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> CV — $20
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                    <Eye className="w-3 h-3" /> View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DirectorySection;
