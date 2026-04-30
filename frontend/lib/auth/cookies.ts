export const AUTH_COOKIE_NAME = 'access_token';

export const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production'
};

