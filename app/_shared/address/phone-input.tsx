"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PHONE_DIAL_CODE_OPTIONS } from "./phone-dial-codes";

type PhoneInputProps = {
  dialCode: string;
  number: string;
  onDialCodeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  disabled?: boolean;
};

export function PhoneInput({
  dialCode,
  number,
  onDialCodeChange,
  onNumberChange,
  disabled,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const list = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return PHONE_DIAL_CODE_OPTIONS;
    }

    return PHONE_DIAL_CODE_OPTIONS.filter((option) => {
      return (
        option.code.toLowerCase().includes(trimmed) ||
        option.country.toLowerCase().includes(trimmed) ||
        option.iso2.toLowerCase().includes(trimmed)
      );
    });
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex h-11 w-full items-center rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus-within:border-[#049e6b] focus-within:ring-2 focus-within:ring-[#049e6b]/20">
        <button
          type="button"
          className="flex items-center gap-2 text-neutral-700"
          onClick={() => {
            if (!disabled) {
              setOpen((prev) => !prev);
            }
          }}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="font-semibold">{dialCode || "+"}</span>
          <svg
            aria-hidden
            className="h-4 w-4 text-neutral-400"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="mx-2 h-5 w-px bg-neutral-200" aria-hidden />
        <input
          type="tel"
          className="w-full bg-transparent text-sm text-neutral-700 outline-none disabled:text-neutral-400"
          value={number}
          onChange={(event) => onNumberChange(event.target.value)}
          disabled={disabled}
          placeholder="联系电话"
        />
      </div>
      {open ? (
        <div className="absolute z-10 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
          <input
            ref={searchInputRef}
            className="mb-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-[#049e6b] focus:outline-none"
            placeholder="搜索国家或区号"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
              }
            }}
          />
          <div className="max-h-64 overflow-y-auto text-sm">
            <ul role="listbox" className="space-y-1">
              {list.map((option) => {
                const selected = option.code === dialCode;
                return (
                  <li key={`${option.iso2}-${option.code}`}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                        selected
                          ? "bg-[#049e6b]/10 text-[#03583b]"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                      onClick={() => {
                        onDialCodeChange(option.code);
                        setOpen(false);
                      }}
                    >
                      <span>{option.country}</span>
                      <span className="font-semibold">{option.code}</span>
                    </button>
                  </li>
                );
              })}
              {list.length === 0 ? (
                <li className="px-3 py-2 text-xs text-neutral-400">
                  未找到匹配的区号
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
