import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProfileBuilder from "./pages/ProfileBuilder.tsx";
import Opportunities from "./pages/Opportunities.tsx";
import Employers from "./pages/Employers.tsx";
import TalentMap from "./pages/TalentMap.tsx";
import TalentProfilePage from "./pages/TalentProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<ProfileBuilder />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/employers" element={<Employers />} />
          <Route path="/map" element={<TalentMap />} />
          <Route path="/talent/:id" element={<TalentProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
