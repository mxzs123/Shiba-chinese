import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { TAGS } from "lib/constants";

export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    // 安全相关错误，只在开发环境输出
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Invalid revalidation secret.");
    }
    return NextResponse.json({ status: 401 });
  }

  const headerStore = await headers();
  const topic = headerStore.get("x-commerce-topic");

  if (!topic) {
    revalidateTag(TAGS.products);
    revalidateTag(TAGS.collections);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
