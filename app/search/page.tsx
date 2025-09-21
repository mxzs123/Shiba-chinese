import { redirect } from "next/navigation";

export { metadata } from "@/app/_shared/pages/search/page";

export default function SearchRedirect() {
  redirect("/d/search");
}
