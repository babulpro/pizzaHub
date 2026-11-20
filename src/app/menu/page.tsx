import { Suspense } from "react";
import MenuClient, { MenuItem } from "./page-client";
import { getServerMenuItems } from "@/lib/server-api";

export { type MenuItem };

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    category?: string;
    location?: string;
    sortBy?: string;
  }>;
}

async function MenuContent({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialItems = await getServerMenuItems(resolvedParams);

  return (
    <MenuClient initialItems={initialItems} initialParams={resolvedParams} />
  );
}

export default function MenuPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0c0e] py-24 text-center text-zinc-400">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-3xl animate-bounce">
            🍕
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">
            Fetching fresh wood-fired pizzas from the kitchens...
          </p>
        </div>
      }
    >
      <MenuContent searchParams={searchParams} />
    </Suspense>
  );
}
