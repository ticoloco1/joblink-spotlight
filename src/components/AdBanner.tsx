import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  banner_url: string;
  target_url: string;
  title: string;
  format?: 'banner' | 'square';
}

interface AdBannerProps {
  placement: 'header' | 'footer' | 'sidebar';
  className?: string;
}

const AD_FORMATS: Record<string, string> = {
  banner: 'w-full h-[120px] max-w-[728px] max-h-[90px]',
  square: 'w-[300px] h-[300px]',
};

const AdBanner = ({ placement, className = '' }: AdBannerProps) => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase
        .from('ads')
        .select('id, banner_url, target_url, title, format')
        .eq('status', 'approved')
        .eq('placement', placement)
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setAd({ ...data, format: (data.format === 'square' ? 'square' : 'banner') as 'banner' | 'square' });
        // Track impression
        await supabase.from('ads').update({ impressions: 0 }).eq('id', data.id); // Will be incremented server-side
      }
    };
    fetchAd();
  }, [placement]);

  if (!ad?.banner_url) return null;

  const formatKey = ad.format === 'square' ? 'square' : 'banner';
  const sizes = AD_FORMATS[formatKey] ?? AD_FORMATS.banner;

  const handleClick = async () => {
    if (ad) {
      // Track click
      const { data: current } = await supabase.from('ads').select('clicks').eq('id', ad.id).single();
      if (current) {
        await supabase.from('ads').update({ clicks: current.clicks + 1 }).eq('id', ad.id);
      }
      if (ad.target_url) {
        window.open(ad.target_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizes} cursor-pointer overflow-hidden rounded-lg border border-border opacity-90 hover:opacity-100 transition-opacity`}
        onClick={handleClick}
      >
        <img 
          src={ad.banner_url} 
          alt={ad.title} 
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AdBanner;
