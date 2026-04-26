import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Opportunities from "./pages/Opportunities.tsx";
import TalentMap from "./pages/TalentMap.tsx";
import TalentDashboard from "./pages/TalentDashboard.tsx";
import TalentEdit from "./pages/TalentEdit.tsx";
import EmployerDashboard from "./pages/EmployerDashboard.tsx";
import EmployerEdit from "./pages/EmployerEdit.tsx";
import JobNew from "./pages/JobNew.tsx";
import JobMatches from "./pages/JobMatches.tsx";
import TalentSearch from "./pages/TalentSearch.tsx";
import TalentDetail from "./pages/TalentDetail.tsx";
import Notifications from "./pages/Notifications.tsx";
import FounderAssistant from "./pages/FounderAssistant.tsx";
import JobApplications from "./pages/JobApplications.tsx";
import SkillAssessment from "./pages/SkillAssessment.tsx";
import About from "./pages/About.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />

            {/* ── Auth ── */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* ── Public ── */}
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/map" element={<TalentMap />} />

            {/* ── Talent ── */}
            <Route
              path="/talent/dashboard"
              element={<ProtectedRoute requireRole="talent"><TalentDashboard /></ProtectedRoute>}
            />
            <Route
              path="/talent/edit"
              element={<ProtectedRoute requireRole="talent"><TalentEdit /></ProtectedRoute>}
            />

            {/* ── Employer ── */}
            <Route
              path="/employer/dashboard"
              element={<ProtectedRoute requireRole="employer"><EmployerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/employer/edit"
              element={<ProtectedRoute requireRole="employer"><EmployerEdit /></ProtectedRoute>}
            />
            <Route
              path="/employer/jobs/new"
              element={<ProtectedRoute requireRole="employer"><JobNew /></ProtectedRoute>}
            />
            <Route
              path="/employer/jobs/:id/matches"
              element={<ProtectedRoute requireRole="employer"><JobMatches /></ProtectedRoute>}
            />
            <Route
              path="/employer/jobs/:id/applications"
              element={<ProtectedRoute requireRole="employer"><JobApplications /></ProtectedRoute>}
            />
            <Route
              path="/employer/talent"
              element={<ProtectedRoute requireRole="employer"><TalentSearch /></ProtectedRoute>}
            />
            <Route
              path="/employer/talent/:id"
              element={<ProtectedRoute requireRole="employer"><TalentDetail /></ProtectedRoute>}
            />
            <Route
              path="/employer/founder-assistant"
              element={<ProtectedRoute requireRole="employer"><FounderAssistant /></ProtectedRoute>}
            />

            {/* ── Talent Assessment ── */}
            <Route
              path="/talent/assessment"
              element={<ProtectedRoute requireRole="talent"><SkillAssessment /></ProtectedRoute>}
            />

            {/* ── Shared Protected ── */}
            <Route
              path="/notifications"
              element={<ProtectedRoute><Notifications /></ProtectedRoute>}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
