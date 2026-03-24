'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { localizePath, normalizeLocale, type SupportedLocale } from '@/lib/localePath';

export function useLocaleNavigation() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const routeLocale = typeof params?.locale === 'string' ? params.locale : undefined;
  const pathnameLocale = pathname?.split('/')[1];
  const locale: SupportedLocale = normalizeLocale(routeLocale || pathnameLocale);

  const getLocalePath = (path: string) => localizePath(locale, path);

  return {
    locale,
    getLocalePath,
    push: (path: string) => router.push(getLocalePath(path)),
    replace: (path: string) => router.replace(getLocalePath(path)),
    back: () => router.back(),
    router,
  };
}
