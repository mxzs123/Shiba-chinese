import { redirect } from "next/navigation";

export const metadata = {
  title: "资讯中心",
};

export default function NewsRedirect() {
  redirect("/d/news");
}
