import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mowaridiBg from "@/assets/mowaridi-bg.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Mowaridi Dashboards" },
      {
        name: "description",
        content:
          "Sign in to Mowaridi Dashboards — AI-powered analytics and intelligence at a glance.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Background image */}
      <img
        src={mowaridiBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      {/* Overlay gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, oklch(0.68 0.22 295 / 0.35), transparent 60%), linear-gradient(180deg, oklch(0.12 0.04 280 / 0.5), oklch(0.10 0.03 280 / 0.92))",
        }}
      />
      {/* Animated grid */}
      <div aria-hidden="true" className="mowaridi-grid absolute inset-0" />
      {/* Floating orbs */}
      <div
        aria-hidden="true"
        className="mowaridi-glow-orb"
        style={{
          width: 420,
          height: 420,
          top: "-120px",
          left: "-120px",
          background: "oklch(0.72 0.18 220 / 0.6)",
        }}
      />
      <div
        aria-hidden="true"
        className="mowaridi-glow-orb"
        style={{
          width: 520,
          height: 520,
          bottom: "-180px",
          right: "-160px",
          background: "oklch(0.68 0.22 305 / 0.55)",
          animationDelay: "3s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Brand panel */}
        <section className="hidden flex-col justify-between lg:flex">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl"
                 style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Mowaridi</span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              AI-Powered Intelligence
            </div>
            <h1 className="mowaridi-gradient-text text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Dashboards that<br />think with you.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Sign in to Mowaridi Dashboards to explore real-time insights,
              predictive analytics, and AI-generated narratives across your
              entire data stack.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Secured by enterprise-grade authentication
          </div>
        </section>

        {/* Auth card */}
        <section className="flex w-full items-center justify-center">
          <div className="mowaridi-glass relative w-full max-w-md rounded-3xl p-8 sm:p-10">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                   style={{ background: "var(--gradient-brand)" }}>
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Mowaridi</span>
            </div>

            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to access your AI dashboards
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-5 py-3.5 text-sm font-medium text-[oklch(0.2_0.02_280)] shadow-lg transition-all hover:scale-[1.01] hover:bg-white hover:shadow-[0_0_40px_-5px_oklch(0.68_0.22_295/0.5)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>{loading ? "Connecting…" : "Continue with Google"}</span>
              {!loading && (
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              )}
            </button>

            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              <div className="h-px flex-1 bg-white/10" />
              Secure access
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              By continuing, you agree to Mowaridi's{" "}
              <a href="#" className="text-foreground/80 underline-offset-4 hover:underline">Terms</a>{" "}
              and{" "}
              <a href="#" className="text-foreground/80 underline-offset-4 hover:underline">Privacy Policy</a>.
            </p>

            {/* Card glow border */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(1 0 0 / 0.12), transparent 40%, transparent 60%, oklch(0.68 0.22 295 / 0.15))",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: 1,
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.4-1.11 2.59-2.36 3.39v2.81h3.81c2.23-2.06 3.6-5.09 3.6-8.44z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.18 0 5.85-1.05 7.8-2.86l-3.81-2.81c-1.06.72-2.42 1.14-3.99 1.14-3.07 0-5.67-2.07-6.6-4.86H1.46v3.05C3.4 21.43 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.61c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27V7.02H1.46A11.97 11.97 0 0 0 0 12.34c0 1.93.46 3.75 1.46 5.32l3.94-3.05z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.73 0 3.28.6 4.5 1.77l3.37-3.37C17.84 1.19 15.17 0 12 0 7.4 0 3.4 2.57 1.46 6.32l3.94 3.05C6.33 6.81 8.93 4.75 12 4.75z"
      />
    </svg>
  );
}
