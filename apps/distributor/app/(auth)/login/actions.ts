"use server";

import { redirect } from "next/navigation";

import { loginWithCredentials } from "../../../lib/auth";

export interface LoginState {
  message?: string;
}

const DEFAULT_REDIRECT = "/sales";

export async function loginAction(_prevState: LoginState, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { message: "请输入账号和密码" };
  }

  const result = await loginWithCredentials(email, password);

  if (!result.success) {
    return { message: result.error ?? "登录失败，请稍后重试" };
  }

  redirect(result.redirectTo ?? DEFAULT_REDIRECT);
}
