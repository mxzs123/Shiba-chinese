import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  invalidateSession,
} from "@/lib/api/auth-store";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (token) {
    invalidateSession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
