import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase handles the token from the URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
        setChecking(false);
      } else if (session && event !== "SIGNED_OUT") {
        // Already logged in user trying to reset (edge case)
        setValidSession(true);
        setChecking(false);
      }
    });

    // Timeout — if no PASSWORD_RECOVERY event after 3s, link is invalid
    const timeout = setTimeout(() => {
      setChecking(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setBusy(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/auth", { replace: true }), 2500);
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <Layout>
        <section className="container max-w-lg py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (!validSession) {
    return (
      <Layout>
        <section className="container max-w-lg py-20 md:py-32">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-xl font-extrabold">Link expired or invalid</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link has expired or already been used. Please request a new one.
            </p>
            <button
              onClick={() => navigate("/auth/forgot-password")}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant"
            >
              Request new link
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  if (done) {
    return (
      <Layout>
        <section className="container max-w-lg py-20 md:py-32">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="font-display text-xl font-extrabold">Password updated!</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container max-w-lg py-20 md:py-32">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant space-y-6">
          <div className="space-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-extrabold">Set a new password</h1>
            <p className="text-sm text-muted-foreground">Choose something strong and memorable.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 8 characters"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength indicators */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(rule => (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {rule.test(password)
                        ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                        : <XCircle className="h-3 w-3 text-muted-foreground" />}
                      <span className={rule.test(password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Confirm password
              </label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  required
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
