import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — PizzaHub Artisan Platform",
  description:
    "Learn about PizzaHub's mission to connect authentic wood-fired pizzerias with pizza lovers across Dhaka, Bangladesh.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">About PizzaHub</span>
        </nav>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-850 bg-[#121216] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <span>🍕</span>
            <span>Artisan Craft & Community</span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl font-artisan">
            About PizzaHub
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Connecting passionate, independent wood-fired kitchens with pizza connoisseurs across Dhaka, Bangladesh.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>🔥</span>
              <span>Our Artisan Philosophy</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-300">
              PizzaHub is not a generic mass-delivery app. We were founded on an uncompromising devotion to authentic pizza craft. Every pizzeria on our platform respects traditional Neapolitan principles: naturally leavened sourdough fermented for 48 to 72 hours, hand-stretched dough without rolling pins, San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, and blistering 900°F stone oven baking in under 90 seconds.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>👨‍🍳</span>
              <span>Empowering Independent Pizzerias</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-300">
              Unlike traditional food delivery portals that impose prohibitive 30%+ commission fees, PizzaHub provides fair, transparent tools for culinary entrepreneurs. Local artisan pizzaiolos can list up to 3 signature pies completely free, manage live orders on an intuitive kitchen Kanban dashboard, or unlock unlimited listings and verified partner badges with our Gold Premium tier.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>📍</span>
              <span>Serving Dhaka, Bangladesh</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-300">
              From Gulshan, Banani, and Baridhara to Dhanmondi, Uttara, and Mohakhali, our delivery network utilizes insulated thermal carriers to ensure every handcrafted pie arrives piping hot with its bubbly leopard-spotted crust intact.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>✉️</span>
              <span>Get In Touch</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-300">
              Have feedback, culinary suggestions, or want to partner your kitchen with us? Reach our team at{" "}
              <a href="mailto:support@pizzahub.com" className="text-amber-400 font-bold hover:underline">
                support@pizzahub.com
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 transition shadow-lg shadow-amber-500/20"
              >
                Browse Artisan Menu →
              </Link>
              <Link
                href="/sign-up?role=vendor"
                className="rounded-xl border border-zinc-750 bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-200 hover:text-white transition"
              >
                Partner As A Pizzeria
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
