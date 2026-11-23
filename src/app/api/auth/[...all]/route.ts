import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const { POST: rawPost, GET: rawGet } = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  try {
    return await rawGet(req);
  } catch (err: unknown) {
    console.error("[Better-Auth GET Error]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await rawPost(req);
  } catch (err: unknown) {
    console.error("[Better-Auth POST Error]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
