import { Metadata } from "next";
import { Suspense } from "react";
import PizzaDetailsClient from "./details-client";
import { getServerMenuItemById } from "@/lib/server-api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getServerMenuItemById(id);
  if (!item) {
    return {
      title: "Artisan Pizza | PizzaHub",
      description: "Wood-fired handcrafted artisan pizza.",
    };
  }

  const priceStr = typeof item.price === "number" ? item.price.toFixed(2) : String(item.price || "0.00");
  return {
    title: `${item.itemName} | PizzaHub Artisan Oven`,
    description: item.description,
    openGraph: {
      title: `${item.itemName} — $${priceStr}`,
      description: item.description,
      images: item.images && item.images.length > 0 ? [item.images[0]] : [],
    },
  };
}

async function DetailsContent({ params }: PageProps) {
  const { id } = await params;
  const initialItem = await getServerMenuItemById(id);
  return <PizzaDetailsClient id={id} initialItem={initialItem} />;
}

export default function PizzaDetailsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Loading artisan pizza...</p>
          </div>
        </div>
      }
    >
      <DetailsContent params={params} />
    </Suspense>
  );
}
