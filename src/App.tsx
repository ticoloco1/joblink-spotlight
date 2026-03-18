import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import BroadcastBanner from "@/components/BroadcastBanner";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Templates from "./pages/Templates";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import SitemapRedirect from "./pages/SitemapRedirect";
import HowItWorks from "./pages/HowItWorks";
import Advertise from "./pages/Advertise";
import Admin from "./pages/Admin";
import Videos from "./pages/Videos";
import SlugMarketplace from "./pages/SlugMarketplace";
import Marketplace from "./pages/Marketplace";
import SlugDetail from "./pages/SlugDetail";

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
