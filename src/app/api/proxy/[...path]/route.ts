import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";
import {
  joinVipMemberService,
  getVipMembersService,
  removeVipMemberService,
  getVipStatusService,
  parseJwtPayload,
} from "@/lib/vip-service";
import {
  getMenuItemsFromDb,
  getMenuItemByIdFromDb,
} from "@/lib/menu-service";
import {
  getReviewsForMenuItem,
  checkReviewEligibilityService,
  submitReviewService,
} from "@/lib/review-service";

const TARGET_BASE =
  process.env.API_SERVER_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "https://pizzaserver.vercel.app");

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = Array.isArray(path) ? path.join("/") : "";
    const search = req.nextUrl.search || "";
    const targetUrl = `${TARGET_BASE}/api/${subPath}${search}`;

    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const contentType = req.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    // Forward origin, referer, and x-client-url so downstream backend knows the exact client domain
    const incomingOrigin =
      req.headers.get("origin") ||
      (req.headers.get("referer") ? new URL(req.headers.get("referer")!).origin : null) ||
      (req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : null) ||
      req.nextUrl.origin ||
      "https://pizzahub-ruddy-gamma.vercel.app";

    headers.set("origin", incomingOrigin);
    headers.set("x-client-url", incomingOrigin);
    if (req.headers.get("referer")) {
      headers.set("referer", req.headers.get("referer")!);
    }

    const init: RequestInit = {
      method: req.method,
      headers,
    };

    let rawBody = "";
    if (req.method !== "GET" && req.method !== "HEAD") {
      rawBody = await req.text();
      init.body = rawBody;
    }

    // =========================================================================
    // Native Customer Reviews Handling
    // =========================================================================
    if (subPath.startsWith("reviews")) {
      const authHeader = auth || "";

      // 1. Check eligibility (must have ordered at least one pizza on PizzaHub)
      if (subPath === "reviews/eligibility" && req.method === "GET") {
        const itemId = req.nextUrl.searchParams.get("itemId");
        const eligibility = await checkReviewEligibilityService(authHeader, itemId);
        return NextResponse.json({ success: true, ...eligibility });
      }

      // 2. Get reviews for a pizza
      if (subPath === "reviews" && req.method === "GET") {
        const itemId = req.nextUrl.searchParams.get("itemId");
        if (!itemId) {
          return NextResponse.json(
            { success: false, message: "itemId query parameter is required." },
            { status: 400 }
          );
        }
        const { reviews, stats } = await getReviewsForMenuItem(itemId);
        return NextResponse.json({
          success: true,
          count: reviews.length,
          stats,
          data: reviews,
        });
      }

      // 3. Post a new review or update existing review
      if (subPath === "reviews" && req.method === "POST") {
        let bodyJson: { itemId?: string; rating?: number; comment?: string } = {};
        try {
          bodyJson = JSON.parse(rawBody || "{}");
        } catch {
          // ignore
        }

        const result = await submitReviewService(authHeader, {
          itemId: bodyJson.itemId || "",
          rating: Number(bodyJson.rating) || 5,
          comment: bodyJson.comment || "",
        });

        return NextResponse.json(
          {
            success: result.success,
            message: result.message,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: (result as any).data,
          },
          { status: result.status }
        );
      }

      // 4. Delete review
      if (subPath.startsWith("reviews/") && req.method === "DELETE") {
        const reviewId = subPath.replace("reviews/", "").trim();
        if (reviewId && ObjectId.isValid(reviewId)) {
          const db = await getDb();
          const payload = parseJwtPayload(authHeader);
          const review = await db.collection("reviews").findOne({ _id: new ObjectId(reviewId) });
          if (!review) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
          }
          const isOwner = review.customerId?.toString() === (payload?.id || payload?._id)?.toString();
          const isAdmin = payload?.role === "admin";
          if (!isOwner && !isAdmin) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
          }
          await db.collection("reviews").deleteOne({ _id: new ObjectId(reviewId) });
          return NextResponse.json({ success: true, message: "Review deleted successfully." });
        }
      }
    }

    // =========================================================================
    // Native Stripe Handling (Session Creation, Verification & Direct Activation)
    // Handled directly inside Next.js on Vercel to guarantee redirect URLs point to
    // https://pizzahub-ruddy-gamma.vercel.app and avoid old localhost redirects
    // from any outdated standalone server deployments.
    // =========================================================================
    if (subPath.startsWith("stripe")) {
      const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
      const authHeader = auth || "";
      const payload = parseJwtPayload(authHeader);
      const db = await getDb();

      if (stripeSecretKey) {
        const stripe = new Stripe(stripeSecretKey);

        // 1. Create Checkout Session
        if (subPath === "stripe/create-checkout-session" && req.method === "POST") {
          let bodyJson: { clientUrl?: string } = {};
          try {
            bodyJson = JSON.parse(rawBody || "{}");
          } catch {
            // ignore
          }

          const userEmail = payload?.email || "vendor@pizzahub.com";
          const userId = payload?.id || payload?._id || "";
          const rawClientUrl =
            bodyJson.clientUrl ||
            req.headers.get("x-client-url") ||
            req.headers.get("origin") ||
            (req.headers.get("referer") ? new URL(req.headers.get("referer")!).origin : null) ||
            (req.headers.get("x-forwarded-host") ? `https://${req.headers.get("x-forwarded-host")}` : null) ||
            req.nextUrl.origin ||
            process.env.CLIENT_URL ||
            "https://pizzahub-ruddy-gamma.vercel.app";
          const clientUrl = rawClientUrl.replace(/\/+$/, "");

          try {
            const session = await stripe.checkout.sessions.create({
              mode: "subscription",
              line_items: [
                {
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: "PizzaHub Vendor Premium Plan",
                      description:
                        "Unlimited active menu items, Gold Premium badge, and featured homepage spotlight.",
                      images: [
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                      ],
                    },
                    unit_amount: 2900,
                    recurring: {
                      interval: "month",
                    },
                  },
                  quantity: 1,
                },
              ],
              customer_email: userEmail,
              metadata: {
                vendorId: userId ? userId.toString() : "",
                plan: "premium",
              },
              success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${clientUrl}/payment/cancel`,
            });

            return NextResponse.json({
              success: true,
              sessionId: session.id,
              url: session.url,
            });
          } catch (stripeErr: unknown) {
            console.error("[Proxy] Stripe checkout creation error:", stripeErr);
            return NextResponse.json(
              {
                success: false,
                message: stripeErr instanceof Error ? stripeErr.message : "Failed to create Stripe session.",
              },
              { status: 500 }
            );
          }
        }

        // 2. Verify Session
        if (subPath.startsWith("stripe/verify-session") && req.method === "GET") {
          const sessionId = subPath.replace("stripe/verify-session/", "").replace("stripe/verify-session", "").trim();
          if (sessionId) {
            try {
              const session = await stripe.checkout.sessions.retrieve(sessionId);
              if (session.payment_status === "paid" || session.status === "complete") {
                const vendorId = session.metadata?.vendorId || payload?.id || payload?._id;
                if (vendorId) {
                  const now = new Date();
                  const expiresAt = new Date(now);
                  expiresAt.setMonth(expiresAt.getMonth() + 1);

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const userObjId = ObjectId.isValid(vendorId) ? new ObjectId(vendorId) : null;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const userQuery: any = userObjId
                    ? { $or: [{ _id: userObjId }, { _id: vendorId }] }
                    : { _id: vendorId };

                  await db.collection("users").updateOne(userQuery, {
                    $set: {
                      subscriptionPlan: "premium",
                      subscriptionExpiresAt: expiresAt,
                      updatedAt: now,
                    },
                  });

                  const existingTxn = await db.collection("transactions").findOne({
                    stripeSessionId: session.id,
                  });

                  if (!existingTxn) {
                    await db.collection("transactions").insertOne({
                      vendorId: userObjId || vendorId,
                      plan: "premium",
                      amount: (session.amount_total || 2900) / 100,
                      currency: (session.currency || "usd").toUpperCase(),
                      stripeSessionId: session.id,
                      stripeSubscriptionId:
                        typeof session.subscription === "string"
                          ? session.subscription
                          : `sub_${session.id.slice(0, 14)}`,
                      status: "completed",
                      createdAt: now,
                    });
                  }

                  return NextResponse.json({
                    success: true,
                    message: "Stripe payment verified successfully! Premium active.",
                    paid: true,
                    subscriptionPlan: "premium",
                  });
                }
              }
            } catch (stripeErr: unknown) {
              console.error("[Proxy] Stripe retrieve error:", stripeErr);
            }
          }
        }
      }

      // 3. Confirm Subscription direct fallback (for authenticated vendor)
      if (subPath === "stripe/confirm-subscription" && req.method === "POST") {
        const vendorId = payload?.id || payload?._id;
        if (vendorId) {
          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userObjId = ObjectId.isValid(vendorId) ? new ObjectId(vendorId) : null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userQuery: any = userObjId
            ? { $or: [{ _id: userObjId }, { _id: vendorId }] }
            : { _id: vendorId };

          await db.collection("users").updateOne(userQuery, {
            $set: {
              subscriptionPlan: "premium",
              subscriptionExpiresAt: expiresAt,
              updatedAt: now,
            },
          });

          await db.collection("transactions").insertOne({
            vendorId: userObjId || vendorId,
            plan: "premium",
            amount: 29.0,
            currency: "USD",
            stripeSessionId: `manual_conf_${Date.now()}`,
            stripeSubscriptionId: `sub_confirmed_${Date.now()}`,
            status: "completed",
            createdAt: now,
          });

          return NextResponse.json({
            success: true,
            message: "Gold Premium Kitchen subscription confirmed & activated!",
            subscriptionPlan: "premium",
          });
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    init.signal = controller.signal;

    let response: Response | null = null;
    try {
      response = await fetch(targetUrl, init);
    } catch (fetchErr) {
      console.warn(`[Proxy] Remote fetch to ${targetUrl} timed out or failed:`, fetchErr);
    } finally {
      clearTimeout(timeoutId);
    }

    // Direct MongoDB fallback for /menu if remote backend is slow, down, or fails
    if ((!response || !response.ok) && req.method === "GET") {
      if (subPath === "menu") {
        const category = req.nextUrl.searchParams.get("category") || undefined;
        const location = req.nextUrl.searchParams.get("location") || undefined;
        const searchParam = req.nextUrl.searchParams.get("search") || undefined;
        const sortBy = req.nextUrl.searchParams.get("sortBy") || undefined;
        const dbItems = await getMenuItemsFromDb({ category, location, search: searchParam, sortBy });
        return NextResponse.json({ success: true, count: dbItems.length, data: dbItems });
      }

      if (subPath.startsWith("menu/")) {
        const itemId = subPath.replace("menu/", "");
        const dbItem = await getMenuItemByIdFromDb(itemId);
        if (dbItem) {
          return NextResponse.json({ success: true, data: dbItem });
        }
      }
    }

    // Enrich single menu item with vendor data if remote returned data without vendor
    if (response && response.ok && req.method === "GET" && subPath.startsWith("menu/")) {
      try {
        const textData = await response.text();
        const json = JSON.parse(textData);
        if (json?.data && !json.data.vendor && json.data.vendorId) {
          const itemId = subPath.replace("menu/", "");
          const dbItem = await getMenuItemByIdFromDb(itemId);
          if (dbItem?.vendor) {
            json.data.vendor = dbItem.vendor;
          }
        }
        return NextResponse.json(json);
      } catch {
        // fallback to standard stream
      }
    }



    // Direct fallback for auth/token & auth/login if remote backend fails or times out
    if ((!response || !response.ok) && subPath.startsWith("auth/")) {
      const db = await getDb();
      const usersCollection = db.collection("users");

      if (subPath === "auth/token" && req.method === "POST") {
        let bodyJson: { email?: string; name?: string; role?: string; businessName?: string; password?: string } = {};
        try {
          bodyJson = JSON.parse(rawBody || "{}");
        } catch {
          // ignore
        }

        if (bodyJson.email) {
          const cleanEmail = bodyJson.email.trim().toLowerCase();
          let user = await usersCollection.findOne({ email: cleanEmail });

          if (!user) {
            const newUser = {
              name: bodyJson.name || cleanEmail.split("@")[0],
              email: cleanEmail,
              role: bodyJson.role || "customer",
              businessName: bodyJson.role === "vendor" ? bodyJson.businessName || "My Pizzeria" : undefined,
              subscriptionPlan: "free",
              subscriptionExpiresAt: null,
              isBlocked: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const insRes = await usersCollection.insertOne(newUser);
            user = { _id: insRes.insertedId, ...newUser };
          }

          const jwtSecret = process.env.JWT_SECRET || "xyz-123-abc";
          const token = jwt.sign(
            {
              id: user._id.toString(),
              email: user.email,
              role: user.role || "customer",
            },
            jwtSecret,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
          );

          return NextResponse.json({
            success: true,
            token,
            user: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              subscriptionPlan: user.subscriptionPlan,
            },
          });
        }
      }

      if (subPath === "auth/register" && req.method === "POST") {
        let bodyJson: { name?: string; email?: string; password?: string; role?: string; businessName?: string } = {};
        try {
          bodyJson = JSON.parse(rawBody || "{}");
        } catch {
          // ignore
        }

        if (bodyJson.email && bodyJson.password) {
          const cleanEmail = bodyJson.email.trim().toLowerCase();
          const existing = await usersCollection.findOne({ email: cleanEmail });
          if (existing) {
            return NextResponse.json(
              { success: false, message: "An account with this email already exists." },
              { status: 400 }
            );
          }

          const hashedPassword = await bcrypt.hash(bodyJson.password, 10);
          const now = new Date();
          const role = bodyJson.role === "vendor" ? "vendor" : "customer";
          const newUser = {
            name: bodyJson.name ? bodyJson.name.trim() : cleanEmail.split("@")[0],
            email: cleanEmail,
            password: hashedPassword,
            role,
            businessName: role === "vendor" ? bodyJson.businessName?.trim() || "My Pizzeria" : undefined,
            subscriptionPlan: "free",
            subscriptionExpiresAt: null,
            isBlocked: false,
            createdAt: now,
            updatedAt: now,
          };

          const result = await usersCollection.insertOne(newUser);
          const userId = result.insertedId;

          // Mirror to accounts collection so Better-Auth and Express share state
          await db.collection("accounts").insertOne({
            userId,
            accountId: userId.toString(),
            providerId: "credential",
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          });

          const jwtSecret = process.env.JWT_SECRET || "xyz-123-abc";
          const token = jwt.sign(
            {
              id: userId.toString(),
              email: cleanEmail,
              role,
            },
            jwtSecret,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
          );

          return NextResponse.json(
            {
              success: true,
              message: "Account created successfully with secure hashed password!",
              token,
              user: {
                id: userId.toString(),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                subscriptionPlan: newUser.subscriptionPlan,
              },
            },
            { status: 201 }
          );
        }
      }

      if (subPath === "auth/login" && req.method === "POST") {
        let bodyJson: { email?: string; password?: string } = {};
        try {
          bodyJson = JSON.parse(rawBody || "{}");
        } catch {
          // ignore
        }

        if (bodyJson.email && bodyJson.password) {
          const cleanEmail = bodyJson.email.trim().toLowerCase();
          const user = await usersCollection.findOne({ email: cleanEmail });

          if (!user) {
            return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
          }
          if (user.isBlocked) {
            return NextResponse.json(
              { success: false, message: "Your account has been blocked by an administrator." },
              { status: 403 }
            );
          }

          let isMatch = false;
          if (user.password) {
            if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
              isMatch = await bcrypt.compare(bodyJson.password, user.password);
            } else {
              try {
                const [salt, key] = user.password.split(":");
                if (salt && key) {
                  const dk = await new Promise<Buffer>((resolve, reject) => {
                    crypto.scrypt(
                      bodyJson.password!.normalize("NFKC"),
                      salt,
                      64,
                      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
                      (err, k) => (err ? reject(err) : resolve(k as Buffer))
                    );
                  });
                  isMatch = dk.toString("hex") === key;
                }
              } catch {
                isMatch = false;
              }
            }
          }

          if (!isMatch) {
            const account = await db.collection("accounts").findOne({ userId: user._id, providerId: "credential" });
            if (account?.password) {
              if (account.password.startsWith("$2a$") || account.password.startsWith("$2b$") || account.password.startsWith("$2y$")) {
                isMatch = await bcrypt.compare(bodyJson.password, account.password);
              } else {
                try {
                  const [salt, key] = account.password.split(":");
                  if (salt && key) {
                    const dk = await new Promise<Buffer>((resolve, reject) => {
                      crypto.scrypt(
                        bodyJson.password!.normalize("NFKC"),
                        salt,
                        64,
                        { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
                        (err, k) => (err ? reject(err) : resolve(k as Buffer))
                      );
                    });
                    isMatch = dk.toString("hex") === key;
                  }
                } catch {
                  isMatch = false;
                }
              }
            }
          }

          if (!isMatch) {
            return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
          }

          const jwtSecret = process.env.JWT_SECRET || "xyz-123-abc";
          const token = jwt.sign(
            {
              id: user._id.toString(),
              email: user.email,
              role: user.role || "customer",
            },
            jwtSecret,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
          );

          return NextResponse.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              subscriptionPlan: user.subscriptionPlan,
            },
          });
        }
      }
    }

    // If the remote backend server returns 404 or fails for VIP routes
    if ((!response || response.status === 404) && subPath.startsWith("vip")) {
      const authHeader = auth || "";

      if (subPath === "vip/join" && req.method === "POST") {
        let bodyJson: { email?: string } = {};
        try {
          bodyJson = JSON.parse(rawBody || "{}");
        } catch {
          // ignore
        }
        const result = await joinVipMemberService(bodyJson.email || "", authHeader);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      if (subPath === "vip/members" && req.method === "GET") {
        const searchParam = req.nextUrl.searchParams.get("search");
        const result = await getVipMembersService(searchParam);
        return NextResponse.json(result, { status: 200 });
      }

      if (subPath.startsWith("vip/members/") && req.method === "DELETE") {
        const memberId = subPath.replace("vip/members/", "");
        const result = await removeVipMemberService(memberId);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      if (subPath === "vip/status" && req.method === "GET") {
        const user = parseJwtPayload(authHeader);
        const result = await getVipStatusService(
          user?.email || "",
          user?.id || user?._id
        );
        return NextResponse.json(result, { status: 200 });
      }
    }

    // Direct MongoDB fallback for /users routes (e.g. DELETE /users/:id) if remote server returns 404 or fails
    if ((!response || response.status === 404 || !response.ok) && subPath.startsWith("users")) {
      const db = await getDb();
      const usersCollection = db.collection("users");

      if (req.method === "DELETE" && subPath.startsWith("users/")) {
        const targetId = subPath.replace("users/", "").trim();
        if (targetId) {
          const userObjId = ObjectId.isValid(targetId) ? new ObjectId(targetId) : null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const query: any = userObjId
            ? { $or: [{ _id: userObjId }, { _id: targetId }] }
            : { _id: targetId };

          const user = await usersCollection.findOne(query);
          if (user) {
            await usersCollection.deleteOne(query);

            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const accountConditions: any[] = [{ userId: targetId }, { accountId: targetId }];
              if (userObjId) accountConditions.push({ userId: userObjId });
              await db.collection("accounts").deleteMany({ $or: accountConditions });

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sessionConditions: any[] = [{ userId: targetId }];
              if (userObjId) sessionConditions.push({ userId: userObjId });
              await db.collection("sessions").deleteMany({ $or: sessionConditions });

              await db.collection("vip_members").deleteMany({
                $or: [{ userId: targetId }, { email: user.email }],
              });
            } catch (cleanupErr) {
              console.warn("Cleanup warning in proxy fallback:", cleanupErr);
            }

            return NextResponse.json({
              success: true,
              message: `User "${user.name || user.email}" was deleted permanently.`,
            });
          } else {
            return NextResponse.json(
              { success: false, message: "User not found." },
              { status: 404 }
            );
          }
        }
      }

      if (req.method === "PATCH" && subPath.includes("/block")) {
        const targetId = subPath.replace("users/", "").replace("/block", "").trim();
        if (targetId) {
          const userObjId = ObjectId.isValid(targetId) ? new ObjectId(targetId) : null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const query: any = userObjId
            ? { $or: [{ _id: userObjId }, { _id: targetId }] }
            : { _id: targetId };

          const user = await usersCollection.findOne(query);
          if (user) {
            const nextBlockedState = !user.isBlocked;
            await usersCollection.updateOne(query, {
              $set: { isBlocked: nextBlockedState, updatedAt: new Date() },
            });
            return NextResponse.json({
              success: true,
              message: nextBlockedState
                ? `User ${user.name} has been blocked.`
                : `User ${user.name} has been unblocked.`,
              isBlocked: nextBlockedState,
            });
          }
        }
      }

      // Profile View & Update (including shop/business name) fallback
      if (subPath === "users/profile") {
        const authHeader = auth || "";
        const payload = parseJwtPayload(authHeader);
        if (payload?.email || payload?.id) {
          const userIdStr = (payload.id || payload._id || "").toString();
          const userObjId = ObjectId.isValid(userIdStr) ? new ObjectId(userIdStr) : null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const queryConditions: any[] = [{ email: payload.email }];
          if (userIdStr) queryConditions.push({ _id: userIdStr });
          if (userObjId) queryConditions.push({ _id: userObjId });
          const userQuery = { $or: queryConditions };

          if (req.method === "GET") {
            const user = await usersCollection.findOne(userQuery, { projection: { password: 0 } });
            if (user) {
              return NextResponse.json({ success: true, data: user });
            }
          }

          if (req.method === "PATCH") {
            let bodyJson: Record<string, unknown> = {};
            try {
              bodyJson = JSON.parse(rawBody || "{}");
            } catch {
              // ignore
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateFields: any = { updatedAt: new Date() };
            if (typeof bodyJson.name === "string" && bodyJson.name.trim()) {
              updateFields.name = bodyJson.name.trim();
            }
            if (typeof bodyJson.image === "string") updateFields.image = bodyJson.image.trim();
            if (typeof bodyJson.phone === "string") updateFields.phone = bodyJson.phone.trim();
            if (typeof bodyJson.address === "string") updateFields.address = bodyJson.address.trim();
            if (typeof bodyJson.businessName === "string") {
              updateFields.businessName = bodyJson.businessName.trim();
            }

            await usersCollection.updateOne(userQuery, { $set: updateFields });
            const updatedUser = await usersCollection.findOne(userQuery, { projection: { password: 0 } });

            return NextResponse.json({
              success: true,
              message: "Profile & shop name updated successfully.",
              data: updatedUser,
              user: updatedUser,
            });
          }
        }
      }
    }

    if (!response) {
      return NextResponse.json(
        { success: false, message: "Backend connection timed out" },
        { status: 504 }
      );
    }

    const textData = await response.text();

    return new NextResponse(textData, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Proxy request failed";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
