"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";

interface QuotaState {
  plan: "free" | "premium";
  activeCount: number;
  limit: number | string;
  remaining: number | string;
  canAddMore: boolean;
  isPremium: boolean;
}

export default function VendorSubscriptionPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; businessName?: string }
    | undefined;

  const [quota, setQuota] = useState<QuotaState>({
    plan: "free",
    activeCount: 0,
    limit: 3,
    remaining: 3,
    canAddMore: true,
    isPremium: false,
  });

  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch current vendor quota
  const loadQuota = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await ensureApiToken();
      const res = await api.get<{
        plan: "free" | "premium";
        isPremium: boolean;
        activeCount: number;
        limit: number | string;
        remaining: number | string;
        canAddMore: boolean;
      }>("/menu/vendor/quota");

      if (res.success) {
        const rawQuota = (res.quota || res) as Partial<QuotaState>;
        const isPrem = Boolean(rawQuota.isPremium || rawQuota.plan === "premium");
        const activeCount = Number(rawQuota.activeCount) || 0;
        setQuota({
          plan: isPrem ? "premium" : "free",
          activeCount,
          limit: isPrem ? "unlimited" : 3,
          remaining: isPrem ? "unlimited" : Math.max(0, 3 - activeCount),
          canAddMore: isPrem || activeCount < 3,
          isPremium: isPrem,
        });
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load subscription status.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthPending && user) {
      loadQuota();
    }
  }, [user, isAuthPending, loadQuota]);

  const [confirming, setConfirming] = useState(false);

  // Directly confirm and sync Gold subscription
  const handleDirectConfirmSubscription = async () => {
    setConfirming(true);
    setErrorMessage(null);
    try {
      await ensureApiToken();
      const res = await api.post<{ success: boolean; message?: string }>("/stripe/confirm-subscription");
      if (res.success) {
        showToast.pizza(
          "Subscription Active! ⭐",
          "Your Gold Premium Kitchen subscription is confirmed. You now have unlimited pizza listings!"
        );
        loadQuota();
      } else {
        const msg = res.message || "Failed to confirm subscription.";
        setErrorMessage(msg);
        showToast.error("Confirmation Failed", msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error confirming subscription.";
      setErrorMessage(msg);
      showToast.error("Error", msg);
    } finally {
      setConfirming(false);
    }
  };

  // Initiate Stripe Checkout Session
  const handleUpgradeToPremium = async () => {
    setUpgrading(true);
    setErrorMessage(null);
    showToast.pizza(
      "Connecting to Stripe... 💳",
      "Opening your secure subscription checkout session."
    );
    try {
      await ensureApiToken();
      const res = await api.post<{ url: string; sessionId?: string }>("/stripe/create-checkout-session");
      const checkoutUrl =
        (res.data as { url?: string })?.url ||
        (typeof res.url === "string" ? res.url : "");

      if (res.success && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        const errMsg = res.message || "Failed to create Stripe Checkout session. Please try again.";
        setErrorMessage(errMsg);
        showToast.error("Upgrade Failed", errMsg);
        setUpgrading(false);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error connecting to Stripe.";
      setErrorMessage(errMsg);
      showToast.error("Stripe Error", errMsg);
      setUpgrading(false);
    }
  };

  // Auth Protection
  if (!isAuthPending && !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-4 text-xl font-bold text-white">Vendor Sign In Required</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Please sign in to your vendor account to view your subscription details and upgrade options.
          </p>
          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
          >
            Sign In to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition"
          >
            <span>←</span>
            <span>Back to Kitchen Dashboard</span>
          </Link>

          <span className="text-xs text-zinc-400">
            Account: <strong className="text-white">{user?.email}</strong>
          </span>
        </div>

        {/* Header Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md">
            <span>🍕</span>
            <span>PIZZERIA VENDOR MEMBERSHIP</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Choose the Perfect Plan for Your Kitchen
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-zinc-400 sm:text-base">
            Start free with up to 3 signature pizzas. When your kitchen is ready to scale, upgrade to Gold Premium Kitchen for unlimited listings and top homepage ranking.
          </p>
        </div>

        {/* Current Plan Alert / Quota Banner */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-zinc-400">Current Status:</span>
                {quota.isPremium ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-black text-black">
                    ★ Gold Premium Partner (Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">
                    Starter Kitchen (Free Tier)
                  </span>
                )}
              </div>

              {!quota.isPremium ? (
                <div className="mt-3">
                  <p className="text-xs text-zinc-300">
                    You have published <strong className="text-amber-400">{quota.activeCount} of 3 free pizzas</strong>.
                  </p>
                  {quota.activeCount >= 3 ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300">
                      <span>⚠️</span>
                      <span>
                        Free limit reached (3/3 pizzas). Upgrade to Gold Premium to publish more pizzas!
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-400">
                      You can still add <strong>{Math.max(0, 3 - quota.activeCount)} more pizza(s)</strong> under your free plan.
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-emerald-400 font-medium">
                  ✓ Unlimited uploads active! Your signature pies are featured with priority ranking across PizzaHub.
                </p>
              )}
            </div>

            {/* Quick Action Button */}
            {!quota.isPremium && (
              <button
                type="button"
                onClick={handleUpgradeToPremium}
                disabled={upgrading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {upgrading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Redirecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>★</span>
                    <span>Upgrade to Gold Premium ($29.00/mo)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Pricing Cards (2-column grid) */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 1. Free Starter Kitchen Plan */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-md transition-all ${
              !quota.isPremium
                ? "border-zinc-700 bg-zinc-900/60 shadow-xl"
                : "border-zinc-800 bg-zinc-950/40 opacity-75"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">
                  STARTER KITCHEN
                </span>
                {!quota.isPremium && (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    Your Current Plan
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-zinc-400">/ forever</span>
              </div>

              <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                Perfect for boutique bakeries, pop-ups, and indie pizzaiolos testing the waters.
              </p>

              {/* Feature Checklist */}
              <ul className="mt-8 space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    Publish up to <strong>3 signature pizzas</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Standard listing on public Menu and Home page</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Real-time incoming customer orders</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Accept or reject orders with 1-click status updates</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>Upload cap: Maximum 3 pizzas</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>No Gold Chef Partner Badge</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>No featured ranking spotlight</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <Link
                href="/dashboard/vendor"
                className="block w-full text-center rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-xs font-bold text-white transition hover:bg-zinc-700"
              >
                {!quota.isPremium ? "Return to Dashboard" : "Starter Features"}
              </Link>
            </div>
          </div>

          {/* 2. Gold Premium Kitchen Plan */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border-2 p-8 shadow-2xl backdrop-blur-md transition-all ${
              quota.isPremium
                ? "border-emerald-500/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950"
                : "border-amber-500/80 bg-gradient-to-b from-zinc-900/95 via-zinc-900/80 to-zinc-950 shadow-amber-500/10 hover:border-amber-400"
            }`}
          >
            {/* Top Pill */}
            <div className="absolute -top-3.5 right-6">
              <span className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                ⭐ Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                  GOLD PREMIUM KITCHEN
                </span>
                {quota.isPremium ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    Active Plan
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-400/90">Instant Activation</span>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$29.00</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>

              <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                For ambitious pizzerias, renowned kitchens, and chefs looking to showcase their complete artisan menu.
              </p>

              {/* Feature Checklist */}
              <ul className="mt-8 space-y-3.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>Unlimited Pizza Uploads</strong> (no 3-item limit)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>★ Gold Partner Chef Badge</strong> on all menu cards
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>Top Priority Ranking</strong> on Home page & `/menu`
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>Secure Stripe Billing</strong> & automated digital invoices
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>Direct Customer Ordering</strong> with zero extra commission
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>
                    <strong>Priority Kitchen Support</strong> from the PizzaHub team
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-500/20">
              {quota.isPremium ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-3 text-center text-xs font-bold text-emerald-400">
                  ✓ Your Kitchen Has Unlimited Access (Gold Partner)
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleUpgradeToPremium}
                    disabled={upgrading || confirming}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 text-xs font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {upgrading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Redirecting to Stripe Checkout...</span>
                      </div>
                    ) : (
                      <span>Subscribe with Stripe Checkout ($29.00/mo) →</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectConfirmSubscription}
                    disabled={confirming || upgrading}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 text-xs font-semibold text-zinc-300 hover:border-amber-500/40 hover:text-white transition cursor-pointer"
                  >
                    {confirming ? "Confirming & Syncing Plan..." : "⚡ Confirm & Sync Active Subscription"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216]">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white">Full Feature Comparison</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Compare Starter Kitchen vs Gold Premium Kitchen side-by-side.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Feature</th>
                  <th className="py-3.5 px-6">Starter (Free)</th>
                  <th className="py-3.5 px-6 text-amber-400">Gold Premium ($29/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Active Pizza Upload Limit</td>
                  <td className="py-3.5 px-6">3 Pizzas</td>
                  <td className="py-3.5 px-6 font-bold text-amber-400">Unlimited Pizzas</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Public Visibility</td>
                  <td className="py-3.5 px-6">Standard</td>
                  <td className="py-3.5 px-6 font-bold text-amber-400">Top Priority Ranking</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Gold Chef Verified Badge</td>
                  <td className="py-3.5 px-6 text-zinc-500">—</td>
                  <td className="py-3.5 px-6 font-bold text-amber-400">★ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Order Management</td>
                  <td className="py-3.5 px-6">Included</td>
                  <td className="py-3.5 px-6 font-bold text-amber-400">Included (Real-time)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Monthly Cost</td>
                  <td className="py-3.5 px-6 font-bold text-white">$0</td>
                  <td className="py-3.5 px-6 font-bold text-amber-400">$29.00 / month</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-white">Payment Method</td>
                  <td className="py-3.5 px-6">None needed</td>
                  <td className="py-3.5 px-6 font-medium text-zinc-300">Stripe (Card / Apple Pay / GPay)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-14 space-y-4">
          <h3 className="text-lg font-bold text-white text-center">Frequently Asked Questions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5">
              <h4 className="text-xs font-bold text-white">What happens after I upload 3 free pizzas?</h4>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Under the Starter plan, you can publish up to 3 active pizzas for free. When you attempt to upload a 4th item, you will be redirected to this subscription page to unlock unlimited uploads with Gold Premium.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5">
              <h4 className="text-xs font-bold text-white">When is my Gold Badge activated?</h4>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Immediately upon completing checkout with Stripe! Your account is automatically upgraded, your pizzas receive the Gold badge, and the 3-pizza upload cap is removed instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5">
              <h4 className="text-xs font-bold text-white">Can I cancel anytime?</h4>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Yes, there are zero long-term commitments. You can cancel your subscription at any time without fees.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5">
              <h4 className="text-xs font-bold text-white">Is payment processing secure?</h4>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                All transactions are processed directly by Stripe using bank-grade 256-bit SSL encryption. PizzaHub never stores your credit card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
