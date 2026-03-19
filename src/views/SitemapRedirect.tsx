import { useEffect } from 'react';

const SitemapRedirect = () => {
  useEffect(() => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    window.location.href = `https://${projectId}.supabase.co/functions/v1/sitemap`;
  }, []);
  
  return <div>Redirecting to sitemap...</div>;
};

export default SitemapRedirect;
