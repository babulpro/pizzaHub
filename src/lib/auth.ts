import { betterAuth } from "better-auth";
import { APIError, getOAuthState } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import bcrypt from "bcryptjs";
import { hashPassword, verifyPassword } from "@better-auth/utils/password";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://PizzaHub:XJBqKeKG0yqkv6Vh@ac-yv7g1rx-shard-00-00.ai4dcx0.mongodb.net:27017,ac-yv7g1rx-shard-00-01.ai4dcx0.mongodb.net:27017,ac-yv7g1rx-shard-00-02.ai4dcx0.mongodb.net:27017/PizzaHub?ssl=true&replicaSet=atlas-uh0pmv-shard-0&authSource=admin";

const client = new MongoClient(MONGODB_URI);
const db = client.db(process.env.DB_NAME || "PizzaHub");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || "PizzaHub-Production-Better-Auth-Secret-Key-2026";

/**
 * Roles a user may select during PizzaHub registration.
 * - "customer": Pizza lover placing orders and tracking deliveries.
 * - "vendor": Pizzeria / Restaurant owner managing menu items and kitchen orders.
 * "admin" is intentionally NOT self-assignable — admin accounts must be promoted
 * directly in the database for platform security.
 */
export const PUBLIC_ROLES = ["customer", "vendor"] as const;
export type PublicRole = (typeof PUBLIC_ROLES)[number];
export type UserRole = PublicRole | "admin";

const normalizeRole = (value: unknown): PublicRole | null => {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  return (PUBLIC_ROLES as readonly string[]).includes(role)
    ? (role as PublicRole)
    : null;
};

const getBaseURL = () => {
  // If running in development locally (and not in Vercel):
  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    if (process.env.LOCAL_AUTH_URL) return process.env.LOCAL_AUTH_URL;
    if (process.env.BETTER_AUTH_URL?.includes("localhost")) {
      return process.env.BETTER_AUTH_URL;
    }
    return "http://localhost:3000";
  }

  // Production or Vercel deployment:
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.NEXT_PUBLIC_CLIENT_URL) return process.env.NEXT_PUBLIC_CLIENT_URL;
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://pizzahub-ruddy-gamma.vercel.app";
};

export const auth = betterAuth({
  baseURL: getBaseURL(),
  secret: BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://pizzahub-ruddy-gamma.vercel.app",
    "https://*.vercel.app",
  ],
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  socialProviders: {
    ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return hashPassword(password);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        // Support bcrypt hashes ($2a$, $2b$, $2y$) from seed/Express server
        if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
          try {
            return await bcrypt.compare(password, hash);
          } catch {
            return false;
          }
        }
        // Support Better-Auth scrypt hashes
        try {
          return await verifyPassword(hash, password);
        } catch {
          return false;
        }
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          let role = normalizeRole(ctx?.body?.role);
          let businessName = ctx?.body?.businessName as string | undefined;

          if (!role && ctx) {
            try {
              const state = await getOAuthState<{ role?: string; businessName?: string }>();
              role = normalizeRole(state?.role);
              if (state?.businessName) {
                businessName = state.businessName;
              }
            } catch {
              // Not an OAuth request — fall back below.
            }
          }

          const assignedRole = role ?? normalizeRole(user.role) ?? "customer";

          return {
            data: {
              ...user,
              role: assignedRole,
              businessName: assignedRole === "vendor" ? businessName?.trim() : undefined,
              subscriptionPlan: "free",
              isBlocked: false,
              createdAt: new Date(),
            },
          };
        },
      },
      update: {
        before: async (data) => {
          const { role } = data as { role?: unknown };
          if (role !== undefined && role !== "admin" && normalizeRole(role) === null) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role. Choose either customer or vendor.",
            });
          }
          return { data };
        },
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
    usePlural: true,
  }),
});
