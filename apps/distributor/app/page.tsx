import { Badge } from "@shiba/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 py-16 text-center">
      <Badge variant="outline" className="text-sm">
        芝园分销平台
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        即将上线的销售与分销工作台
      </h1>
      <p className="max-w-xl text-balance text-sm text-neutral-500">
        请使用芝园内部发放的账号登录。功能模块（仪表盘、订单、顾客管理、分销管理等）将在后续迭代中逐步开放。
      </p>
    </main>
  );
}
