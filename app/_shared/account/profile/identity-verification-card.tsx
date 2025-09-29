"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

import { PrimaryButton } from "@/app/_shared";
import type {
  IdentityVerification,
  IdentityVerificationStatus,
} from "@/lib/api/types";
import type { submitIdentityVerificationAction } from "../actions";
import { useAuthStore } from "@/hooks/useAuthStore";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_IN_MB = 5;
const MAX_SIZE = MAX_SIZE_IN_MB * 1024 * 1024;

type IdentityVerificationCardProps = {
  userId: string;
  verification?: IdentityVerification;
  action: typeof submitIdentityVerificationAction;
  highlighted?: boolean;
};

type LocalDocumentState = {
  front?: string;
  back?: string;
};

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("无法读取文件"));
      }
    };
    reader.onerror = () => {
      reject(new Error("上传文件时发生错误，请重试"));
    };
    reader.readAsDataURL(file);
  });
}

function formatStatusLabel(status: IdentityVerificationStatus) {
  return status === "verified" ? "已完成实名认证" : "尚未上传身份证";
}

export function IdentityVerificationCard({
  userId,
  verification,
  action,
  highlighted = false,
}: IdentityVerificationCardProps) {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const identityFromStore = useAuthStore(
    (state) => state.user?.identityVerification,
  );
  const cardRef = useRef<HTMLElement | null>(null);
  const [document, setDocument] = useState<LocalDocumentState>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const effectiveVerification = verification ?? identityFromStore;
  const status = effectiveVerification?.status ?? "unverified";

  useEffect(() => {
    if (!highlighted) {
      return;
    }

    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    // 如果是已验证状态且高亮，自动展开
    if (status === "verified") {
      setExpanded(true);
    }
  }, [highlighted, status]);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("仅支持 JPG、PNG 或 WebP 格式");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`单个文件大小需小于 ${MAX_SIZE_IN_MB}MB`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDocument((prev) => ({ ...prev, [side]: dataUrl }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "文件读取失败";
      toast.error(message);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "verified") {
      return;
    }

    setError(null);

    if (!document.front || !document.back) {
      setError("请同时上传身份证正面与反面照片");
      return;
    }

    startTransition(async () => {
      const result = await action(userId, {
        frontImage: document.front ?? "",
        backImage: document.back ?? "",
      });

      if (!result.success) {
        const message = result.error || "上传失败，请稍后再试";
        setError(message);
        toast.error(message);
        return;
      }

      updateUser((user) => ({
        ...user,
        identityVerification: result.data,
      }));

      setDocument({});
      setError(null);
      toast.success("身份证上传成功");
      router.refresh();
    });
  };

  const renderPreview = (side: "front" | "back") => {
    const preview = document[side];
    if (!preview) {
      return (
        <span className="text-sm text-neutral-500">
          {side === "front" ? "上传身份证正面" : "上传身份证反面"}
        </span>
      );
    }

    const alt = side === "front" ? "身份证正面预览" : "身份证反面预览";
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        <Image
          src={preview}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 50vw, 100vw"
          unoptimized
        />
      </div>
    );
  };

  const renderVerifiedPreview = () => {
    if (!effectiveVerification?.document) {
      return null;
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
          <div className="relative h-full w-full">
            <Image
              src={effectiveVerification.document.frontImageUrl}
              alt="身份证正面"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              unoptimized
            />
          </div>
        </div>
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
          <div className="relative h-full w-full">
            <Image
              src={effectiveVerification.document.backImageUrl}
              alt="身份证反面"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              unoptimized
            />
          </div>
        </div>
      </div>
    );
  };

  if (status === "verified") {
    return (
      <section
        id="identity-verification"
        ref={cardRef}
        className={cn(
          "overflow-hidden rounded-3xl border bg-white/90 shadow-lg shadow-neutral-900/5 transition-all",
          highlighted
            ? "border-green-400 shadow-green-200/60 ring-2 ring-green-200"
            : "border-green-100",
        )}
      >
        {/* 折叠状态的横幅 */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between bg-green-50/50 px-4 py-3 text-left transition hover:bg-green-50"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-green-700">
              ✓ 当前状态：{formatStatusLabel(status)}
            </span>
            <span className="text-xs text-green-600/60">
              如需修改请联系客服
            </span>
          </div>
          <div className="flex items-center gap-3">
            {effectiveVerification?.document?.uploadedAt ? (
              <span className="text-xs text-green-600/70">
                {new Date(
                  effectiveVerification.document.uploadedAt,
                ).toLocaleDateString()}
              </span>
            ) : null}
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-green-600" aria-hidden />
            ) : (
              <ChevronDown className="h-5 w-5 text-green-600" aria-hidden />
            )}
          </div>
        </button>

        {/* 展开状态显示身份证图片 */}
        {expanded && (
          <div className="space-y-4 p-6">
            <p className="text-sm text-neutral-600">
              您已完成实名认证，以下是您上传的身份证信息。
            </p>
            {renderVerifiedPreview()}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      id="identity-verification"
      ref={cardRef}
      className={cn(
        "rounded-3xl border border-neutral-100 bg-white/90 p-8 shadow-lg shadow-neutral-900/5",
        highlighted &&
          "border-amber-400 shadow-amber-200/60 ring-2 ring-amber-200 motion-safe:animate-[pulse_1.6s_ease-in-out_2]",
      )}
    >
      <header className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">身份证上传</h3>
        <p className="text-sm text-neutral-500">
          为符合医药合规要求，请上传身份证正反面用于实名认证。我们仅在必要场景读取该认证状态。
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-700">
          当前状态：{formatStatusLabel(status)}
        </span>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["front", "back"] as const).map((side) => (
            <label
              key={side}
              className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 transition hover:border-[#049e6b]"
            >
              {renderPreview(side)}
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="sr-only"
                onChange={(event) => void handleFileChange(event, side)}
                disabled={pending}
              />
            </label>
          ))}
        </div>

        <ul className="space-y-1 text-xs text-neutral-400">
          <li>• 仅支持 JPG、PNG、WebP 格式，大小不超过 {MAX_SIZE_IN_MB}MB。</li>
          <li>• 信息仅用于完成实名认证，不会用于其他用途。</li>
        </ul>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex items-center gap-3">
          <PrimaryButton
            type="submit"
            loading={pending}
            loadingText="上传中..."
            disabled={pending}
          >
            确认上传
          </PrimaryButton>
          <button
            type="button"
            className="text-sm text-neutral-500 underline-offset-4 hover:underline"
            onClick={() => setDocument({})}
            disabled={pending}
          >
            清除已选文件
          </button>
        </div>
      </form>
    </section>
  );
}

export default IdentityVerificationCard;
