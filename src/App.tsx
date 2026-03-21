import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "@/hooks/useAuth";
import { createWagmiConfig, fetchWalletConnectId } from "@/lib/web3Config";
import type { Config } from "wagmi";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import VideoDetail from "./pages/VideoDetail";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Channel from "./pages/Channel";
import Advertiser from "./pages/Advertiser";
import CreatorProfile from "./pages/CreatorProfile";
import Exchange from "./pages/Exchange";
import ExchangeIndex from "./pages/ExchangeIndex";
import ExchangeFutures from "./pages/ExchangeFutures";
import MiniSiteEditor from "./pages/MiniSiteEditor";
import MiniSitePublic from "./pages/MiniSitePublic";
import Marketplace from "./pages/Marketplace";
import Careers from "./pages/Careers";
import HowItWorks from "./pages/HowItWorks";
import SubdomainAuction from "./pages/SubdomainAuction";
import Directory from "./pages/Directory";
import DomainMarketplace from "./pages/DomainMarketplace";
import SlugMarketplace from "./pages/SlugMarketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [wagmiConfig, setWagmiConfig] = useState<Config>(() =>
    createWagmiConfig()
  );

  useEffect(() => {
    fetchWalletConnectId().then((id) => {
      if (id) setWagmiConfig(createWagmiConfig(id));
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/governance" element={<Admin />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/video/:id" element={<VideoDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/channel" element={<Channel />} />
                <Route path="/advertiser" element={<Advertiser />} />
                <Route path="/creator/:id" element={<CreatorProfile />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/exchange/index" element={<ExchangeIndex />} />
                <Route path="/exchange/futures" element={<ExchangeFutures />} />
                <Route path="/site/edit" element={<MiniSiteEditor />} />
                <Route path="/s/:slug" element={<MiniSitePublic />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/auction" element={<SubdomainAuction />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/domains" element={<DomainMarketplace />} />
                <Route path="/slugs" element={<SlugMarketplace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
