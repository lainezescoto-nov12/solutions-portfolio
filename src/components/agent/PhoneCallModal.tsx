"use client";

import { useState } from "react";
import { Waveform } from "@/components/agent/Waveform";

const DEMO_API_URL = process.env.NEXT_PUBLIC_DEMO_API_URL || "";

type Step = "phone" | "code" | "calling" | "done" | "error";

// Same normalization rule as the inline widget: require an explicit +
// country code rather than guessing one, since guessing risks silently
// dialing the wrong country.
function normalizePhone(raw: string): { value: string; error: string | null } {
  const stripped = raw.replace(/[\s\-().]/g, "");
  if (!stripped.startsWith("+")) {
    return {
      value: stripped,
      error: "Add your country code with a + in front, e.g. +19843889822.",
    };
  }
  return { value: stripped, error: null };
}

// Full-screen "run the demo" experience: a stylized phone-call UI (avatar,
// live status, animated waveform) that walks a visitor through getting a
// real call from the Ridgeline voice agent, instead of a plain form.
export function PhoneCallModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiConfigured = Boolean(DEMO_API_URL);

  const sendCode = async () => {
    const { value: normalized, error } = normalizePhone(phone);
    if (error) {
      setErrorMessage(error);
      setStep("error");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${DEMO_API_URL}/verify/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: normalized }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Could not send verification code.");
      }
      setStep("code");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndCall = async () => {
    setLoading(true);
    setErrorMessage("");
    setStep("calling");
    try {
      const res = await fetch(`${DEMO_API_URL}/verify/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: normalizePhone(phone).value, code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Could not verify that code.");
      }
      setStep("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const statusText: Record<Step, string> = {
    phone: "Enter your number to start",
    code: "Enter the code we just sent",
    calling: "Calling now…",
    done: "Connected — check your phone",
    error: "Something went wrong",
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 px-8 py-10 text-white shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-white/40 hover:text-white"
        >
          ×
        </button>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold"
          style={{ background: "linear-gradient(135deg, #146EF5 0%, #0a2472 100%)" }}
        >
          RA
        </div>
        <p className="mt-4 text-lg font-semibold">Ridgeline Auto Group</p>
        <p className="text-sm text-white/50">AI Voice Agent</p>

        <p className="mt-6 text-sm font-medium text-white/70">
          {statusText[step]}
        </p>

        <div className="mt-2 w-full">
          <Waveform active={step === "calling" || step === "done"} />
        </div>

        {!apiConfigured && (
          <p className="mt-4 text-center text-xs text-red-400">
            Demo call API not configured (NEXT_PUBLIC_DEMO_API_URL missing).
          </p>
        )}

        {step === "phone" && (
          <div className="mt-6 flex w-full flex-col gap-3">
            <input
              type="tel"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-3 text-center text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button
              onClick={sendCode}
              disabled={loading || phone.replace(/\D/g, "").length < 7 || !apiConfigured}
              className="w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-30"
              style={{ backgroundColor: "#146EF5" }}
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="mt-6 flex w-full flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-3 text-center text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button
              onClick={verifyAndCall}
              disabled={loading || !code}
              className="w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-30"
              style={{ backgroundColor: "#146EF5" }}
            >
              {loading ? "Verifying…" : "Verify & call me"}
            </button>
          </div>
        )}

        {step === "done" && (
          <p className="mt-6 text-center text-sm text-emerald-400">
            Your phone should be ringing — that&apos;s the real agent, live.
          </p>
        )}

        {step === "error" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
            <button
              onClick={() => setStep("phone")}
              className="text-xs text-white/50 underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-white/30">
          A one-time code confirms it&apos;s really your number before
          anything calls it.
        </p>
      </div>
    </div>
  );
}
