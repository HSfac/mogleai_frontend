import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});

export const config = {
  matcher: ['/', '/(ko|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
