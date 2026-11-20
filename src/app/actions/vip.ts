"use server";

import { revalidatePath } from "next/cache";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://pizzaserver.vercel.app/api";

export interface VipActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action for joining the VIP Club
 * Revalidates the Admin Dashboard VIP roster automatically
 */
export async function joinVipServerAction(
  email: string,
  token: string
): Promise<VipActionResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please provide a valid email address." };
  }

  if (!token) {
    return {
      success: false,
      error: "You must be signed in to join the VIP Club.",
    };
  }

  try {
    const res = await fetch(`${RAW_API_URL}/vip/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.message || "Failed to join VIP Club.",
      };
    }

    // Modern Next.js cache revalidation — instantly refreshes admin roster
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: data.message || "Welcome to the PizzaHub VIP Club!",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error on server",
    };
  }
}
