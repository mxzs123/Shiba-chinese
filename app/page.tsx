import { redirect } from "next/navigation";

export { metadata } from "@/app/_shared/pages/home";

export default function RootRedirect() {
  redirect("/d");
}
