/**
 * PizzaHub Server-Side Data Fetching Layer (Next.js App Router)
 * Follows modern React Server Component principles:
 * - Direct server-to-server calls with fast timeout
 * - Instant MongoDB fallback so pages NEVER fail, crash, or show empty states
 * - Automatic Next.js cache revalidation
 */

import { MenuItem } from "@/app/menu/page-client";
import {
  getMenuItemsFromDb,
  getMenuItemByIdFromDb,
  MenuFilterParams,
} from "./menu-service";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://pizzaserver.vercel.app/api";

export interface MenuFetchParams extends MenuFilterParams {
  spicy?: string;
  veg?: string;
}

/**
 * Fetch menu items on the server with Next.js ISR and instant DB fallback
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 30, tags: ["menu"] },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[Server Fetch] Remote /menu timed out or failed, falling back to direct DB:", err);
  }

  // Resilient fallback directly from MongoDB
  return getMenuItemsFromDb(params);
}

/**
 * Fetch a single pizza by ID on the server
 */
export async function getServerMenuItemById(
  id: string
): Promise<MenuItem | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}/menu/${id}`, {
      signal: controller.signal,
      next: { revalidate: 30, tags: [`menu-${id}`] },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.data) {
        if (!json.data.vendor && json.data.vendorId) {
          const dbItem = await getMenuItemByIdFromDb(id).catch(() => null);
          if (dbItem?.vendor) {
            json.data.vendor = dbItem.vendor;
          }
        }
        return json.data;
      }
    }
  } catch (err) {
    console.warn(`[Server Fetch] Remote /menu/${id} failed, falling back to direct DB:`, err);
  }

  // Resilient fallback directly from MongoDB
  return getMenuItemByIdFromDb(id);
}

/**
 * Fetch featured pizzas for the Home Page Showcase
 */
export async function getServerFeaturedPizzas(): Promise<MenuItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}/menu?sortBy=featured`, {
      signal: controller.signal,
      next: { revalidate: 30, tags: ["featured-pizzas"] },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.slice(0, 4);
      }
    }
  } catch (err) {
    console.warn("[Server Fetch] Remote featured pizzas failed, falling back to direct DB:", err);
  }

  // Direct MongoDB fallback for home page
  const dbItems = await getMenuItemsFromDb({ sortBy: "featured" });
  return dbItems.slice(0, 4);
}
