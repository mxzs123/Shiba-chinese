import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  AuthError,
  registerUser,
  type RegisterPayload,
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
  let payload: RegisterPayload;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch (error) {
    return NextResponse.json({ error: "请求体验证失败" }, { status: 400 });
  }

  try {
    const { user, session } = registerUser(payload);
    const response = NextResponse.json({ user }, { status: 201 });
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

    // API 路由错误，记录到服务端日志
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth API] registerUser failed", error);
    }
    return NextResponse.json(
      { error: "注册失败，请稍后再试" },
      { status: 500 },
    );
  }
}
