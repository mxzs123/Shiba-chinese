"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "app/_shared";
import type { Cart } from "lib/api/types";
import { submitOneTimeOrder } from "./one-time-actions";

function formatCurrency(amount: string, currency: string) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(num);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function OneTimeCheckout({
  cart,
  variant = "desktop",
}: {
  cart?: Cart;
  variant?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    wechat: "",
    country: "中国",
    province: "",
    city: "",
    district: "",
    address1: "",
    postalCode: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-16 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-neutral-900">购物车为空</h2>
        <p className="mt-3 text-sm text-neutral-500">
          请先挑选商品加入购物车，再返回结算页完成下单。
        </p>
      </div>
    );
  }

  const currency = cart.cost.totalAmount.currencyCode;

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "请填写收件人姓名";
    if (!form.phone.trim() && !form.wechat.trim())
      return "手机或微信至少填写一项";
    if (!form.country.trim()) return "请填写国家/地区";
    if (!form.city.trim()) return "请填写城市";
    if (!form.address1.trim()) return "请填写详细地址";
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await submitOneTimeOrder({ ...form });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || "提交失败，请稍后再试");
      return;
    }
    // 提交成功后跳转到成功页（沿用现有成功页文案）
    router.push(
      variant === "mobile" ? "/m/checkout/success" : "/checkout/success",
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* 左侧：一次性信息表单 */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              收件与联系信息
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              一次性收集信息，不创建账户。我们将通过你留下的联系方式与您确认发货与支付。
            </p>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-600">
                收件人姓名
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">手机号码</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="至少填手机或微信之一"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">微信号</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.wechat}
                onChange={(e) => handleChange("wechat", e.target.value)}
                placeholder="至少填手机或微信之一"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">
                国家/地区
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">省/州</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.province}
                onChange={(e) => handleChange("province", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">城市</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">区/县</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-600">详细地址</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.address1}
                onChange={(e) => handleChange("address1", e.target.value)}
                placeholder="街道、门牌号等"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">邮编</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                value={form.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-600">
                备注（可选）
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                rows={3}
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                placeholder="过敏史、配送备注等"
              />
            </div>
          </div>
          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          ) : null}
          <div className="mt-6">
            <PrimaryButton
              className="w-full justify-center"
              onClick={handleSubmit}
              loading={submitting}
              loadingText="提交中..."
            >
              提交订单（线下确认）
            </PrimaryButton>
            <p className="mt-2 text-xs text-neutral-400">
              提交后，我们将通过你填写的手机号/微信与您联系，确认支付与发货。
            </p>
          </div>
        </section>
      </div>

      {/* 右侧：订单摘要 */}
      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">订单摘要</h2>
        <div className="mt-4 space-y-3">
          <ul className="space-y-3">
            {cart.lines.map((line) => (
              <li
                key={line.merchandise.id}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {line.merchandise.product.title}
                  </p>
                  {line.merchandise.title ? (
                    <p className="text-xs text-neutral-500">
                      {line.merchandise.title}
                    </p>
                  ) : null}
                  <p className="text-xs text-neutral-400">
                    数量 × {line.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatCurrency(
                    line.cost.totalAmount.amount,
                    line.cost.totalAmount.currencyCode,
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">商品金额</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(cart.cost.subtotalAmount.amount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">优惠减免</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(
                  String(-Number(cart.cost.discountAmount?.amount || 0)),
                  currency,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
              <span>应付总计</span>
              <span>
                {formatCurrency(cart.cost.totalAmount.amount, currency)}
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            当前流程将提交完整订单信息，支付由专属客服确认后推进，系统会同步记录便于后续跟进。
          </p>
        </div>
      </aside>
    </div>
  );
}

export default OneTimeCheckout;
