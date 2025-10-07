import { toast } from "sonner";

/**
 * 统一的错误处理工具
 */

export type ErrorContext = {
  action: string;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  constructor(
    message: string,
    public context?: ErrorContext,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * 显示用户友好的错误提示
 */
export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * 处理并记录错误
 */
export function handleError(
  error: unknown,
  context?: ErrorContext,
  showToast = true,
): void {
  const errorMessage = error instanceof Error ? error.message : "发生未知错误";

  // 开发环境下输出详细错误
  if (process.env.NODE_ENV === "development") {
    console.error("[Error Handler]", {
      message: errorMessage,
      context,
      error,
    });
  }

  // 生产环境下可以集成 Sentry 等错误监控服务
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { custom: context } });
  // }

  // 显示用户友好的错误提示
  if (showToast) {
    const userMessage = getUserFriendlyMessage(errorMessage, context);
    showErrorToast(userMessage);
  }
}

/**
 * 将技术错误转换为用户友好的消息
 */
function getUserFriendlyMessage(error: string, context?: ErrorContext): string {
  // 根据上下文返回友好的错误消息
  if (context?.action === "login") {
    return "登录失败，请检查用户名和密码";
  }

  if (context?.action === "register") {
    return "注册失败，请稍后重试";
  }

  if (context?.action === "addToCart") {
    return "添加到购物车失败，请重试";
  }

  if (context?.action === "checkout") {
    return "结算失败，请检查订单信息";
  }

  if (context?.action === "payment") {
    return "支付处理失败，请重试";
  }

  // 默认消息
  return "操作失败，请稍后重试";
}

/**
 * 异步操作的错误处理包装器
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext,
  showToast = true,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context, showToast);
    return null;
  }
}
