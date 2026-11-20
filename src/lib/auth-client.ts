import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  // Makes the `role` additional field type-safe on the client
  // (signUp.email({ role }), session.user.role, etc.)
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, useSession, signOut, updateUser } = authClient;
