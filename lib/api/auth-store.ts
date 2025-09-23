import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cloneUser, formatAddressLines } from "./serializers";
import { users } from "./mock-data";
import type { Address, AddressInput, User } from "./types";

const SESSION_COOKIE = "auth_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 天
const CAPTCHA_TTL_MS = 1000 * 60 * 2; // 2 分钟
const DEMO_USER_DEFAULT_PASSWORD = "shiba-demo";
const CAPTCHA_LENGTH = 5;
const CAPTCHA_WIDTH = 144;
const CAPTCHA_HEIGHT = 52;
const CAPTCHA_ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CAPTCHA_NOISE_LINES = 3;
const CAPTCHA_BACKGROUND = "#f5f7fa";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChar() {
  const index = randomInt(0, CAPTCHA_ALLOWED_CHARS.length - 1);
  return CAPTCHA_ALLOWED_CHARS[index] ?? "X";
}

function generateCaptchaText(length = CAPTCHA_LENGTH) {
  let text = "";
  for (let i = 0; i < length; i += 1) {
    text += randomChar();
  }
  return text;
}

function randomColor() {
  const hue = randomInt(0, 360);
  const saturation = randomInt(55, 75);
  const lightness = randomInt(35, 55);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function generateNoiseLines() {
  const segments: string[] = [];
  for (let i = 0; i < CAPTCHA_NOISE_LINES; i += 1) {
    const startY = randomInt(5, CAPTCHA_HEIGHT - 5);
    const endY = randomInt(5, CAPTCHA_HEIGHT - 5);
    const controlY1 = randomInt(5, CAPTCHA_HEIGHT - 5);
    const controlY2 = randomInt(5, CAPTCHA_HEIGHT - 5);
    const color = randomColor();
    segments.push(
      `<path d="M0 ${startY} C ${CAPTCHA_WIDTH / 3} ${controlY1}, ${(CAPTCHA_WIDTH / 3) * 2} ${controlY2}, ${CAPTCHA_WIDTH} ${endY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" opacity="0.45" />`,
    );
  }
  return segments.join("");
}

function generateCaptchaSvg(text: string) {
  const chars = text.split("");
  const step = CAPTCHA_WIDTH / (chars.length + 1);
  const charSegments = chars
    .map((char, index) => {
      const x = Math.round(step * (index + 1));
      const y = randomInt(Math.round(CAPTCHA_HEIGHT * 0.6), CAPTCHA_HEIGHT - 8);
      const rotate = randomInt(-18, 18);
      const color = randomColor();
      const scale = randomInt(95, 110) / 100;
      return `<text x="${x}" y="${y}" fill="${color}" font-size="26" font-weight="600" text-anchor="middle" transform="translate(${x}, ${y}) rotate(${rotate}) scale(${scale}) translate(-${x}, -${y})">${char}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" width="${CAPTCHA_WIDTH}" height="${CAPTCHA_HEIGHT}" viewBox="0 0 ${CAPTCHA_WIDTH} ${CAPTCHA_HEIGHT}">
  <rect width="100%" height="100%" fill="${CAPTCHA_BACKGROUND}" rx="6" />
  ${generateNoiseLines()}
  ${charSegments}
</svg>`;
}

export type AuthErrorCode =
  | "CAPTCHA_REQUIRED"
  | "INVALID_CAPTCHA"
  | "IDENTIFIER_REQUIRED"
  | "ACCOUNT_EXISTS"
  | "WEAK_PASSWORD"
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

type AuthAccount = {
  userId: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
};

type SessionRecord = {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
};

type CaptchaRecord = {
  token: string;
  answer: string;
  expiresAt: number;
};

type AuthStore = {
  accounts: AuthAccount[];
  sessions: Map<string, SessionRecord>;
  captchas: Map<string, CaptchaRecord>;
};

type GlobalAuthStore = typeof globalThis & {
  __COMMERCE_AUTH_STORE__?: AuthStore;
};

const globalAuthStore = globalThis as GlobalAuthStore;

export const AUTH_SESSION_COOKIE = SESSION_COOKIE;

function getAuthStore(): AuthStore {
  if (!globalAuthStore.__COMMERCE_AUTH_STORE__) {
    globalAuthStore.__COMMERCE_AUTH_STORE__ = {
      accounts: [],
      sessions: new Map(),
      captchas: new Map(),
    };
    seedDemoAccounts(globalAuthStore.__COMMERCE_AUTH_STORE__);
  }

  return globalAuthStore.__COMMERCE_AUTH_STORE__;
}

function seedDemoAccounts(store: AuthStore) {
  users.forEach((user) => {
    const email = normaliseEmail(user.email);
    const phone = normalisePhone(user.phone);
    if (store.accounts.some((entry) => entry.userId === user.id)) {
      return;
    }
    const now = new Date().toISOString();
    const { hash, salt } = hashPassword(DEMO_USER_DEFAULT_PASSWORD);
    store.accounts.push({
      userId: user.id,
      email,
      phone,
      passwordHash: hash,
      salt,
      createdAt: now,
      updatedAt: now,
    });
  });
}

function normaliseEmail(value: string | undefined | null) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function normalisePhone(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  const cleaned = value.replace(/\s|-/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

function normaliseCaptchaAnswer(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  return value.replace(/\s+/g, "").toUpperCase();
}

function hashPassword(password: string, salt?: string) {
  const resolvedSalt = salt ?? randomBytes(16).toString("hex");
  const derived = pbkdf2Sync(password, resolvedSalt, 12000, 64, "sha512");

  return {
    salt: resolvedSalt,
    hash: derived.toString("hex"),
  };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const { hash: computedHash } = hashPassword(password, salt);
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(computedHash, "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

function cleanupExpiredSessions(store: AuthStore) {
  const now = Date.now();
  for (const [token, session] of store.sessions) {
    if (session.expiresAt <= now) {
      store.sessions.delete(token);
    }
  }
}

function cleanupExpiredCaptchas(store: AuthStore) {
  const now = Date.now();
  for (const [token, record] of store.captchas) {
    if (record.expiresAt <= now) {
      store.captchas.delete(token);
    }
  }
}

function createSession(store: AuthStore, userId: string): SessionRecord {
  cleanupExpiredSessions(store);
  const token = `sess-${crypto.randomUUID()}`;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const record: SessionRecord = {
    token,
    userId,
    expiresAt,
    createdAt: Date.now(),
  };

  store.sessions.set(token, record);
  return record;
}

function consumeCaptcha(
  store: AuthStore,
  token: string | undefined,
  answer: string | undefined,
) {
  if (!token || !answer) {
    throw new AuthError("CAPTCHA_REQUIRED", "请输入验证码");
  }

  cleanupExpiredCaptchas(store);
  const record = store.captchas.get(token);
  store.captchas.delete(token);

  if (!record) {
    throw new AuthError("INVALID_CAPTCHA", "验证码已失效，请刷新重试");
  }

  if (record.expiresAt <= Date.now()) {
    throw new AuthError("INVALID_CAPTCHA", "验证码已失效，请刷新重试");
  }

  const normalised = normaliseCaptchaAnswer(answer);
  if (!normalised || normalised !== record.answer) {
    throw new AuthError("INVALID_CAPTCHA", "验证码不正确");
  }
}

function toPublicUser(user: User) {
  return cloneUser(user);
}

function findAccountByIdentifier(
  store: AuthStore,
  email?: string,
  phone?: string,
) {
  if (email) {
    const byEmail = store.accounts.find((entry) => entry.email === email);
    if (byEmail) {
      return byEmail;
    }
  }

  if (phone) {
    return store.accounts.find((entry) => entry.phone === phone);
  }

  return undefined;
}

function ensureIdentifier(
  email?: string,
  phone?: string,
): { email?: string; phone?: string } {
  const resolvedEmail = normaliseEmail(email);
  const resolvedPhone = normalisePhone(phone);

  if (!resolvedEmail && !resolvedPhone) {
    throw new AuthError("IDENTIFIER_REQUIRED", "请输入邮箱或手机号");
  }

  return {
    email: resolvedEmail,
    phone: resolvedPhone,
  };
}

function ensureAccountUnique(store: AuthStore, email?: string, phone?: string) {
  if (email && store.accounts.some((entry) => entry.email === email)) {
    throw new AuthError("ACCOUNT_EXISTS", "该邮箱已注册");
  }

  if (phone && store.accounts.some((entry) => entry.phone === phone)) {
    throw new AuthError("ACCOUNT_EXISTS", "该手机号已注册");
  }
}

function ensurePasswordStrong(password: string) {
  if (!password || password.trim().length < 6) {
    throw new AuthError("WEAK_PASSWORD", "密码至少需要 6 位字符");
  }
}

export type CaptchaPayload = {
  token: string;
  svg: string;
  expiresAt: string;
};

export function createCaptcha(): CaptchaPayload {
  const store = getAuthStore();
  cleanupExpiredCaptchas(store);
  const text = generateCaptchaText();
  const svg = generateCaptchaSvg(text);
  const token = `cap-${crypto.randomUUID()}`;
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const answer = normaliseCaptchaAnswer(text) ?? "";
  store.captchas.set(token, {
    token,
    answer,
    expiresAt,
  });

  return {
    token,
    svg,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

export type RegisterPayload = {
  email?: string;
  phone?: string;
  password: string;
  nickname?: string;
  captchaToken?: string;
  captchaCode?: string;
};

export type AuthSession = {
  token: string;
  expiresAt: number;
};

export type AuthResult = {
  user: User;
  session: AuthSession;
};

export function registerUser(payload: RegisterPayload): AuthResult {
  const store = getAuthStore();
  consumeCaptcha(store, payload.captchaToken, payload.captchaCode);
  ensurePasswordStrong(payload.password);
  const { email, phone } = ensureIdentifier(payload.email, payload.phone);
  ensureAccountUnique(store, email, phone);

  const now = new Date().toISOString();
  const user: User = {
    id: `user-${crypto.randomUUID()}`,
    email: email ?? "",
    firstName: "",
    lastName: "",
    phone,
    nickname: payload.nickname?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    addresses: [],
  };

  users.push(user);

  const { hash, salt } = hashPassword(payload.password);
  store.accounts.push({
    userId: user.id,
    email,
    phone,
    passwordHash: hash,
    salt,
    createdAt: now,
    updatedAt: now,
  });

  const session = createSession(store, user.id);

  return {
    user: toPublicUser(user),
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
  };
}

export type LoginPayload = {
  email?: string;
  phone?: string;
  password: string;
  captchaToken?: string;
  captchaCode?: string;
};

export function authenticateUser(payload: LoginPayload): AuthResult {
  const store = getAuthStore();
  consumeCaptcha(store, payload.captchaToken, payload.captchaCode);
  const { email, phone } = ensureIdentifier(payload.email, payload.phone);
  const account = findAccountByIdentifier(store, email, phone);

  if (!account) {
    throw new AuthError("INVALID_CREDENTIALS", "账号不存在或未注册");
  }

  const isValid = verifyPassword(
    payload.password,
    account.passwordHash,
    account.salt,
  );

  if (!isValid) {
    throw new AuthError("INVALID_CREDENTIALS", "账号或密码不匹配");
  }

  const user = users.find((entry) => entry.id === account.userId);

  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "用户不存在，请联系管理员");
  }

  const now = new Date().toISOString();
  account.updatedAt = now;
  user.updatedAt = now;

  const session = createSession(store, user.id);

  return {
    user: toPublicUser(user),
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
  };
}

export function invalidateSession(token: string) {
  const store = getAuthStore();
  store.sessions.delete(token);
}

export async function getUserFromSessionCookie(): Promise<User | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return undefined;
  }

  const store = getAuthStore();
  cleanupExpiredSessions(store);
  const record = store.sessions.get(token);

  if (!record || record.expiresAt <= Date.now()) {
    if (record) {
      store.sessions.delete(token);
    }
    return undefined;
  }

  const user = users.find((entry) => entry.id === record.userId);
  return user ? toPublicUser(user) : undefined;
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export function updateUserProfile(
  userId: string,
  profile: Partial<Pick<User, "nickname" | "firstName" | "lastName" | "phone">>,
) {
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "用户不存在");
  }

  const now = new Date().toISOString();
  if (profile.nickname !== undefined) {
    user.nickname = profile.nickname?.trim() || undefined;
  }

  if (profile.firstName !== undefined) {
    user.firstName = profile.firstName?.trim() || "";
  }

  if (profile.lastName !== undefined) {
    user.lastName = profile.lastName?.trim() || "";
  }

  if (profile.phone !== undefined) {
    user.phone = normalisePhone(profile.phone);
  }

  user.updatedAt = now;

  const account = getAuthStore().accounts.find(
    (entry) => entry.userId === userId,
  );
  if (account) {
    account.updatedAt = now;
    if (user.phone) {
      account.phone = normalisePhone(user.phone);
    }
  }

  return toPublicUser(user);
}

export function upsertCustomerAddress(
  userId: string,
  input: AddressInput,
): Address {
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "用户不存在");
  }

  const addressId = input.id;
  const existing = addressId
    ? user.addresses.find((entry) => entry.id === addressId)
    : undefined;

  const nextAddress: Address = {
    id: addressId || `addr-${crypto.randomUUID()}`,
    firstName: (input.firstName || "").trim(),
    lastName: (input.lastName || "").trim(),
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    country: input.country?.trim() || "中国",
    countryCode: input.countryCode?.trim().toUpperCase() || "CN",
    province: input.province?.trim() || undefined,
    city: (input.city || "").trim(),
    district: input.district?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    address1: (input.address1 || "").trim(),
    address2: input.address2?.trim() || undefined,
    isDefault: Boolean(input.isDefault),
  };

  nextAddress.formatted = formatAddressLines(nextAddress);

  if (existing) {
    Object.assign(existing, nextAddress);
  } else {
    user.addresses.push(nextAddress);
  }

  if (nextAddress.isDefault) {
    user.addresses = user.addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === nextAddress.id,
      formatted: entry.formatted || formatAddressLines(entry),
    }));
    user.defaultAddress = user.addresses.find(
      (entry) => entry.id === nextAddress.id,
    );
  } else if (!user.defaultAddress) {
    user.defaultAddress = nextAddress;
    nextAddress.isDefault = true;
  }

  user.updatedAt = new Date().toISOString();

  return nextAddress;
}

export function deleteCustomerAddress(userId: string, addressId: string) {
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "用户不存在");
  }

  user.addresses = user.addresses.filter((entry) => entry.id !== addressId);

  if (user.defaultAddress?.id === addressId) {
    user.defaultAddress = user.addresses.find((entry) => entry.isDefault);
  }
}
