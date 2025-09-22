import { NextResponse } from "next/server";
import { getUserFromSessionCookie } from "@/lib/api/auth-store";

export async function GET() {
  const user = await getUserFromSessionCookie();
  return NextResponse.json(
    { user: user ?? null },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
