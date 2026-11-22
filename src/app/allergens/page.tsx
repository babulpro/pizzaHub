import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Safety & Allergen Notice — PizzaHub",
  description: "Comprehensive food safety guidelines and allergen declarations for PizzaHub artisan kitchens.",
};

export default function AllergensPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Food Safety & Allergens</span>
        </nav>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-850 bg-[#121216] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <span>🌿</span>
            <span>Health & Safety Compliance</span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl font-artisan">
            Food Safety & Allergen Notice
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Detailed information regarding ingredients, cross-contact precautions, and dietary labeling across partner kitchens.
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. Common Allergen Disclosures</h2>
            <p>
              Our artisan partner pizzerias utilize raw, unbleached flours and authentic ingredients. The following common allergens are present in our partner kitchens:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 text-zinc-400">
              <li><strong>Wheat Gluten:</strong> Naturally present in all traditional sourdough and Neapolitan pizza doughs.</li>
              <li><strong>Dairy & Lactose:</strong> Buffalo mozzarella D.O.P., fior di latte, Gorgonzola dolce, fontina, and Parmigiano-Reggiano.</li>
              <li><strong>Tree Nuts & Seeds:</strong> Pine nuts (wild basil pesto), toasted pistachios (mortadella specials), and walnuts.</li>
              <li><strong>Cured Meats & Sulfites:</strong> Bresaola, Calabrian salami, beef pepperoni, and prosciutto cotto.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Cross-Contact Precautions</h2>
            <p>
              While partner kitchens clean prep tables between orders, kitchens use shared stone-hearth wood-fired ovens. <strong>We cannot guarantee 100% absence of airborne flour dust or cross-contact for individuals with severe celiac disease or anaphylactic allergies.</strong>
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. Menu Dietary Badges</h2>
            <p>
              To help you navigate our offerings safely, our menu features verified visual badges:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3">
                <span className="text-xl">🌱</span>
                <div>
                  <h4 className="font-bold text-emerald-400 text-xs">Vegetarian Only (100% Meat-Free)</h4>
                  <p className="text-[11px] text-zinc-400">Crafted with cheeses, vegetable toppings, and zero meat or animal rennet.</p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3">
                <span className="text-xl">🌶️</span>
                <div>
                  <h4 className="font-bold text-amber-400 text-xs">Spicy Specials</h4>
                  <p className="text-[11px] text-zinc-400">Infused with Calabrian chili peppers, hot honey, or spicy marinara.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-850 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. Dietary Questions?</h2>
            <p>
              Before placing an order with specialized dietary requirements, you may leave kitchen instructions in the &ldquo;Kitchen Note&rdquo; input at checkout or contact our team at{" "}
              <a href="mailto:safety@pizzahub.com" className="text-amber-400 font-bold hover:underline">
                safety@pizzahub.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
