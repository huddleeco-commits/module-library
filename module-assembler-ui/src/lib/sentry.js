/**
 * Sentry Error Tracking - Frontend Configuration
 *
 * Captures and reports errors from the React application.
 * Initialize this in main.jsx before rendering the app.
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ||
  'https://61141b4ca22d77ee02e9375ca0d8c622@o4510709184593920.ingest.us.sentry.io/4510715168096256';

/**
 * Initialize Sentry for frontend error tracking
 */
export function initSentry() {
  // Only initialize if we have a DSN
  if (!SENTRY_DSN) {
    console.log('Sentry disabled (no DSN)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture 10% of all sessions
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
      'Network request failed',
      'Failed to fetch',
    ],

    // Don't send errors in development unless explicitly enabled
    beforeSend(event, hint) {
      if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
        console.log('Sentry Error (dev mode - not sent):', hint?.originalException?.message || event.message);
        return null;
      }
      return event;
    },

    // Add extra context
    initialScope: {
      tags: {
        app: 'blink-assembler',
      },
    },
  });

  console.log('Sentry initialized (frontend)');
}

/**
 * Capture an exception manually
 */
export function captureException(error, context = {}) {
  if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
    console.error('Sentry Error captured:', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context.user) {
      scope.setUser(context.user);
    }
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message manually
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
    console.log(`Sentry message (${level}):`, message);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category = 'custom', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Error Boundary component for React
 * Wraps components and catches render errors
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Higher-order component to wrap routes with error boundary
 */
export function withErrorBoundary(Component, options = {}) {
  return Sentry.withErrorBoundary(Component, {
    fallback: options.fallback || <ErrorFallback />,
    showDialog: options.showDialog || false,
    ...options,
  });
}

/**
 * Default error fallback component
 */
export function ErrorFallback({ error, resetError }) {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '100px auto',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>Something went wrong</div>
      <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Oops! Something went wrong</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        We've been notified and are working to fix this issue.
      </p>
      {error?.message && (
        <pre style={{
          background: '#1a1a2e',
          color: '#ef4444',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'left',
          overflow: 'auto',
          marginBottom: '24px',
        }}>
          {error.message}
        </pre>
      )}
      <button
        onClick={resetError}
        style={{
          padding: '12px 24px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// Export Sentry for advanced usage
export { Sentry };
