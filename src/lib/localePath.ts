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

export function ensureLocalizedPath(
  locale: string | string[] | undefined,
  path: string,
): string {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path;
  }

  if (
    path === '/ko' ||
    path === '/en' ||
    path.startsWith('/ko/') ||
    path.startsWith('/en/')
  ) {
    return path;
  }

  return localizePath(locale, path);
}
