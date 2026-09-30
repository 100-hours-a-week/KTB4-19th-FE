import * as Sentry from '@sentry/react';

const SENTRY_DSN =
  'https://75234c5a51aaed4ea5e0328775f22dd7@o4512163143876608.ingest.us.sentry.io/4512163148005376';

export function initSentry() {
  if (!import.meta.env.PROD) return;

  Sentry.init({ dsn: SENTRY_DSN });
}

export const sentryRootOptions = {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
};
