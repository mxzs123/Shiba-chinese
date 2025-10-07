"use client";

import { Component, type ReactNode } from "react";
import { handleError } from "lib/error-handler";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示备用 UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到错误处理服务
    handleError(error, {
      action: "render",
      details: {
        componentStack: errorInfo.componentStack,
      },
    });

    // 调用自定义错误处理器
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义 fallback 或默认错误 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-neutral-900">
            出错了
          </h2>
          <p className="mb-6 text-sm text-neutral-600">
            页面加载时发生错误，请刷新页面重试
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
