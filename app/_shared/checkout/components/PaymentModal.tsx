import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { PrimaryButton } from "app/_shared";
import type { PaymentStep } from "../types";

type PaymentModalProps = {
  open: boolean;
  step: PaymentStep;
  notifySubmitting: boolean;
  notifyError: string | null;
  onClose: () => void;
  onConfirmPaid: () => void;
  onNavigateToSuccess: () => void;
  onStepChange: (step: PaymentStep) => void;
};

export function PaymentModal({
  open,
  step,
  notifySubmitting,
  notifyError,
  onClose,
  onConfirmPaid,
  onNavigateToSuccess,
  onStepChange,
}: PaymentModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">扫码支付</h3>
          <button
            type="button"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          请使用微信 / 支付宝扫码完成支付，完成后请耐心等待系统确认订单状态。
        </p>
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="w-full">
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white">
              <Image
                src="/about/pay.png"
                alt="扫码支付二维码"
                width={768}
                height={768}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>

          {step === "qr" ? (
            <div className="flex w-full flex-col items-center gap-3">
              <p className="text-sm font-medium text-neutral-800">
                是否已完成支付？
              </p>
              <PrimaryButton
                type="button"
                onClick={onConfirmPaid}
                className="w-full justify-center"
                disabled={notifySubmitting}
                loading={notifySubmitting}
                loadingText="提交中..."
              >
                我已完成支付
              </PrimaryButton>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
                onClick={() => onStepChange("help")}
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                尚未完成/遇到问题
              </button>
              {notifyError ? (
                <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {notifyError}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === "help" ? (
            <div className="w-full space-y-3 rounded-xl bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
              <p>
                支付过程中遇到问题？或已支付但误点&ldquo;否&rdquo;？请主动联系我们的客服，我们会协助退款或完成订单处理。
              </p>
              <div className="flex gap-3">
                <Link
                  href="/about"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:brightness-105"
                >
                  联系客服
                </Link>
                <button
                  type="button"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
                  onClick={() => onStepChange("qr")}
                >
                  返回扫码
                </button>
              </div>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="flex w-full flex-col items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-600">
              <p>订单已提交成功，我们会尽快联系并安排发货。</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 transition hover:text-emerald-600"
                onClick={onNavigateToSuccess}
              >
                立即查看结果页
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
            onClick={onClose}
          >
            返回继续编辑
          </button>
        </div>
      </div>
    </div>
  );
}
