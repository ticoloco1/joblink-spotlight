import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import BroadcastBanner from "@/components/BroadcastBanner";
import Home from "./views/Home";
import Directory from "./views/Directory";
import ProfilePage from "./views/ProfilePage";
import Login from "./views/Login";
import Signup from "./views/Signup";
import Templates from "./views/Templates";
import Dashboard from "./views/Dashboard";
import Jobs from "./views/Jobs";
import NotFound from "./views/NotFound";
import SitemapRedirect from "./views/SitemapRedirect";
import HowItWorks from "./views/HowItWorks";
import Advertise from "./views/Advertise";
import Admin from "./views/Admin";
import Videos from "./views/Videos";
import SlugMarketplace from "./views/SlugMarketplace";
import Marketplace from "./views/Marketplace";
import SlugDetail from "./views/SlugDetail";

const queryClient = new QueryClient();


const App = () => (
  <HelmetProvider>
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BroadcastBanner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/u/:slug" element={<ProfilePage />} />
                <Route path="/c/:slug" element={<ProfilePage />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/slugs" element={<SlugMarketplace />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/slug/:slug" element={<SlugDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  </HelmetProvider>
);

export default App;
