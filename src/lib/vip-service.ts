import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export interface UserTokenPayload {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
  image?: string;
}

export function parseJwtPayload(token: string): UserTokenPayload | null {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    const parts = cleanToken.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Join VIP Club directly in MongoDB
 */
export async function joinVipMemberService(email: string, token?: string | null) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      success: false,
      message: "A valid email address is required to join the VIP Club.",
    };
  }

  const user = token ? parseJwtPayload(token) : null;
  const db = await getDb();
  const vipCollection = db.collection("vip_members");

  const queryConditions: Record<string, unknown>[] = [{ email: cleanEmail }];
  const userId = user?.id || user?._id;
  if (userId) {
    queryConditions.push({ userId });
  }

  // Check if member already exists
  const existing = await vipCollection.findOne({ $or: queryConditions });
  if (existing) {
    return {
      success: true,
      alreadyJoined: true,
      message:
        "You're already an active VIP Club member! Secret drops will continue arriving in your inbox.",
      data: existing,
    };
  }

  const newMember = {
    userId: userId || null,
    name: user?.name || cleanEmail.split("@")[0],
    email: cleanEmail,
    role: user?.role || "customer",
    avatar:
      user?.image ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    status: "active",
    joinedAt: new Date(),
  };

  const result = await vipCollection.insertOne(newMember);

  return {
    success: true,
    message:
      "🍕 Welcome to the PizzaHub VIP Club! Secret drops and tasting invites are on their way.",
    data: {
      _id: result.insertedId.toString(),
      ...newMember,
    },
  };
}

/**
 * Get all VIP members for the Admin Dashboard
 */
export async function getVipMembersService(search?: string | null) {
  const db = await getDb();
  const vipCollection = db.collection("vip_members");

  let query: Record<string, unknown> = {};
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query = {
      $or: [{ name: regex }, { email: regex }],
    };
  }

  const members = await vipCollection
    .find(query)
    .sort({ joinedAt: -1 })
    .toArray();

  return {
    success: true,
    count: members.length,
    data: members.map((m) => ({
      ...m,
      _id: m._id.toString(),
    })),
  };
}

/**
 * Remove a member from the VIP list (Admin action)
 */
export async function removeVipMemberService(id: string) {
  const db = await getDb();
  const vipCollection = db.collection("vip_members");

  let query: Record<string, unknown>;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await vipCollection.deleteOne(query);

  if (result.deletedCount === 0) {
    return {
      success: false,
      message: "VIP member record not found or already removed.",
    };
  }

  return {
    success: true,
    message: "Member successfully removed from the VIP Club roster.",
  };
}

/**
 * Check VIP membership status for current user
 */
export async function getVipStatusService(email: string, userId?: string | null) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const db = await getDb();
  const vipCollection = db.collection("vip_members");

  const queryConditions: Record<string, unknown>[] = [{ email: cleanEmail }];
  if (userId) {
    queryConditions.push({ userId });
  }

  const member = await vipCollection.findOne({ $or: queryConditions });

  return {
    success: true,
    isVip: Boolean(member),
    data: member ? { ...member, _id: member._id.toString() } : null,
  };
}
