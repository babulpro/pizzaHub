import { betterAuth } from "better-auth";
import { APIError, getOAuthState } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db(process.env.DB_NAME || "PizzaHub");

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

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL as string,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
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
          if (role !== undefined && normalizeRole(role) === null) {
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
