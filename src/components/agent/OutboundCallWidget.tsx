"use client";

import { useState } from "react";

const DEMO_API_URL = process.env.NEXT_PUBLIC_DEMO_API_URL || "";

type Step = "phone" | "code" | "calling" | "done" | "error";

// Strips spaces/dashes/parens so "(984) 388-9822" and "+1 984-388-9822"
// both work. Does not guess a missing country code -- that would risk
// silently sending to the wrong country -- but only errors on that
// specific case, with a message telling the visitor what to add.
function normalizePhone(raw: string): { value: string; error: string | null } {
  const stripped = raw.replace(/[\s\-().]/g, "");
  if (!stripped.startsWith("+")) {
    return {
      value: stripped,
      error: "Add your country code with a + in front, e.g. +19843889822 or +50432964465.",
    };
  }
  return { value: stripped, error: null };
}

export function OutboundCallWidget() {
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

  const reset = () => {
    setStep("phone");
    setPhone("+");
    setCode("");
    setErrorMessage("");
  };

  return (
    <div className="mt-4">
      {!apiConfigured && (
        <p className="text-xs text-red-500">
          Demo call API not configured (NEXT_PUBLIC_DEMO_API_URL missing).
        </p>
      )}

      {step === "phone" && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="tel"
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
          <button
            onClick={sendCode}
            disabled={loading || phone.replace(/\D/g, "").length < 7 || !apiConfigured}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
          <button
            onClick={verifyAndCall}
            disabled={loading || !code}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Verify & call me"}
          </button>
        </div>
      )}

      {step === "calling" && (
        <p className="text-sm text-neutral-600">Placing your call now…</p>
      )}

      {step === "done" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-emerald-600">
            Your phone should be ringing — that&apos;s the real agent, live.
          </p>
          <button onClick={reset} className="self-start text-xs text-neutral-500 underline hover:text-neutral-950">
            Try another number
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600">{errorMessage}</p>
          <button onClick={reset} className="self-start text-xs text-neutral-500 underline hover:text-neutral-950">
            Try again
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-400">
        Use E.164 format with country code, e.g. +50432964465. A one-time
        code confirms it&apos;s really your number before anything calls it.
      </p>
    </div>
  );
}
