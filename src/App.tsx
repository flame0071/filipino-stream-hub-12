import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { NetworkStatus } from "./components/NetworkStatus";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import Homepage from "./pages/Homepage";
import Channels from "./pages/Channels";
import CustomChannels from "./pages/CustomChannels";
import Movies from "./pages/Movies";
import TVSeries from "./pages/TVSeries";
import Comments from "./pages/Comments";
import Music from "./pages/Music";
import SpotifyCallback from "./pages/SpotifyCallback";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";
import { disableDevTools } from "./utils/disableDevTools";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize developer tools protection
   // disableDevTools();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/custom-channels" element={<CustomChannels />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-series" element={<TVSeries />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/music" element={<Music />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/spotify/callback" element={<SpotifyCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
