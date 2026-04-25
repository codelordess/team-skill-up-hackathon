import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Briefcase, Eye, EyeOff, Loader2, Sparkles, UserCircle2 } from "lucide-react";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  location: z.string().trim().max(120).optional(),
  role: z.enum(["talent", "employer"]),
  company_name: z.string().trim().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [selectedRole, setSelectedRole] = useState<"talent" | "employer">(
    (params.get("role") as "talent" | "employer") || "talent"
  );
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "employer" ? "/employer/dashboard" : "/talent/dashboard", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);

    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          location: fd.get("location") || undefined,
          role: selectedRole,
          company_name: fd.get("company_name") || undefined,
        });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          setBusy(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email`,
            data: {
              name: parsed.data.name,
              role: parsed.data.role,
              location: parsed.data.location ?? "",
              company_name: parsed.data.company_name ?? "",
            },
          },
        });
        if (error) throw error;

        // Store email so verify page can show it & allow resend
        sessionStorage.setItem("skillmap_pending_email", parsed.data.email);

        // If email confirmation is required, redirect to verify page
        if (data.user && !data.user.email_confirmed_at) {
          navigate("/auth/verify-email");
        } else {
          toast.success("Welcome to SkillMap!");
          // navigation handled by auth state effect
        }
      } else {
        const parsed = loginSchema.safeParse({
          email: fd.get("email"),
          password: fd.get("password"),
        });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          setBusy(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            sessionStorage.setItem("skillmap_pending_email", parsed.data.email);
            toast.error("Please verify your email first.");
            navigate("/auth/verify-email");
            return;
          }
          throw error;
        }
        toast.success("Signed in");
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="container max-w-5xl py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Left: copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" />
              {mode === "signup" ? "Join SkillMap" : "Welcome back"}
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
              {mode === "signup" ? (
                <>Make your skills <span className="text-gradient">visible</span> to the world.</>
              ) : (
                <>Sign in to your <span className="text-gradient">SkillMap</span> account.</>
              )}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signup"
                ? "Create your account to either build a structured AI-powered talent profile or hire from an overlooked global talent pool."
                : "Continue building your profile, browsing talent, or posting opportunities."}
            </p>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant md:p-8">
            {/* Tab switcher */}
            <div className="mb-5 flex rounded-lg border border-border p-1">
              {(["login", "signup"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  {/* Role picker */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { v: "talent", icon: UserCircle2, label: "Talent", desc: "Find work" },
                        { v: "employer", icon: Briefcase, label: "Employer", desc: "Hire talent" },
                      ] as const).map(({ v, icon: Icon, label, desc }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelectedRole(v)}
                          className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition ${
                            selectedRole === v
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${selectedRole === v ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-bold">{label}</span>
                          <span className="text-xs text-muted-foreground">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field name="name" label="Full name" placeholder="Your name" />
                  {selectedRole === "employer" && (
                    <Field name="company_name" label="Company name" placeholder="e.g. Brimble" required />
                  )}
                  <Field name="location" label="Location" placeholder="City, Country" />
                </>
              )}

              <Field name="email" type="email" label="Email" placeholder="you@example.com" required />

              {/* Password with show/hide */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
                    required
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "login" && (
                  <div className="mt-1.5 text-right">
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {mode === "signup" ? "Already have an account? " : "New here? "}
              <button
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const Field = ({ name, label, type = "text", placeholder, required }: any) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

export default Auth;
