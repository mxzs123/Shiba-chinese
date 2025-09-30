"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceType = "prescription" | "shipping";

type PrescriptionComplianceReminderProps = {
  orderId: string;
  orderNumber?: string;
  productTitles?: string[];
  pendingSurveyCount?: number;
  identityCompleted: boolean;
  identityHref: string;
  surveyHref?: string;
  type?: ComplianceType;
};

const STORAGE_PREFIX = "compliance-reminder";
const POSITION_STORAGE_KEY = `${STORAGE_PREFIX}:position`;
const DRAG_MARGIN = 24;
const DRAG_THRESHOLD_PX = 4;

type Offset = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  dragging: boolean;
};

export function PrescriptionComplianceReminder({
  orderId,
  orderNumber,
  productTitles = [],
  pendingSurveyCount = 0,
  identityCompleted,
  identityHref,
  surveyHref,
  type = "prescription",
}: PrescriptionComplianceReminderProps) {
  const storageKey = `${STORAGE_PREFIX}:${orderId}`;
  const [collapsed, setCollapsed] = useState(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const resetSuppressTimeoutRef = useRef<number | null>(null);

  const isPrescription = type === "prescription";
  const surveyCompleted = pendingSurveyCount === 0;
  const allCompleted =
    identityCompleted && (isPrescription ? surveyCompleted : true);

  const clampOffset = useCallback((x: number, y: number) => {
    if (typeof window === "undefined") {
      return { x, y };
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;

    const maxX = 0;
    const maxY = 0;
    const minX = -Math.max(0, window.innerWidth - width - DRAG_MARGIN);
    const minY = -Math.max(0, window.innerHeight - height - DRAG_MARGIN);

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === "collapsed") {
      setCollapsed(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(POSITION_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Offset>;

        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          const clamped = clampOffset(parsed.x, parsed.y);
          setOffset(clamped);
        }
      }
    } catch {
      /* ignore storage fallback */
    }
  }, [clampOffset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setOffset((prev) => clampOffset(prev.x, prev.y));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [clampOffset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        POSITION_STORAGE_KEY,
        JSON.stringify({ x: offset.x, y: offset.y }),
      );
    } catch {
      /* ignore storage fallback */
    }
  }, [offset]);

  useEffect(() => {
    setOffset((prev) => {
      const adjusted = clampOffset(prev.x, prev.y);

      if (adjusted.x === prev.x && adjusted.y === prev.y) {
        return prev;
      }

      return adjusted;
    });
  }, [collapsed, clampOffset]);

  useEffect(() => {
    return () => {
      if (resetSuppressTimeoutRef.current !== null) {
        if (typeof window !== "undefined") {
          window.clearTimeout(resetSuppressTimeoutRef.current);
        }
      }
    };
  }, []);

  const handleCollapse = () => {
    setCollapsed(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "collapsed");
    }
  };

  const handleExpand = () => {
    setCollapsed(false);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialX: offset.x,
      initialY: offset.y,
      dragging: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;

    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (!state.dragging) {
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }

      state.dragging = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(state.pointerId);
    }

    const next = clampOffset(state.initialX + deltaX, state.initialY + deltaY);

    setOffset((prev) => {
      if (prev.x === next.x && prev.y === next.y) {
        return prev;
      }
      return next;
    });

    event.preventDefault();
  };

  const finishDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;

    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    if (state.dragging) {
      const target = event.currentTarget;

      if (target.hasPointerCapture(state.pointerId)) {
        target.releasePointerCapture(state.pointerId);
      }

      setIsDragging(false);
      suppressClickRef.current = true;

      if (typeof window !== "undefined") {
        if (resetSuppressTimeoutRef.current !== null) {
          window.clearTimeout(resetSuppressTimeoutRef.current);
        }

        resetSuppressTimeoutRef.current = window.setTimeout(() => {
          suppressClickRef.current = false;
          resetSuppressTimeoutRef.current = null;
        }, 0);
      } else {
        suppressClickRef.current = false;
        resetSuppressTimeoutRef.current = null;
      }
    }

    dragStateRef.current = null;
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishDragging(event);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.stopPropagation();
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  const getTitle = () => {
    if (isPrescription) {
      return orderNumber ? `订单 ${orderNumber}` : "处方药订单";
    }
    return "顺丰国际物流";
  };

  const getDescription = () => {
    if (isPrescription) {
      return "处方药审核待完成";
    }
    return "需要完成实名认证";
  };

  const renderCollapsedBadge = () => {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg transition-all",
          allCompleted
            ? "border border-green-200 bg-white text-green-700 hover:border-green-300 hover:shadow-xl"
            : "border border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 hover:shadow-xl",
        )}
        aria-label="查看合规提醒"
      >
        {allCompleted ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4" aria-hidden />
        )}
        <span>
          {allCompleted
            ? isPrescription
              ? "处方审核已完成"
              : "实名认证已完成"
            : isPrescription
              ? "待完成处方审核"
              : "待完成实名认证"}
        </span>
        <ChevronUp
          className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]"
          aria-hidden
        />
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        style={{ touchAction: "none" }}
      >
        {collapsed ? (
          renderCollapsedBadge()
        ) : (
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            {/* Header */}
            <div
              className={cn(
                "relative overflow-hidden px-6 py-4",
                allCompleted
                  ? "bg-gradient-to-br from-green-50 to-emerald-50"
                  : "bg-gradient-to-br from-amber-50 to-orange-50",
              )}
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {allCompleted ? (
                      <CheckCircle2
                        className="h-5 w-5 text-green-600"
                        aria-hidden
                      />
                    ) : (
                      <AlertCircle
                        className="h-5 w-5 text-amber-600"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        allCompleted ? "text-green-700" : "text-amber-700",
                      )}
                    >
                      {getDescription()}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {getTitle()}
                  </h3>
                  {isPrescription && productTitles.length > 0 && (
                    <p className="text-xs text-neutral-600">
                      {productTitles.length === 1
                        ? productTitles[0]
                        : `${productTitles[0]} 等 ${productTitles.length} 件`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/80 hover:text-neutral-700"
                  aria-label="收起提醒"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 p-6">
              {/* Identity Step */}
              <ComplianceItem
                title="上传身份证"
                description={
                  identityCompleted
                    ? "身份信息已通过审核"
                    : isPrescription
                      ? "处方药需完成实名认证"
                      : "国际物流需完成实名认证"
                }
                completed={identityCompleted}
                href={identityHref}
                actionLabel={identityCompleted ? "查看" : "前往上传"}
              />

              {/* Survey Step - Only for prescription type */}
              {isPrescription && surveyHref && (
                <ComplianceItem
                  title="确认问卷内容"
                  description={
                    surveyCompleted
                      ? "问卷已确认提交"
                      : pendingSurveyCount > 0
                        ? `${pendingSurveyCount} 份问卷待确认`
                        : "确认问卷信息后可提交审核"
                  }
                  completed={surveyCompleted}
                  href={surveyHref}
                  actionLabel={surveyCompleted ? "查看" : "立即确认"}
                />
              )}
            </div>

            {/* Footer */}
            {orderNumber && (
              <div className="border-t border-neutral-100 px-6 py-4">
                <Link
                  href="/account/orders"
                  prefetch
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900"
                >
                  <span>查看订单详情</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ComplianceItem({
  title,
  description,
  completed,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  completed: boolean;
  href: string;
  actionLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition",
        completed
          ? "border-green-100 bg-green-50/50"
          : "border-neutral-200 bg-neutral-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          completed
            ? "bg-green-100 text-green-600"
            : "bg-amber-100 text-amber-600",
        )}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        ) : (
          <AlertCircle className="h-5 w-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>
      <Link
        href={href}
        prefetch
        className={cn(
          "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition",
          completed
            ? "border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-white"
            : "bg-amber-500 text-white hover:bg-amber-600",
        )}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default PrescriptionComplianceReminder;
