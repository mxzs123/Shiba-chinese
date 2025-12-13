import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Download } from "lucide-react";
import { PrimaryButton } from "@/app/_shared";
import { cn } from "lib/utils";
import type { CheckoutVariant, PaymentStep } from "../types";

type PaymentModalProps = {
  open: boolean;
  variant: CheckoutVariant;
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
  variant,
  step,
  notifySubmitting,
  notifyError,
  onClose,
  onConfirmPaid,
  onNavigateToSuccess,
  onStepChange,
}: PaymentModalProps) {
  const isMobile = variant === "mobile";
  const qrImageSrc = "/about/pay.png";
  const qrDownloadName = "pay-qrcode.png";
  const qrBlobRef = useRef<Blob | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.visualViewport?.height ?? window.innerHeight;
  });
  const [saveSubmitting, setSaveSubmitting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!open || !isMobile) {
      return;
    }

    const updateViewportHeight = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };

    updateViewportHeight();

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", updateViewportHeight);
    visualViewport?.addEventListener("scroll", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      visualViewport?.removeEventListener("resize", updateViewportHeight);
      visualViewport?.removeEventListener("scroll", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) {
      return;
    }

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile || step !== "qr" || qrBlobRef.current) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(qrImageSrc);
        if (!response.ok) return;
        const blob = await response.blob();
        if (cancelled) return;
        qrBlobRef.current = blob;
      } catch {
        // ignore prefetch errors, fall back to download/long-press.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, isMobile, step, qrImageSrc]);

  const handleSaveQr = useCallback(async () => {
    if (!isMobile) {
      return;
    }

    setSaveFeedback(null);

    const shareSupported =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      typeof File !== "undefined" &&
      Boolean(qrBlobRef.current);

    if (shareSupported && qrBlobRef.current) {
      try {
        setSaveSubmitting(true);
        const file = new File([qrBlobRef.current], qrDownloadName, {
          type: qrBlobRef.current.type || "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "收款码",
            text: "保存后在微信/支付宝「扫一扫」中选择「相册」识别该图片。",
          });
          setSaveFeedback({
            kind: "success",
            message: "已打开系统分享面板，可选择“保存图片/存到相册”。",
          });
          return;
        }
      } catch (error) {
        const isAbortError =
          error instanceof DOMException && error.name === "AbortError";
        if (isAbortError) {
          return;
        }
      } finally {
        setSaveSubmitting(false);
      }
    }

    try {
      const link = document.createElement("a");
      link.href = qrImageSrc;
      link.download = qrDownloadName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSaveFeedback({
        kind: "success",
        message: "已尝试下载二维码图片；若未生效，可截图或长按二维码保存。",
      });
    } catch {
      try {
        window.open(qrImageSrc, "_blank", "noopener,noreferrer");
      } catch {
        // ignore
      }
      setSaveFeedback({
        kind: "error",
        message: "当前浏览器无法自动保存，请截图或长按二维码图片保存到相册。",
      });
    } finally {
      setSaveSubmitting(false);
    }
  }, [isMobile, qrDownloadName, qrImageSrc]);

  if (!open) {
    return null;
  }

  const mobileModalHeightPx =
    isMobile && viewportHeight
      ? Math.max(
          0,
          Math.round(
            Math.min(viewportHeight - 32, viewportHeight * 0.78, 520),
          ),
        )
      : null;

  const modalStyle: CSSProperties | undefined =
    isMobile && mobileModalHeightPx
      ? { height: `${mobileModalHeightPx}px` }
      : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60",
        isMobile &&
          "pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]",
      )}
    >
      <div
        style={modalStyle}
        className={cn(
          "flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl",
          isMobile ? "w-full" : "max-h-[calc(100vh-2rem)]",
        )}
      >
        <div
          className={cn(
            "h-full overflow-y-auto",
            isMobile
              ? "p-4 overscroll-contain [-webkit-overflow-scrolling:touch]"
              : "p-6",
          )}
        >
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
          <div
            className={cn(
              "flex flex-col items-center",
              isMobile ? "mt-4 gap-3" : "mt-6 gap-4",
            )}
          >
            <div className="w-full">
              <div
                className={cn(
                  "w-full overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white",
                  isMobile ? "max-w-[260px] mx-auto" : "max-w-xs mx-auto",
                )}
              >
                <Image
                  src={qrImageSrc}
                  alt="扫码支付二维码"
                  width={768}
                  height={768}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>

            {step === "qr" && isMobile ? (
              <div className="w-full">
                <div className="w-full max-w-[260px] mx-auto space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveQr}
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saveSubmitting}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    {saveSubmitting ? "准备中..." : "保存二维码"}
                  </button>
                  {saveFeedback ? (
                    <p
                      className={
                        saveFeedback.kind === "error"
                          ? "text-xs text-red-600"
                          : "text-xs text-neutral-500"
                      }
                    >
                      {saveFeedback.message}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      不同浏览器支持程度不同：若未弹出保存/下载，请直接截图或长按二维码图片保存。
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {step === "qr" ? (
              <div className="flex w-full flex-col items-center gap-3">
                <div className="w-full px-4 py-3 rounded-xl bg-neutral-50 text-neutral-700">
                  <p className="text-sm font-semibold text-neutral-800">
                    {isMobile ? "移动端操作指引" : "操作指引"}
                  </p>
                  {!isMobile ? (
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
                      <li>用手机打开微信 / 支付宝，点击「扫一扫」。</li>
                      <li>扫描电脑屏幕上的二维码完成支付。</li>
                      <li>支付成功后返回本页，点击「支付已完成」。</li>
                    </ol>
                  ) : (
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
                      <li>
                        先保存二维码到相册（点上方「保存二维码」；不支持时可截图或长按二维码保存）。
                      </li>
                      <li>
                        打开微信 / 支付宝（或其他支付软件）→「扫一扫」→「相册」选择收款码图片。
                      </li>
                      <li>支付成功后返回商城，点击「支付已完成」。</li>
                    </ol>
                  )}
                </div>

                <p className="text-xs font-medium text-amber-600">
                  请确认已在支付软件中看到“支付成功”后再点击「支付已完成」。
                </p>
                <PrimaryButton
                  type="button"
                  onClick={onConfirmPaid}
                  className="w-full justify-center"
                  disabled={notifySubmitting}
                  loading={notifySubmitting}
                  loadingText="提交中..."
                >
                  支付已完成
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
              <div className="w-full space-y-3 px-4 py-4 rounded-xl bg-neutral-50 text-sm text-neutral-700">
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
              <div className="flex w-full flex-col items-center gap-3 px-4 py-4 rounded-xl bg-emerald-50 text-sm text-emerald-600">
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

            {!isMobile ? (
              <button
                type="button"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
                onClick={onClose}
              >
                返回继续编辑
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
