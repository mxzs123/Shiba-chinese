export const fallbackLocale = "zh-CN";

export const supportedLocales = ["zh-CN", "ja-JP", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultNamespaces = ["common", "dashboard", "orders", "customers"] as const;

export type Namespace = (typeof defaultNamespaces)[number];
