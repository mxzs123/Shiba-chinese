import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { captureException } from "@shiba/monitoring";
import { sessionSchema, type Session } from "@shiba/models";

import { authenticateMockUser, shouldUseMock } from "./mock/server-actions";

const SESSION_COOKIE = "distributor_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const cookieConfig = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

function encodeSession(session: Session) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  const raw = Buffer.from(value, "base64url").toString("utf8");
  return sessionSchema.parse(JSON.parse(raw));
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return undefined;
  }

  try {
    return decodeSession(token);
  } catch (error) {
    captureException(error, {
      tags: { scope: "decode-session" },
    });
    store.delete(SESSION_COOKIE);
    return undefined;
  }
}

async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), cookieConfig);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

function redirectPathForRole(role: Session["role"]) {
  if (role === "distributor") {
    return "/distributor";
  }
  return "/sales";
}

interface LoginResult {
  success: boolean;
  redirectTo?: string;
  error?: string;
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: "请输入账号和密码" };
  }

  if (shouldUseMock()) {
    const { session } = await authenticateMockUser(email, password);
    await setSession(session);
    return { success: true, redirectTo: redirectPathForRole(session.role) };
  }

  return { success: false, error: "登录服务暂未配置" };
}

export async function ensureSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function ensureRole(role: Session["role"]) {
  const session = await ensureSession();
  if (session.role !== role) {
    redirect("/unauthorized");
  }
  return session;
}
