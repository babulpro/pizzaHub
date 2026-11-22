import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PizzaHub",
  description: "Read the official Terms of Service governing customer orders, partner pizzeria vendor quotas, and platform guidelines.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-850 bg-[#121216] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <span>📜</span>
            <span>Platform Agreement</span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl font-artisan">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Effective Date: November 2026 • Please read carefully before using PizzaHub services.
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PizzaHub (the &ldquo;Platform&rdquo;) as either an Artisan Foodie (Customer) or a Pizzeria Partner (Vendor), you agree to be bound by these Terms of Service. If you do not agree, you must discontinue platform use immediately.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Pizzeria Vendor Guidelines & Listing Quotas</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li><strong>Free Starter Tier:</strong> Pizzeria vendors may publish up to <strong>3 active menu items</strong> without any subscription cost.</li>
              <li><strong>Gold Premium Kitchen Tier:</strong> Vendors subscribing to the Gold tier unlock unlimited pizza listings, priority ranking, and verified badges.</li>
              <li><strong>Accuracy & Quality:</strong> Vendors are solely responsible for menu descriptions, accurate allergen declarations, truthful pricing, and timely kitchen fulfillment.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. Food Ordering & Fulfillment</h2>
            <p>
              Orders submitted on PizzaHub are transmitted directly to the designated partner kitchen. While partner kitchens endeavor to adhere to stated prep times (typically 20–25 minutes), unexpected rush periods or traffic conditions may occasionally alter delivery timing.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. Platform Administration & Account Enforcement</h2>
            <p>
              PizzaHub reserves the right to suspend, block, or permanently delete accounts that engage in fraudulent orders, harassment, food safety violations, or repeated cancellations.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">5. Contact & Legal Inquiries</h2>
            <p>
              For legal inquiries regarding these Terms, contact our legal counsel at{" "}
              <a href="mailto:legal@pizzahub.com" className="text-amber-400 font-bold hover:underline">
                legal@pizzahub.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
