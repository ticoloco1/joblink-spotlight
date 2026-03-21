import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedVideoResult {
  access: boolean;
  youtube_video_id?: string;
  access_type?: "nft" | "paywall" | "free" | "owner";
  views_remaining?: number;
  expires_at?: string;
  reason?: string;
}

export function useProtectedVideo() {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, ProtectedVideoResult>>(new Map());

  const fetchProtectedVideo = useCallback(async (videoId: string): Promise<ProtectedVideoResult> => {
    // Check cache first
    if (cache.has(videoId)) {
      return cache.get(videoId)!;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-protected-video", {
        body: { video_id: videoId },
      });

      if (error) throw error;

      const result = data as ProtectedVideoResult;
      
      // Cache the result
      setCache((prev) => new Map(prev).set(videoId, result));
      
      return result;
    } catch (err: any) {
      console.error("Failed to fetch protected video:", err);
      return { access: false, reason: err.message || "Failed to verify access" };
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const clearCache = useCallback((videoId?: string) => {
    if (videoId) {
      setCache((prev) => {
        const next = new Map(prev);
        next.delete(videoId);
        return next;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  return { fetchProtectedVideo, loading, clearCache };
}
