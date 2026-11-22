import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — PizzaHub",
  description: "Learn about the PizzaHub customer satisfaction guarantee, order cancellations, and refund processing procedures.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Refund & Cancellation Policy</span>
        </nav>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-850 bg-[#121216] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <span>🔄</span>
            <span>Customer Satisfaction Guarantee</span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl font-artisan">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            We are committed to delivering artisan pizza perfection with complete consumer transparency.
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. 100% Quality & Freshness Guarantee</h2>
            <p>
              Every artisan pizza must arrive piping hot and prepared to exacting standards. You are entitled to a full refund or an immediate complimentary replacement if:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 text-zinc-400">
              <li>Your pizza arrives severely damaged, crushed, or visibly cold due to courier transit issues.</li>
              <li>You received the incorrect menu item or an omitted topping that violates your dietary selection.</li>
              <li>An order was confirmed but failed to arrive within an acceptable delivery window.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Order Cancellation Window</h2>
            <p>
              Because artisan sourdough pizzas are freshly stretched and baked at 900°F upon order confirmation, cancellation timing is crucial:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 text-zinc-400">
              <li><strong>Pending Status:</strong> You can cancel your order directly from your Customer Orders Dashboard for an immediate 100% refund.</li>
              <li><strong>Accepted / Cooking Status:</strong> Once the kitchen begins dough stretching and oven baking, cancellations cannot be processed automatically.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. How to Request a Refund</h2>
            <p>
              To request a resolution:
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-1.5 text-zinc-400">
              <li>Open your Customer Orders Dashboard at <Link href="/dashboard/customer" className="text-amber-400 hover:underline">/dashboard/customer</Link>.</li>
              <li>Locate the relevant order ID and click &ldquo;Report Issue&rdquo;, or email <a href="mailto:refunds@pizzahub.com" className="text-amber-400 hover:underline">refunds@pizzahub.com</a> with your order number and a photo of the received item.</li>
              <li>Approved refunds are credited back to your original payment method within 3 to 5 business days.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
