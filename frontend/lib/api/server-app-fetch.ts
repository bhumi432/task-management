import { cookies, headers } from 'next/headers';

/**
 * Server Components must forward cookies when calling same-origin Route Handlers;
 * otherwise httpOnly auth cookies are not sent and protected APIs return 401.
 */
export async function fetchFromApp(path: string, init: RequestInit = {}) {
  const h = await headers();
  const cookieStore = await cookies();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  const nextHeaders: Record<string, string> = {};
  const ih = init.headers;
  if (ih instanceof Headers) {
    ih.forEach((v, k) => {
      nextHeaders[k] = v;
    });
  } else if (Array.isArray(ih)) {
    for (const [k, v] of ih) nextHeaders[k] = v;
  } else if (ih && typeof ih === 'object') {
    Object.assign(nextHeaders, ih as Record<string, string>);
  }
  if (cookieHeader) nextHeaders.Cookie = cookieHeader;

  return fetch(`${proto}://${host}${path}`, {
    ...init,
    cache: init.cache ?? 'no-store',
    headers: nextHeaders
  });
}
