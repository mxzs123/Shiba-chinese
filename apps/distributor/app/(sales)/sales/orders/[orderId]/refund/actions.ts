"use server";

import { revalidatePath } from "next/cache";

import {
  createRefundApplication,
  type RefundApplication,
} from "@/lib/mock/refunds";
import {
  createTemporaryUpload,
  deleteTemporaryUpload,
  type TemporaryUpload,
} from "@/lib/mock/uploads";
import { findSalesOrderById } from "@/lib/mock/orders";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const MAX_ATTACHMENT_SIZE_MB = 8;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function isAllowedMimeType(type: string) {
  if (!type) {
    return true;
  }

  if (type.startsWith("image/")) {
    return true;
  }

  if (type.startsWith("application/vnd.ms-")) {
    return true;
  }

  return ALLOWED_MIME_TYPES.has(type);
}

function stringifyError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "发生未知错误，请稍后重试";
}

export async function uploadRefundAttachmentAction(
  formData: FormData,
): Promise<ActionResult<TemporaryUpload>> {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, error: "请选择需要上传的附件" };
    }

    if (!isAllowedMimeType(file.type)) {
      return {
        success: false,
        error: "仅支持图片、PDF 或 Office 文档作为附件",
      };
    }

    if (file.size === 0) {
      return { success: false, error: "附件为空，请重新选择" };
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        success: false,
        error: `单个附件大小需小于 ${MAX_ATTACHMENT_SIZE_MB}MB`,
      };
    }

    const upload = await createTemporaryUpload(file);
    return { success: true, data: upload };
  } catch (error) {
    return { success: false, error: stringifyError(error) };
  }
}

export async function removeRefundAttachmentAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id) {
      return { success: false, error: "附件标识无效" };
    }

    const deleted = deleteTemporaryUpload(id);

    if (!deleted) {
      return { success: false, error: "附件不存在或已被删除" };
    }

    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: stringifyError(error) };
  }
}

export interface RefundSubmissionPayload {
  reason: string;
  amount: number;
  attachmentIds: string[];
}

export async function submitRefundApplicationAction(
  orderId: string,
  payload: RefundSubmissionPayload,
): Promise<ActionResult<RefundApplication>> {
  try {
    const order = findSalesOrderById(orderId);

    if (!order) {
      return { success: false, error: "订单不存在或无法申请退款" };
    }

    const reason = payload.reason.trim();

    if (reason.length < 10) {
      return { success: false, error: "申请理由需至少 10 个字" };
    }

    if (!Number.isFinite(payload.amount)) {
      return { success: false, error: "请输入有效的退款金额" };
    }

    const normalizedAmount = Math.round(payload.amount * 100) / 100;

    if (normalizedAmount <= 0) {
      return { success: false, error: "退款金额需大于 0" };
    }

    if (normalizedAmount > order.amount) {
      return {
        success: false,
        error: "退款金额不得超过订单总额",
      };
    }

    const application = createRefundApplication(orderId, {
      reason,
      amount: normalizedAmount,
      attachmentIds: payload.attachmentIds,
    });

    revalidatePath("/sales/orders");

    return { success: true, data: application };
  } catch (error) {
    return {
      success: false,
      error: stringifyError(error),
    };
  }
}
