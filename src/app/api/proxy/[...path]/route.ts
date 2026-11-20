import { NextRequest, NextResponse } from "next/server";
import {
  joinVipMemberService,
  getVipMembersService,
  removeVipMemberService,
  getVipStatusService,
  parseJwtPayload,
} from "@/lib/vip-service";

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

    const response = await fetch(targetUrl, init);

    // If the remote backend server returns 404 for VIP routes (e.g. if the backend
    // on pizzaserver.vercel.app has not yet been redeployed), seamlessly handle
    // the request with Next.js + MongoDB so the user experience is flawless.
    if (response.status === 404 && subPath.startsWith("vip")) {
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
