"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ensureApiToken } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>("Verifying your Stripe payment...");

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!sessionId) {
        if (isMounted) {
          setVerifying(false);
          setSuccess(true);
          setMessage("Welcome to Gold Premium Kitchen! Your subscription is active.");
        }
        return;
      }

      try {
        await ensureApiToken();
        const res = await api.get<{ message?: string; paid?: boolean }>(
          `/stripe/verify-session/${sessionId}`
        );

        if (isMounted) {
          if (res.success) {
            setSuccess(true);
            setMessage(res.message || "Payment verified successfully! Welcome to Gold Premium Kitchen!");
          } else {
            setSuccess(false);
            setMessage(res.message || "Payment verification could not be completed.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setSuccess(true); // Don't block vendor if webhook already processed
          setMessage("Your Gold Premium upgrade is being processed. You can now publish unlimited pizzas!");
        }
      } finally {
        if (isMounted) setVerifying(false);
      }
    }

    verify();
  }, [sessionId]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0c0c0e] px-4 py-12 text-zinc-100">
      <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-[#121216] p-8 text-center shadow-2xl">
        {verifying ? (
          <div>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <h2 className="mt-6 text-lg font-bold text-white">Confirming Stripe Subscription...</h2>
            <p className="mt-2 text-xs text-zinc-400">{message}</p>
          </div>
        ) : success ? (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-4xl shadow-inner">
              ⭐
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-black text-amber-400">
              ★ GOLD PARTNER KITCHEN
            </div>
            <h1 className="mt-3 text-2xl font-black text-white">Payment Confirmed!</h1>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{message}</p>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-left text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>✓</span>
                <span>Unlimited Pizza Listings Activated</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>✓</span>
                <span>Gold Chef Verified Badge Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>✓</span>
                <span>Top Search & Homepage Spotlight Enabled</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/dashboard/vendor"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95"
              >
                Go to Vendor Dashboard →
              </Link>
              <Link
                href="/menu"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                View Public Menu
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 text-lg font-bold text-white">Verification Pending</h2>
            <p className="mt-2 text-xs text-zinc-400">{message}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/dashboard/vendor"
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/dashboard/vendor/subscription"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                View Subscription Plans
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center bg-[#0c0c0e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
