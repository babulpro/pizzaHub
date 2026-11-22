import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { MenuItem } from "@/app/menu/page-client";

export interface MenuFilterParams {
  category?: string;
  location?: string;
  search?: string;
  sortBy?: string;
}

/**
 * Fetch approved/pending menu items directly from MongoDB
 * Mirrors Express backend logic with vendor lookup & premium prioritization
 */
export async function getMenuItemsFromDb(
  params?: MenuFilterParams
): Promise<MenuItem[]> {
  try {
    const db = await getDb();
    const collection = db.collection("menuItems");

    const matchQuery: Record<string, unknown> = {
      status: { $in: ["approved", "pending"] },
    };

    if (params?.category && params.category !== "all" && params.category !== "All") {
      matchQuery.category = params.category;
    }

    if (params?.location && params.location !== "all" && params.location !== "All") {
      matchQuery.location = { $regex: params.location, $options: "i" };
    }

    if (params?.search && params.search.trim()) {
      matchQuery.$or = [
        { itemName: { $regex: params.search.trim(), $options: "i" } },
        { description: { $regex: params.search.trim(), $options: "i" } },
      ];
    }

    // Determine sorting
    const sortCriteria: Record<string, 1 | -1> = {};
    if (params?.sortBy === "price_asc") {
      sortCriteria.price = 1;
    } else if (params?.sortBy === "price_desc") {
      sortCriteria.price = -1;
    } else {
      sortCriteria.createdAt = -1;
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          let: { vendorId: "$vendorId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$vendorId"] },
                    {
                      $eq: [
                        { $toString: "$_id" },
                        { $toString: "$$vendorId" },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "vendorArr",
        },
      },
      {
        $addFields: {
          vendor: { $arrayElemAt: ["$vendorArr", 0] },
        },
      },
      {
        $project: {
          vendorArr: 0,
          "vendor.password": 0,
          "vendor.isBlocked": 0,
        },
      },
      {
        $addFields: {
          isPremium: {
            $cond: [
              {
                $and: [
                  { $eq: ["$vendor.subscriptionPlan", "premium"] },
                  {
                    $or: [
                      {
                        $eq: [
                          { $type: "$vendor.subscriptionExpiresAt" },
                          "missing",
                        ],
                      },
                      { $eq: ["$vendor.subscriptionExpiresAt", null] },
                      { $gt: ["$vendor.subscriptionExpiresAt", new Date()] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $sort: {
          isPremium: -1 as const,
          ...sortCriteria,
        },
      },
    ];

    const rawItems = await collection.aggregate(pipeline).toArray();

    return rawItems.map((item) => ({
      _id: item._id ? item._id.toString() : "",
      vendorId: item.vendorId ? item.vendorId.toString() : "",
      itemName: item.itemName || "Artisan Pizza",
      category: item.category || "Classic Pizzas",
      description: item.description || "",
      price: typeof item.price === "number" ? item.price : 18,
      location: item.location || "Dhaka, Bangladesh",
      images: Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
          ],
      prepTime: item.prepTime || "20-25 min",
      isSpicy: Boolean(item.isSpicy),
      isVegetarian: Boolean(item.isVegetarian),
      status: item.status || "approved",
      isPremium: item.isPremium || 0,
      vendor: item.vendor
        ? {
            _id: item.vendor._id ? item.vendor._id.toString() : "",
            name: item.vendor.name || "Artisan Pizzaiolo",
            email: item.vendor.email || "",
            businessName: item.vendor.businessName || item.vendor.name || "Pizzeria Kitchen",
            subscriptionPlan: item.vendor.subscriptionPlan || "free",
          }
        : undefined,
    })) as MenuItem[];
  } catch (error) {
    console.error("[menu-service] Error querying menuItems from MongoDB:", error);
    return [];
  }
}

/**
 * Fetch a single pizza item by ID directly from MongoDB
 */
export async function getMenuItemByIdFromDb(
  id: string
): Promise<MenuItem | null> {
  try {
    const db = await getDb();
    const collection = db.collection("menuItems");

    let query: Record<string, unknown> = { _id: id };
    if (ObjectId.isValid(id)) {
      query = {
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      };
    }

    const item = await collection.findOne(query);
    if (!item) return null;

    let vendor = null;
    if (item.vendorId) {
      let vQuery: Record<string, unknown> = { _id: item.vendorId };
      if (ObjectId.isValid(item.vendorId.toString())) {
        vQuery = {
          $or: [
            { _id: new ObjectId(item.vendorId.toString()) },
            { _id: item.vendorId.toString() },
          ],
        };
      }
      vendor = await db.collection("users").findOne(vQuery);
    }

    return {
      _id: item._id ? item._id.toString() : "",
      vendorId: item.vendorId ? item.vendorId.toString() : "",
      itemName: item.itemName || "Artisan Pizza",
      category: item.category || "Classic Pizzas",
      description: item.description || "",
      price: typeof item.price === "number" ? item.price : 18,
      location: item.location || "Dhaka, Bangladesh",
      images: Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
          ],
      prepTime: item.prepTime || "20-25 min",
      isSpicy: Boolean(item.isSpicy),
      isVegetarian: Boolean(item.isVegetarian),
      status: item.status || "approved",
      isPremium: vendor?.subscriptionPlan === "premium" ? 1 : 0,
      vendor: vendor
        ? {
            _id: vendor._id ? vendor._id.toString() : "",
            name: vendor.name || "Artisan Pizzaiolo",
            email: vendor.email || "",
            businessName: vendor.businessName || vendor.name || "Pizzeria Kitchen",
            subscriptionPlan: vendor.subscriptionPlan || "free",
          }
        : undefined,
    } as MenuItem;
  } catch (error) {
    console.error(`[menu-service] Error querying item ${id} from MongoDB:`, error);
    return null;
  }
}
