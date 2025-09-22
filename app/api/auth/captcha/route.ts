import { NextResponse } from "next/server";
import { createCaptcha } from "@/lib/api/auth-store";

export async function GET() {
  const captcha = createCaptcha();
  return NextResponse.json(captcha, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
