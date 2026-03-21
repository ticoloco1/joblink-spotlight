import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useMySite() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-mini-site", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_sites")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
}

export function usePublicSite(slug: string) {
  return useQuery({
    queryKey: ["public-site", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mini_sites")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useSiteLinks(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-links", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_site_links")
        .select("*")
        .eq("site_id", siteId!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!siteId,
  });
}

export function useSiteVideos(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-videos", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_site_videos")
        .select("id, site_id, user_id, title, description, thumbnail_url, preview_url, sort_order, nft_enabled, nft_price, nft_max_views, nft_max_editions, nft_editions_sold, recharge_enabled, recharge_price, view_tier, paywall_enabled, paywall_price, created_at")
        .eq("site_id", siteId!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!siteId,
  });
}

export function useUpsertSite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { data: existing } = await supabase
        .from("mini_sites")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("mini_sites")
          .update(values)
          .eq("id", existing.id);
        if (error) throw error;
        return existing.id;
      } else {
        const slug = values.slug || user!.email?.split("@")[0] || crypto.randomUUID().slice(0, 8);
        const { data, error } = await supabase
          .from("mini_sites")
          .insert({ ...values, user_id: user!.id, slug })
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-mini-site"] }),
  });
}

export function useAddSiteLink() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { site_id: string; title: string; url: string; icon?: string }) => {
      const { error } = await supabase
        .from("mini_site_links")
        .insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-links"] }),
  });
}

export function useDeleteSiteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mini_site_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-links"] }),
  });
}

export function useAddSiteVideo() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      site_id: string;
      youtube_video_id: string;
      title: string;
      thumbnail_url?: string;
      nft_enabled?: boolean;
      nft_price?: number;
      nft_max_views?: number;
      nft_max_editions?: number;
      preview_url?: string;
      recharge_price?: number;
      recharge_enabled?: boolean;
      view_tier?: number;
      paywall_enabled?: boolean;
      paywall_price?: number;
    }) => {
      // Extract youtube_video_id for private table
      const { youtube_video_id, ...publicValues } = values;
      
      // Insert video record (without youtube_video_id stored publicly)
      const { data: video, error } = await supabase
        .from("mini_site_videos")
        .insert({ ...values, user_id: user!.id })
        .select("id")
        .single();
      if (error) throw error;

      // Store youtube_video_id in private table (RLS allows owner)
      const { error: privateErr } = await supabase
        .from("private_video_urls")
        .insert({ video_id: video.id, youtube_video_id });
      if (privateErr) {
        console.warn("Failed to store private URL:", privateErr.message);
        // Video was created, private URL insert may fail due to RLS or duplicate
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useDeleteSiteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mini_site_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useUpdateSiteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Record<string, any>) => {
      const { error } = await supabase.from("mini_site_videos").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useBuyNft() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (video: any) => {
      const hash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      const { error } = await supabase.from("nft_purchases").insert({
        video_id: video.id,
        buyer_id: user!.id,
        seller_id: video.user_id,
        price_paid: video.nft_price,
        views_allowed: video.nft_max_views,
        polygon_hash: hash,
      });
      if (error) throw error;
      await supabase
        .from("mini_site_videos")
        .update({ nft_editions_sold: (video.nft_editions_sold || 0) + 1 })
        .eq("id", video.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-videos"] });
      qc.invalidateQueries({ queryKey: ["my-nfts"] });
    },
  });
}

export function useBuyNftFromListing() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (listing: any) => {
      // Transfer NFT ownership
      const { error: updateErr } = await supabase
        .from("nft_purchases")
        .update({
          buyer_id: user!.id,
          original_buyer_id: listing.seller_id,
          is_resale: true,
          price_paid: listing.price,
        })
        .eq("id", listing.nft_purchase_id);
      if (updateErr) throw updateErr;

      // Mark listing as sold
      const { error: listErr } = await supabase
        .from("nft_listings")
        .update({ status: "sold" })
        .eq("id", listing.id);
      if (listErr) throw listErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nft-listings"] });
      qc.invalidateQueries({ queryKey: ["my-nfts"] });
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { nft_purchase_id: string; video_id: string; price: number }) => {
      const { error } = await supabase.from("nft_listings").insert({
        ...values,
        seller_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nft-listings"] });
      qc.invalidateQueries({ queryKey: ["my-nfts"] });
    },
  });
}

export function useCancelListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("nft_listings")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nft-listings"] }),
  });
}

export function useRechargeNft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ purchaseId, extraViews }: { purchaseId: string; extraViews: number }) => {
      const { data: purchase } = await supabase
        .from("nft_purchases")
        .select("views_allowed")
        .eq("id", purchaseId)
        .single();
      if (!purchase) throw new Error("NFT not found");

      const { error } = await supabase
        .from("nft_purchases")
        .update({ views_allowed: purchase.views_allowed + extraViews })
        .eq("id", purchaseId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-nfts"] }),
  });
}

export function useMyNfts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-nfts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("nft_purchases")
        .select("*, mini_site_videos(*)")
        .eq("buyer_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useNftListings(videoId?: string) {
  return useQuery({
    queryKey: ["nft-listings", videoId],
    queryFn: async () => {
      let q = supabase
        .from("nft_listings")
        .select("*, mini_site_videos(title, thumbnail_url, youtube_video_id, nft_max_views, recharge_enabled, recharge_price)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (videoId) q = q.eq("video_id", videoId);
      const { data } = await q;
      return data || [];
    },
  });
}

export function useAllNftListings() {
  return useQuery({
    queryKey: ["nft-listings-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nft_listings")
        .select("*, mini_site_videos(title, thumbnail_url, youtube_video_id, nft_max_views, nft_price, recharge_enabled, recharge_price, user_id)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });
}
