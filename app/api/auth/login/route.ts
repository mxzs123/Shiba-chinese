import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  AuthError,
  authenticateUser,
  type LoginPayload,
} from "@/lib/api/auth-store";

function errorStatus(code: AuthError["code"]) {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return 401;
    case "USER_NOT_FOUND":
      return 404;
    default:
      return 400;
  }
}

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch (error) {
    return NextResponse.json(
      { error: "请求体验证失败" },
      { status: 400 },
    );
  }

  try {
    const { user, session } = authenticateUser(payload);
    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: errorStatus(error.code) },
      );
    }

    console.error("authenticateUser failed", error);
    return NextResponse.json(
      { error: "登录失败，请稍后再试" },
      { status: 500 },
    );
  }
}
