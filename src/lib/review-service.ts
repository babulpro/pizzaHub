import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { parseJwtPayload } from "./vip-service";

export interface ReviewItem {
  _id: string;
  itemId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerImage?: string | null;
  rating: number;
  comment: string;
  isVerifiedOrder: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Checks if a user has placed at least one pizza order on PizzaHub
 */
export async function hasUserOrderedAnyPizza(
  userId?: string | null,
  userEmail?: string | null
): Promise<boolean> {
  if (!userId && !userEmail) return false;

  const db = await getDb();
  const possibleIds: (ObjectId | string)[] = [];

  if (userId) {
    possibleIds.push(userId);
    if (ObjectId.isValid(userId)) {
      possibleIds.push(new ObjectId(userId));
    }
  }

  if (userEmail) {
    const user = await db
      .collection("users")
      .findOne({ email: userEmail.toLowerCase().trim() });
    if (user?._id) {
      possibleIds.push(user._id);
      possibleIds.push(user._id.toString());
    }
  }

  if (possibleIds.length === 0) return false;

  const orderCount = await db.collection("orders").countDocuments({
    customerId: { $in: possibleIds },
  });

  return orderCount > 0;
}

/**
 * Get all reviews for a specific menu item along with calculated stats
 */
export async function getReviewsForMenuItem(itemId: string): Promise<{
  reviews: ReviewItem[];
  stats: ReviewStats;
}> {
  const emptyStats: ReviewStats = {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  if (!itemId) return { reviews: [], stats: emptyStats };

  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = ObjectId.isValid(itemId)
    ? { $or: [{ itemId: new ObjectId(itemId) }, { itemId }] }
    : { itemId };

  const rawReviews = await db
    .collection("reviews")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;

  const reviews: ReviewItem[] = rawReviews.map((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    sumRating += Number(r.rating) || 5;

    return {
      _id: r._id.toString(),
      itemId: r.itemId ? r.itemId.toString() : itemId,
      customerId: r.customerId ? r.customerId.toString() : "",
      customerName: r.customerName || "Artisan Foodie",
      customerEmail: r.customerEmail || "",
      customerImage: r.customerImage || null,
      rating: Number(r.rating) || 5,
      comment: r.comment || "",
      isVerifiedOrder: !!r.isVerifiedOrder,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
    };
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  return {
    reviews,
    stats: {
      averageRating,
      totalReviews,
      ratingCounts,
    },
  };
}

/**
 * Check review eligibility for logged-in user on a specific item
 */
export async function checkReviewEligibilityService(
  authHeader: string | null,
  itemId?: string | null
) {
  if (!authHeader) {
    return {
      canReview: false,
      hasOrdered: false,
      existingReview: null,
      reason: "Not authenticated",
    };
  }

  const payload = parseJwtPayload(authHeader);
  if (!payload?.id && !payload?._id && !payload?.email) {
    return {
      canReview: false,
      hasOrdered: false,
      existingReview: null,
      reason: "Invalid token",
    };
  }

  const userId = (payload.id || payload._id || "").toString();
  const userEmail = payload.email || "";

  const hasOrdered = await hasUserOrderedAnyPizza(userId, userEmail);

  let existingReview: ReviewItem | null = null;
  if (itemId && hasOrdered) {
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemQuery: any = ObjectId.isValid(itemId)
      ? { $or: [{ itemId: new ObjectId(itemId) }, { itemId }] }
      : { itemId };

    const possibleIds: (ObjectId | string)[] = [];
    if (userId) {
      possibleIds.push(userId);
      if (ObjectId.isValid(userId)) possibleIds.push(new ObjectId(userId));
    }

    const review = await db.collection("reviews").findOne({
      ...itemQuery,
      customerId: { $in: possibleIds },
    });

    if (review) {
      existingReview = {
        _id: review._id.toString(),
        itemId: review.itemId ? review.itemId.toString() : itemId,
        customerId: review.customerId ? review.customerId.toString() : userId,
        customerName: review.customerName || payload.name || "Artisan Foodie",
        customerEmail: review.customerEmail || userEmail,
        customerImage: review.customerImage || payload.image || null,
        rating: Number(review.rating) || 5,
        comment: review.comment || "",
        isVerifiedOrder: !!review.isVerifiedOrder,
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
      };
    }
  }

  return {
    canReview: hasOrdered,
    hasOrdered,
    existingReview,
    reason: hasOrdered
      ? null
      : "You can leave a review only after ordering a pizza on PizzaHub.",
  };
}

/**
 * Submit or update a review
 */
export async function submitReviewService(
  authHeader: string | null,
  data: {
    itemId: string;
    rating: number;
    comment: string;
  }
) {
  if (!authHeader) {
    return {
      success: false,
      status: 401,
      message: "Please sign in to submit a review.",
    };
  }

  const payload = parseJwtPayload(authHeader);
  if (!payload?.id && !payload?._id && !payload?.email) {
    return {
      success: false,
      status: 401,
      message: "Session expired or invalid. Please sign in again.",
    };
  }

  const userId = (payload.id || payload._id || "").toString();
  const userEmail = payload.email || "";

  if (!data.itemId) {
    return {
      success: false,
      status: 400,
      message: "Valid pizza itemId is required.",
    };
  }

  const numRating = Number(data.rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return {
      success: false,
      status: 400,
      message: "Rating must be between 1 and 5 stars.",
    };
  }

  const cleanComment = (data.comment || "").trim();
  if (cleanComment.length < 3) {
    return {
      success: false,
      status: 400,
      message: "Review comment must be at least 3 characters.",
    };
  }

  // =========================================================================
  // CRITICAL RULE VERIFICATION:
  // "the customer can give review only after the order of any pizza."
  // =========================================================================
  const hasOrdered = await hasUserOrderedAnyPizza(userId, userEmail);
  if (!hasOrdered) {
    return {
      success: false,
      status: 403,
      message:
        "You can leave a review only after ordering a pizza on PizzaHub. Order any delicious artisan pizza to share your experience!",
    };
  }

  const db = await getDb();
  const itemObjectId = ObjectId.isValid(data.itemId) ? new ObjectId(data.itemId) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemQuery: any = itemObjectId
    ? { $or: [{ _id: itemObjectId }, { _id: data.itemId }] }
    : { _id: data.itemId };

  const item = await db.collection("menuItems").findOne(itemQuery);
  if (!item) {
    return {
      success: false,
      status: 404,
      message: "Pizza menu item not found.",
    };
  }

  const now = new Date();
  const possibleCustomerIds: (ObjectId | string)[] = [userId];
  if (ObjectId.isValid(userId)) possibleCustomerIds.push(new ObjectId(userId));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewItemQuery: any = itemObjectId
    ? { $or: [{ itemId: itemObjectId }, { itemId: data.itemId }] }
    : { itemId: data.itemId };

  // Check if review already exists
  const existing = await db.collection("reviews").findOne({
    ...reviewItemQuery,
    customerId: { $in: possibleCustomerIds },
  });

  if (existing) {
    await db.collection("reviews").updateOne(
      { _id: existing._id },
      {
        $set: {
          rating: numRating,
          comment: cleanComment,
          customerName: payload.name || existing.customerName || "Artisan Foodie",
          updatedAt: now,
        },
      }
    );

    const updated = await db.collection("reviews").findOne({ _id: existing._id });
    return {
      success: true,
      status: 200,
      message: "Your pizza review has been updated! ⭐",
      data: updated,
    };
  }

  const newReviewDoc = {
    itemId: itemObjectId || data.itemId,
    customerId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    customerName: payload.name || "Artisan Foodie",
    customerEmail: userEmail,
    customerImage: payload.image || null,
    rating: numRating,
    comment: cleanComment,
    isVerifiedOrder: true,
    createdAt: now,
    updatedAt: now,
  };

  const insertRes = await db.collection("reviews").insertOne(newReviewDoc);

  return {
    success: true,
    status: 201,
    message: "Thank you! Your pizza review has been published. ⭐",
    data: { _id: insertRes.insertedId, ...newReviewDoc },
  };
}
