"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession } from "../../lib/auth";

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout");
  revalidatePath("/sales");
  revalidatePath("/distributor");
  redirect("/login");
}
