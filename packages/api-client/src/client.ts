import type { ApiResponse } from "@shiba/models";

type FetchLike = typeof fetch;

export interface ApiClientConfig {
  baseUrl?: string;
  getAuthToken?: () => string | undefined | Promise<string | undefined>;
  fetchFn?: FetchLike;
  defaultHeaders?: HeadersInit;
}

export type RequestOptions = RequestInit & {
  parseResponse?: (response: Response) => Promise<unknown>;
};

const DEFAULT_BASE_URL = "/api";

function resolveUrl(path: string, baseUrl: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json");
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
  config: ApiClientConfig = {},
): Promise<ApiResponse<T>> {
  const {
    baseUrl = DEFAULT_BASE_URL,
    fetchFn = fetch,
    getAuthToken,
    defaultHeaders,
  } = config;

  const headers = new Headers(defaultHeaders);
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (!headers.has("content-type") && options.body && !(options.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const token = await getAuthToken?.();
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetchFn(resolveUrl(path, baseUrl), {
    ...options,
    headers,
  });

  const parse = options.parseResponse ?? (async (res: Response) => {
    if (!isJsonResponse(res)) {
      return undefined;
    }

    try {
      return (await res.json()) as unknown;
    } catch {
      return undefined;
    }
  });

  const payload = (await parse(response)) as T | undefined;

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as Record<string, unknown>).error)
        : response.statusText;

    return {
      success: false,
      error: errorMessage,
      data: payload,
    };
  }

  return {
    success: true,
    data: payload,
  };
}

export function createApiClient(config: ApiClientConfig = {}) {
  return {
    request: <T>(path: string, options?: RequestOptions) => request<T>(path, options, config),
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "GET" }, config),
    post: <T, B = unknown>(path: string, body?: B, options?: RequestOptions) =>
      request<T>(
        path,
        {
          ...options,
          method: "POST",
          body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
        },
        config,
      ),
  };
}
