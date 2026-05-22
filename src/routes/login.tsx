import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mowaridiBg from "@/assets/mowaridi-bg.jpg";
import mowaridiLogo from "@/assets/mowaridi-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Mowaridi Dashboards" },
      {
        name: "description",
        content:
          "Sign in to Mowaridi Dashboards — AI-powered supply chain intelligence for the Hajj season.",
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
    <main
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "var(--mow-cream)", color: "var(--mow-espresso)" }}
    >
      <img
        src={mowaridiBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, oklch(0.985 0.012 80 / 0.94) 0%, oklch(0.985 0.012 80 / 0.6) 42%, oklch(0.985 0.012 80 / 0.15) 72%, transparent 100%)",
        }}
      />
      <div aria-hidden="true" className="mowaridi-grid absolute inset-0" />
      <div
        aria-hidden="true"
        className="mowaridi-glow-orb"
        style={{
          width: 460,
          height: 460,
          top: "-140px",
          right: "-140px",
          background: "oklch(0.72 0.18 38 / 0.5)",
        }}
      />
      <div
        aria-hidden="true"
        className="mowaridi-glow-orb"
        style={{
          width: 520,
          height: 520,
          bottom: "-200px",
          left: "-180px",
          background: "oklch(0.55 0.12 40 / 0.35)",
          animationDelay: "3s",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Brand panel */}
        <section className="hidden flex-col justify-between lg:flex">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              <Mountain className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--mow-espresso)" }}>
                Mowaridi
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--mow-cocoa)" }}>
                موردي · Dashboards
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur"
              style={{
                borderColor: "oklch(0.55 0.1 40 / 0.2)",
                background: "oklch(1 0 0 / 0.55)",
                color: "var(--mow-cocoa)",
              }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: "var(--mow-coral)" }}
              />
              AI-Powered Supply Intelligence
            </div>
            <h1 className="mowaridi-gradient-text text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              Dashboards that<br />think with you.
            </h1>
            <p className="max-w-md text-base leading-relaxed" style={{ color: "var(--mow-cocoa)" }}>
              Sign in to Mowaridi Dashboards to monitor kitchens, suppliers, invoices
              and the entire Hajj-season supply chain in real time — powered by AI.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--mow-cocoa)" }}>
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--mow-coral)" }} />
            Secured by enterprise-grade authentication
          </div>
        </section>

        {/* Auth card */}
        <section className="flex w-full items-center justify-center">
          <div className="mowaridi-glass relative w-full max-w-md rounded-3xl p-8 sm:p-10">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Mountain className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--mow-espresso)" }}>
                Mowaridi
              </span>
            </div>

            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--mow-espresso)" }}>
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "var(--mow-cocoa)" }}>
                Sign in to access your AI dashboards
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "0 14px 34px -12px oklch(0.55 0.18 35 / 0.55)",
              }}
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

            <div
              className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest"
              style={{ color: "var(--mow-cocoa)" }}
            >
              <div className="h-px flex-1" style={{ background: "oklch(0.55 0.1 40 / 0.2)" }} />
              Secure access
              <div className="h-px flex-1" style={{ background: "oklch(0.55 0.1 40 / 0.2)" }} />
            </div>

            <p className="text-center text-xs leading-relaxed" style={{ color: "var(--mow-cocoa)" }}>
              By continuing, you agree to Mowaridi's{" "}
              <a href="#" className="underline-offset-4 hover:underline" style={{ color: "var(--mow-espresso)" }}>
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline-offset-4 hover:underline" style={{ color: "var(--mow-espresso)" }}>
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.4-1.11 2.59-2.36 3.39v2.81h3.81c2.23-2.06 3.6-5.09 3.6-8.44z" />
      <path fill="#fff" opacity=".9" d="M12 24c3.18 0 5.85-1.05 7.8-2.86l-3.81-2.81c-1.06.72-2.42 1.14-3.99 1.14-3.07 0-5.67-2.07-6.6-4.86H1.46v3.05C3.4 21.43 7.4 24 12 24z" />
      <path fill="#fff" opacity=".8" d="M5.4 14.61c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27V7.02H1.46A11.97 11.97 0 0 0 0 12.34c0 1.93.46 3.75 1.46 5.32l3.94-3.05z" />
      <path fill="#fff" opacity=".95" d="M12 4.75c1.73 0 3.28.6 4.5 1.77l3.37-3.37C17.84 1.19 15.17 0 12 0 7.4 0 3.4 2.57 1.46 6.32l3.94 3.05C6.33 6.81 8.93 4.75 12 4.75z" />
    </svg>
  );
}
