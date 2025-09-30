"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/hooks/useAuthStore";
import { sanitizeRedirect } from "@/lib/utils";

import type { User } from "@/lib/api/types";

type IdentifierType = "email" | "phone";

type CaptchaPayload = {
  token: string;
  svg: string;
  expiresAt: string;
};

interface RegisterFormProps {
  redirectTo?: string;
}

interface ApiError {
  error?: string;
  code?: string;
}

const IDENTIFIER_LABEL: Record<IdentifierType, string> = {
  email: "邮箱",
  phone: "手机号",
};

function isValidEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

function normalisePhone(value: string) {
  return value.replace(/\s|-/g, "");
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const safeRedirect = useMemo(
    () => sanitizeRedirect(redirectTo),
    [redirectTo],
  );
  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaPayload | undefined>();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const identifierValue = useMemo(() => {
    return identifierType === "email" ? email.trim() : normalisePhone(phone);
  }, [identifierType, email, phone]);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const response = await fetch("/api/auth/captcha", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("captcha_request_failed");
      }

      const data = (await response.json()) as CaptchaPayload;
      setCaptcha(data);
    } catch (error) {
      console.error("loadCaptcha failed", error);
      toast.error("验证码获取失败，请稍后再试");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  useEffect(() => {
    setErrorMessage(undefined);
  }, [identifierType, email, phone, password, captchaCode, nickname]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!captcha) {
        toast.error("请先获取验证码");
        return;
      }

      if (!identifierValue) {
        setErrorMessage(`${IDENTIFIER_LABEL[identifierType]}不能为空`);
        return;
      }

      if (identifierType === "email" && !isValidEmail(identifierValue)) {
        setErrorMessage("请输入有效的邮箱地址");
        return;
      }

      if (!password.trim()) {
        setErrorMessage("密码至少需要 6 位字符");
        return;
      }

      if (password.trim().length < 6) {
        setErrorMessage("密码至少需要 6 位字符");
        return;
      }

      if (!captchaCode.trim()) {
        setErrorMessage("请输入图形验证码");
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: identifierType === "email" ? identifierValue : undefined,
            phone: identifierType === "phone" ? identifierValue : undefined,
            password,
            nickname: nickname.trim() || undefined,
            captchaToken: captcha.token,
            captchaCode,
          }),
        });

        if (!response.ok) {
          const data = (await response.json()) as ApiError;
          const message = data.error ?? "注册失败，请稍后重试";
          setErrorMessage(message);
          toast.error(message);
          void loadCaptcha();
          setCaptchaCode("");
          return;
        }

        const result = (await response.json()) as { user: User };
        setUser(result.user);
        toast.success("注册成功，已自动登录");
        router.replace(safeRedirect ?? "/checkout");
      } catch (error) {
        console.error("register failed", error);
        toast.error("注册失败，请检查网络后重试");
        void loadCaptcha();
      } finally {
        setSubmitting(false);
      }
    },
    [
      captcha,
      captchaCode,
      identifierType,
      identifierValue,
      loadCaptcha,
      nickname,
      password,
      safeRedirect,
      router,
      setUser,
    ],
  );

  const captchaSrc = useMemo(() => {
    if (!captcha) {
      return undefined;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(captcha.svg)}`;
  }, [captcha]);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
        {(["email", "phone"] as IdentifierType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setIdentifierType(type)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${identifierType === type ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            使用{IDENTIFIER_LABEL[type]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800">
          {IDENTIFIER_LABEL[identifierType]}
        </label>
        <input
          type={identifierType === "email" ? "email" : "tel"}
          autoComplete={identifierType === "email" ? "email" : "tel"}
          value={identifierType === "email" ? email : phone}
          onChange={(event) =>
            identifierType === "email"
              ? setEmail(event.target.value)
              : setPhone(event.target.value)
          }
          placeholder={`请输入${IDENTIFIER_LABEL[identifierType]}`}
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-[#049d6a]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800">密码</label>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 6 位，建议包含字母和数字"
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-[#049d6a]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800">
          昵称（可选）
        </label>
        <input
          type="text"
          autoComplete="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="用于展示的昵称"
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-[#049d6a]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800">验证码</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            autoComplete="off"
            maxLength={6}
            value={captchaCode}
            onChange={(event) =>
              setCaptchaCode(event.target.value.toUpperCase())
            }
            placeholder="请输入图形验证码"
            className="h-12 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm uppercase tracking-[0.3em] text-neutral-900 outline-none transition focus:border-[#049d6a]"
          />
          <button
            type="button"
            onClick={() => void loadCaptcha()}
            disabled={captchaLoading}
            className="flex h-12 w-28 items-center justify-center rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-600 transition hover:border-[#049d6a] hover:bg-[#049d6a]/5 hover:text-[#049d6a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {captchaLoading ? "刷新中" : "换一张"}
          </button>
        </div>
        {captchaSrc ? (
          <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <Image
              src={captchaSrc}
              alt="图形验证码"
              width={144}
              height={52}
              unoptimized
              draggable={false}
              className="h-14 w-full select-none rounded-lg object-contain"
            />
          </div>
        ) : null}
      </div>
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#049d6a] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(4,157,106,0.25)] transition-all hover:bg-[#037d54] hover:shadow-[0_6px_20px_rgba(4,157,106,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {submitting ? "注册中..." : "注册并登录"}
      </button>
    </form>
  );
}
