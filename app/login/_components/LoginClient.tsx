"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/db/supabase-browser";
import { normalizeIndiaPhoneE164 } from "@/lib/utils/phone";
import { cn } from "@/lib/utils/cn";

type Step = "phone" | "otp";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const configured = useMemo(() => isSupabaseBrowserConfigured(), []);

  const [step, setStep] = useState<Step>("phone");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [e164, setE164] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const bannerError = useMemo(() => {
    if (!configured) return "Sign-in needs Supabase URL and anon key in env (local mock mode).";
    if (urlError === "config") return "Server auth is not configured.";
    if (urlError === "oauth") return "Google sign-in did not complete. Try again.";
    if (urlError === "missing_code") return "Missing auth code. Try again.";
    return null;
  }, [configured, urlError]);

  const startGoogle = useCallback(async () => {
    setMessage(null);
    setFieldError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFieldError("Auth is not available in this build.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setBusy(false);
    if (error) setFieldError(error.message);
  }, []);

  const sendOtp = useCallback(async () => {
    setMessage(null);
    setFieldError(null);
    const normalized = normalizeIndiaPhoneE164(phoneRaw);
    if (!normalized) {
      setFieldError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFieldError("Auth is not available in this build.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: { channel: "sms" },
    });
    setBusy(false);
    if (error) {
      setFieldError(error.message);
      return;
    }
    setE164(normalized);
    setStep("otp");
    setMessage("Check your phone for the SMS code.");
  }, [phoneRaw]);

  const verifyOtp = useCallback(async () => {
    setMessage(null);
    setFieldError(null);
    if (!e164) {
      setFieldError("Send the code first.");
      return;
    }
    const code = otp.trim();
    if (code.length < 4) {
      setFieldError("Enter the code from SMS.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFieldError("Auth is not available in this build.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      setFieldError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }, [e164, otp, router]);

  return (
    <GlassCard padding="lg" className="w-full max-w-[400px]">
      <div className="font-[var(--font-display)] text-[22px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
        Sign in
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        Use Google or a mobile OTP (SMS). Configure providers in the Supabase dashboard for production.
      </p>

      {bannerError ? (
        <div
          className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]"
          role="status"
        >
          {bannerError}
        </div>
      ) : null}

      {fieldError ? (
        <div
          className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/35 bg-[color-mix(in_oklab,var(--color-danger),transparent_88%)] px-3 py-2 text-[13px] text-[var(--color-text-primary)]"
          role="alert"
        >
          {fieldError}
        </div>
      ) : null}

      {message ? (
        <div
          className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]"
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            void startGoogle();
          }}
          disabled={busy || !configured}
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-[var(--radius-md)]",
            "border border-[var(--color-line-subtle)] bg-[var(--color-surface)]",
            "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px] text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-glass)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[var(--color-line-subtle)]" />
          <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]">
            OR PHONE
          </span>
          <div className="h-px flex-1 bg-[var(--color-line-subtle)]" />
        </div>

        {step === "phone" ? (
          <>
            <label className="block">
              <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                MOBILE (INDIA)
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value)}
                className={cn(
                  "mt-2 h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-3",
                  "font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)]",
                  "placeholder:text-[var(--color-text-muted)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                )}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                void sendOtp();
              }}
              disabled={busy || !configured}
              className={cn(
                "h-11 w-full rounded-[var(--radius-md)]",
                "bg-[var(--gradient-ramp-accent)] text-white shadow-[var(--shadow-accent-glow)]",
                "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              Send SMS code
            </button>
          </>
        ) : (
          <>
            <label className="block">
              <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                SMS CODE
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={cn(
                  "mt-2 h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-3",
                  "font-[var(--font-mono)] text-[13px] tabular-nums text-[var(--color-text-primary)]",
                  "placeholder:text-[var(--color-text-muted)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                )}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setMessage(null);
                  setFieldError(null);
                }}
                disabled={busy}
                className={cn(
                  "h-11 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
                  "font-[var(--font-text)] text-[13px] font-semibold text-[var(--color-text-primary)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                )}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  void verifyOtp();
                }}
                disabled={busy || !configured}
                className={cn(
                  "h-11 flex-[2] rounded-[var(--radius-md)]",
                  "bg-[var(--gradient-ramp-accent)] text-white shadow-[var(--shadow-accent-glow)]",
                  "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                Verify
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-[13px] font-medium text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Back to app
        </Link>
      </div>
    </GlassCard>
  );
}
