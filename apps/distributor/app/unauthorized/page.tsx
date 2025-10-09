import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 py-16 text-center">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600">
        权限不足
      </span>
      <h1 className="text-2xl font-semibold text-neutral-900">
        当前账号无权访问该模块
      </h1>
      <p className="max-w-md text-sm text-neutral-500">
        请返回登录页，使用具备相应权限的账号重新登录，或联系管理员开通访问权限。
      </p>
      <Link
        href="/login"
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        返回登录
      </Link>
    </main>
  );
}
