export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = options.getToken?.() ?? null;

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {})
      }
    });

    const text = await res.text();
    const body = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      throw new ApiError(`Request failed: ${res.status}`, res.status, body);
    }

    return body as T;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, data?: unknown) =>
      request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    patch: <T>(path: string, data?: unknown) =>
      request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' })
  };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

