'use client';

import { useCallback } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { localizePath, normalizeLocale, type SupportedLocale } from '@/lib/localePath';

export function useLocaleNavigation() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const routeLocale = typeof params?.locale === 'string' ? params.locale : undefined;
  const pathnameLocale = pathname?.split('/')[1];
  const locale: SupportedLocale = normalizeLocale(routeLocale || pathnameLocale);

  const getLocalePath = useCallback(
    (path: string) => localizePath(locale, path),
    [locale],
  );

  const push = useCallback(
    (path: string) => router.push(localizePath(locale, path)),
    [router, locale],
  );

  const replace = useCallback(
    (path: string) => router.replace(localizePath(locale, path)),
    [router, locale],
  );

  const back = useCallback(() => router.back(), [router]);

  return {
    locale,
    getLocalePath,
    push,
    replace,
    back,
    router,
  };
}
