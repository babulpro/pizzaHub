"use server";

import { revalidatePath } from "next/cache";
import { joinVipMemberService } from "@/lib/vip-service";

export interface VipActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action for joining the VIP Club
 * Executes directly on the Next.js server with MongoDB
 * and triggers cache revalidation for the Admin Dashboard.
 */
export async function joinVipServerAction(
  email: string,
  token?: string | null
): Promise<VipActionResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    const result = await joinVipMemberService(email, token);

    if (!result.success) {
      return { success: false, error: result.message };
    }

    // Refresh the admin dashboard VIP member view
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: result.message,
    };
  } catch (err: unknown) {
    console.error("Server Action joinVipServerAction error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to join the VIP Club.",
    };
  }
}
