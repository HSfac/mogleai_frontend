import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure a valid locale is always returned
  if (!locale || !['ko', 'en'].includes(locale)) {
    locale = 'ko';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
