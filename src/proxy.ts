import createMiddleware from 'next-intl/middleware';

const proxy = createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});

export default proxy;

export const config = {
  matcher: ['/', '/(ko|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
