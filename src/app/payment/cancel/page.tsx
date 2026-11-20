"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0c0c0e] px-4 py-12 text-zinc-100">
      <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-[#121216] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-3xl">
          🔄
        </div>
        <h1 className="mt-4 text-2xl font-black text-white">Payment Cancelled</h1>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          No charges were made to your card. You can upgrade to Gold Premium Kitchen at any time whenever you're ready to unlock unlimited pizzas.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard/vendor/subscription"
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95"
          >
            Review Subscription Plans →
          </Link>
          <Link
            href="/dashboard/vendor"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            Return to Vendor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
