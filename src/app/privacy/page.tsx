import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PizzaHub",
  description: "Read the PizzaHub Privacy Policy regarding personal data handling, cookies, and order fulfillment security.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-850 bg-[#121216] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <span>🔒</span>
            <span>Data Protection & Trust</span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl font-artisan">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Last updated: November 2026 • Effective for all PizzaHub users and partner kitchens.
          </p>
        </div>

        {/* Policy Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. Information We Collect</h2>
            <p>
              PizzaHub strictly collects only the minimum information necessary to provide and fulfill food ordering and vendor services:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 text-zinc-400">
              <li><strong>Account Identifiers:</strong> Name, verified email address, and profile photo when using social OAuth (Google/GitHub).</li>
              <li><strong>Delivery Information:</strong> Physical delivery address and recipient contact details provided during checkout.</li>
              <li><strong>Pizzeria Vendor Information:</strong> Pizzeria business name, kitchen address, and menu listing details.</li>
              <li><strong>Technical Data:</strong> Browser session tokens, IP address, and cookie consent preferences for security verification.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. How We Use Your Information</h2>
            <p>
              Your data is exclusively utilized for:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 text-zinc-400">
              <li>Routing food orders directly to the designated artisan pizzeria kitchen.</li>
              <li>Providing real-time order status updates and kitchen preparation timelines.</li>
              <li>Delivering opted-in VIP Club newsletter updates and flash sale drop vouchers.</li>
              <li>Preventing fraudulent orders and maintaining platform security.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. Payment Security & Stripe Billing</h2>
            <p>
              All online subscription billing and payment processing is conducted through <strong>Stripe</strong> using 256-bit bank-grade SSL encryption. <strong>PizzaHub never stores or has access to your raw credit card numbers or banking secrets.</strong>
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. Third-Party Sharing & Advertising</h2>
            <p>
              We maintain a zero-advertising data policy:
            </p>
            <p className="mt-2 font-medium text-amber-400">
              PizzaHub never sells, rents, monetizes, or trades your personal data, order histories, or addresses to third-party data brokers or marketing agencies.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">5. Data Retention & Account Deletion</h2>
            <p>
              Users have the right to request permanent deletion of their account and associated data. When an account is removed, all authentication tokens, session logs, and VIP club memberships are purged immediately from our databases.
            </p>
            <p className="mt-3">
              For privacy inquiries or deletion requests, contact our privacy compliance officer at{" "}
              <a href="mailto:privacy@pizzahub.com" className="text-amber-400 font-bold hover:underline">
                privacy@pizzahub.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
