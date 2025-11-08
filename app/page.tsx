import { headers } from "next/headers";
import { redirect } from "next/navigation";

export { metadata } from "@/app/_shared/pages/home";

export default async function RootRedirect() {
  const headerList = await headers();
  const device = headerList.get("x-device") === "m" ? "m" : "d";
  redirect(`/${device}`);
}
