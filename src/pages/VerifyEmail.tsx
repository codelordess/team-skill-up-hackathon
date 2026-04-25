import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Mail, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from sessionStorage (set during signup)
    const stored = sessionStorage.getItem("skillmap_pending_email");
    if (stored) setEmail(stored);

    // If user is already verified, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        navigate("/talent/dashboard", { replace: true });
      }
    });

    // Listen for email confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess?.user?.email_confirmed_at) {
        toast.success("Email verified! Welcome to SkillMap 🎉");
        sessionStorage.removeItem("skillmap_pending_email");
        navigate("/talent/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResent(true);
      setCountdown(60);
      toast.success("Verification email sent!");
    } catch (e: any) {
      toast.error(e.message || "Failed to resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout>
      <section className="container max-w-lg py-20 md:py-32">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">Check your inbox</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a verification link to{" "}
              {email ? (
                <span className="font-semibold text-foreground">{email}</span>
              ) : (
                "your email address"
              )}
              . Click the link to activate your account.
            </p>
          </div>

          {/* Steps */}
          <div className="rounded-xl bg-secondary/50 p-4 text-left space-y-3">
            {[
              "Open the email from SkillMap",
              'Click "Confirm your email"',
              "You'll be redirected back automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>

          {/* Resend */}
          {resent ? (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Email resent!{countdown > 0 && <span className="text-muted-foreground ml-1">Resend again in {countdown}s</span>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Didn't receive it?{" "}
              <button
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="font-semibold text-primary hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                {resending && <RefreshCw className="h-3 w-3 animate-spin" />}
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
              </button>
            </p>
          )}

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default VerifyEmail;
