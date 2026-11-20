/**
 * PizzaHub Server-Side Data Fetching Layer (Next.js App Router)
 * Follows modern React Server Component principles:
 * - Direct server-to-server calls (eliminates browser CORS & network blips)
 * - Automatic Next.js cache revalidation
 * - Graceful fallback so pages never crash on network timeouts
 */

import { MenuItem } from "@/app/menu/page-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://pizzaserver.vercel.app/api";

export interface MenuFetchParams {
  category?: string;
  location?: string;
  search?: string;
  sortBy?: string;
  spicy?: string;
  veg?: string;
}

/**
 * Fetch menu items on the server with Next.js ISR (Incremental Static Regeneration)
 */
export async function getServerMenuItems(
  params?: MenuFetchParams
): Promise<MenuItem[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim()) searchParams.append("search", params.search.trim());
    if (params?.category && params.category !== "All") {
      searchParams.append("category", params.category);
    }
    if (params?.location && params.location !== "all") {
      searchParams.append("location", params.location);
    }
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const url = `${API_BASE}/menu${queryStr}`;

    const res = await fetch(url, {
      next: { revalidate: 30, tags: ["menu"] }, // Revalidate every 30 seconds
    });

    if (!res.ok) {
      console.warn(`[Server Fetch] /menu returned status ${res.status}`);
      return [];
    }

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("[Server Fetch Error] getServerMenuItems:", err);
    return [];
  }
}

/**
 * Fetch a single pizza by ID on the server
 */
export async function getServerMenuItemById(
  id: string
): Promise<MenuItem | null> {
  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      next: { revalidate: 30, tags: [`menu-${id}`] },
    });

    if (!res.ok) {
      console.warn(`[Server Fetch] /menu/${id} returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error(`[Server Fetch Error] getServerMenuItemById (${id}):`, err);
    return null;
  }
}

/**
 * Fetch featured pizzas for the Home Page Showcase
 */
export async function getServerFeaturedPizzas(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${API_BASE}/menu?sortBy=featured`, {
      next: { revalidate: 30, tags: ["featured-pizzas"] },
    });

    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data.slice(0, 4) : [];
  } catch (err) {
    console.error("[Server Fetch Error] getServerFeaturedPizzas:", err);
    return [];
  }
}
