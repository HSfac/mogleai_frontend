export type SupportedLocale = 'ko' | 'en';

export function normalizeLocale(locale?: string | string[]): SupportedLocale {
  if (locale === 'en') {
    return 'en';
  }

  return 'ko';
}

export function localizePath(locale: string | string[] | undefined, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedLocale = normalizeLocale(locale);

  if (normalizedPath === '/') {
    return `/${normalizedLocale}`;
  }

  return `/${normalizedLocale}${normalizedPath}`;
}
