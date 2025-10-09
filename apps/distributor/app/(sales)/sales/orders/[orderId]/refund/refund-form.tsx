"use client";

import {
  useMemo,
  useState,
  useTransition,
  type ChangeEventHandler,
  type FormEventHandler,
} from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";

import type { SalesOrder } from "@/lib/mock/orders";
import type { TemporaryUpload } from "@/lib/mock/uploads";
import type { RefundApplication } from "@/lib/mock/refunds";
import {
  removeRefundAttachmentAction,
  submitRefundApplicationAction,
  uploadRefundAttachmentAction,
} from "./actions";

const MAX_ATTACHMENTS = 5;

type ErrorState = {
  reason?: string;
  amount?: string;
  attachments?: string;
  form?: string;
};

interface RefundFormProps {
  order: Pick<
    SalesOrder,
    "id" | "amount" | "customer" | "submittedAt" | "paymentMethod"
  >;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const kb = size / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function RefundForm({ order }: RefundFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(() =>
    (Math.round(order.amount * 100) / 100).toFixed(2),
  );
  const [attachments, setAttachments] = useState<TemporaryUpload[]>([]);
  const [errors, setErrors] = useState<ErrorState>({});
  const [submission, setSubmission] = useState<RefundApplication | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [isAttachmentPending, startAttachmentTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  const orderSummary = useMemo(
    () => ({
      amountLabel: formatCurrency(order.amount),
      submittedAt: order.submittedAt.replace(" ", " · "),
    }),
    [order.amount, order.submittedAt],
  );

  const attachmentSlotsLeft = MAX_ATTACHMENTS - attachments.length;
  const formDisabled = Boolean(submission);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    if (!attachmentSlotsLeft) {
      setErrors((prev) => ({
        ...prev,
        attachments: `最多上传 ${MAX_ATTACHMENTS} 个附件`,
      }));
      event.target.value = "";
      return;
    }

    const selected = Array.from(files).slice(0, attachmentSlotsLeft);

    setErrors((prev) => ({ ...prev, attachments: undefined }));

    startAttachmentTransition(async () => {
      const uploaded: TemporaryUpload[] = [];
      let lastError: string | undefined;

      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadRefundAttachmentAction(formData);

        if (result.success) {
          uploaded.push(result.data);
        } else {
          lastError = result.error;
        }
      }

      if (uploaded.length) {
        setAttachments((prev) => [...prev, ...uploaded]);
      }

      if (lastError) {
        setErrors((prev) => ({ ...prev, attachments: lastError }));
      }
    });

    event.target.value = "";
  };

  const handleRemove = (id: string) => {
    if (formDisabled) {
      return;
    }

    setPendingRemovalId(id);
    setErrors((prev) => ({ ...prev, attachments: undefined }));

    startAttachmentTransition(async () => {
      const result = await removeRefundAttachmentAction(id);

      if (result.success) {
        setAttachments((prev) => prev.filter((item) => item.id !== id));
      } else {
        setErrors((prev) => ({ ...prev, attachments: result.error }));
      }

      setPendingRemovalId((current) => (current === id ? null : current));
    });
  };

  const validate = () => {
    const nextErrors: ErrorState = {};
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 10) {
      nextErrors.reason = "请至少填写 10 个字的退款理由";
    }

    const parsedAmount = Number(amount);

    if (!amount || Number.isNaN(parsedAmount)) {
      nextErrors.amount = "请输入有效的退款金额";
    } else if (parsedAmount <= 0) {
      nextErrors.amount = "退款金额需大于 0";
    } else if (parsedAmount > order.amount) {
      nextErrors.amount = `退款金额不得超过订单金额（${orderSummary.amountLabel}）`;
    }

    setErrors(nextErrors);
    return { nextErrors, parsedAmount } as const;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (submission) {
      router.push("/sales/orders");
      return;
    }

