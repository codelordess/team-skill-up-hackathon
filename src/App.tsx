import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Discover from "./pages/Discover.tsx";
import Match from "./pages/Match.tsx";
import Funding from "./pages/Funding.tsx";
import OrgProfile from "./pages/OrgProfile.tsx";
import ImpactMap from "./pages/ImpactMap.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/match" element={<Match />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/map" element={<ImpactMap />} />
          <Route path="/org/:id" element={<OrgProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
