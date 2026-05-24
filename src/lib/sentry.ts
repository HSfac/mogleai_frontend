// Sentry를 선택적으로 초기화 (패키지 없으면 무시)
let SentryInstance: any = null;

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1,
    });
    SentryInstance = Sentry;
  } catch {
    // @sentry/nextjs 미설치 시 무시
  }
}

export function captureError(error: unknown, context?: Record<string, any>) {
  if (SentryInstance) {
    SentryInstance.captureException(error, { extra: context });
  } else {
    console.error('[Sentry fallback]', error, context);
  }
}
