import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

    const init: RequestInit = {
      method: req.method,
      headers,
    };

    let rawBody = "";
    if (req.method !== "GET" && req.method !== "HEAD") {
      rawBody = await req.text();
      init.body = rawBody;
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
        const search = req.nextUrl.searchParams.get("search") || undefined;
        const sortBy = req.nextUrl.searchParams.get("sortBy") || undefined;
        const dbItems = await getMenuItemsFromDb({ category, location, search, sortBy });
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
