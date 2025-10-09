import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getSession } from "../../lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
