import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, requireRole }: { children: React.ReactNode; requireRole?: AppRole }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireRole && role && role !== requireRole) {
    return <Navigate to={role === "employer" ? "/employer/dashboard" : "/talent/dashboard"} replace />;
  }
  return <>{children}</>;
};