    const { nextErrors, parsedAmount } = validate();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    startSubmitTransition(async () => {
      const result = await submitRefundApplicationAction(order.id, {
        reason: reason.trim(),
        amount: Math.round(parsedAmount * 100) / 100,
        attachmentIds: attachments.map((item) => item.id),
      });

      if (!result.success) {
        setErrors((prev) => ({ ...prev, form: result.error }));
        return;
      }

      setSubmission(result.data);
      setErrors({});
      setAttachments(result.data.attachments);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            关联订单
          </p>
          <h2 className="text-lg font-semibold text-neutral-900">{order.id}</h2>
          <p className="text-sm text-neutral-500">
            提交于 {orderSummary.submittedAt} · 支付方式：{order.paymentMethod}
          </p>
        </header>
        <dl className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              客户信息
            </dt>
            <dd className="mt-2 font-medium text-neutral-900">
              {order.customer.name}
            </dd>
            <dd className="text-xs text-neutral-500">
              {order.customer.type} · {order.customer.id}
            </dd>
          </div>
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              订单金额
            </dt>
            <dd className="mt-2 text-base font-semibold text-neutral-900">
              {orderSummary.amountLabel}
            </dd>
            <dd className="text-xs text-neutral-500">含所有折扣与运费</dd>
          </div>
        </dl>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {submission ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            已提交退款申请（编号 {submission.id}），我们将在 1-2
            个工作日内完成审核并通知您处理结果。
          </div>
        ) : null}
        {errors.form ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {errors.form}
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="reason"
            className="text-sm font-medium text-neutral-700"
          >
            申请理由
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={5}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-neutral-100"
            placeholder="请说明退款原因、沟通记录或其他参考信息"
            disabled={formDisabled}
          />
          {errors.reason ? (
            <p className="text-xs text-rose-500">{errors.reason}</p>
          ) : (
            <p className="text-xs text-neutral-400">
              示例：客户重复下单，编号 XXX 需要退款。
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-neutral-700"
          >
            退款金额
          </label>
          <div className="relative max-w-xs">
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 pr-16 text-sm text-neutral-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-neutral-100"
              disabled={formDisabled}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400">
              CNY
            </span>
          </div>
          {errors.amount ? (
            <p className="text-xs text-rose-500">{errors.amount}</p>
          ) : (
            <p className="text-xs text-neutral-400">
              不得超过订单总额：{orderSummary.amountLabel}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700">
              附件上传
            </label>
            <span className="text-xs text-neutral-400">
              最多 {MAX_ATTACHMENTS} 个，单个不超过 8MB
            </span>
          </div>

          {!formDisabled && attachmentSlotsLeft > 0 ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-sm text-neutral-500 transition hover:border-primary hover:bg-primary/5">
              <UploadCloud className="h-6 w-6 text-neutral-400" aria-hidden />
              <span>点击或拖拽上传附件</span>
              <span className="text-xs text-neutral-400">
                支持图片、PDF、Office 文档
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={isAttachmentPending}
              />
            </label>
          ) : null}

          {attachments.length ? (
            <ul className="space-y-2">
              {attachments.map((file) => {
                const removing =
                  pendingRemovalId === file.id && isAttachmentPending;
                return (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600"
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className="h-4 w-4 text-neutral-400"
                        aria-hidden
                      />
                      <div className="space-y-0.5">
                        <p className="font-medium text-neutral-800">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatFileSize(file.size)} · 上传于{" "}
                          {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        预览
                      </a>
                      {!formDisabled ? (
                        <button
                          type="button"
                          onClick={() => handleRemove(file.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition hover:border-rose-400 hover:text-rose-500"
                          disabled={removing}
                        >
                          {removing ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                          删除
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-neutral-400">
              建议上传支付凭证、沟通截图等辅助材料，便于审核快速通过。
            </p>
          )}

          {errors.attachments ? (
            <p className="text-xs text-rose-500">{errors.attachments}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-neutral-400"
            disabled={isSubmitting}
          >
            {submission
              ? "返回订单列表"
              : isSubmitting
                ? "提交中..."
                : "提交退款申请"}
          </button>
          {!submission ? (
            <p className="text-xs text-neutral-400">
              提交后将生成审核记录，客服会在 1-2 个工作日内反馈结果。
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default RefundForm;
