import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css'; // Platform-wide styles (dropdowns, scrollbars, etc.)

// Initialize Sentry error tracking FIRST
import { initSentry, SentryErrorBoundary, ErrorFallback } from './lib/sentry.jsx';
initSentry();

// Determine which app to load based on studio flag
// Default: use original App (legacy) - new Studio is opt-in with ?studio=true
const useStudio = localStorage.getItem('useStudio') === 'true' ||
                  new URLSearchParams(window.location.search).get('studio') === 'true';

// Dynamic import for code splitting
const AppComponent = useStudio
  ? React.lazy(() => import('./StudioApp.jsx'))
  : React.lazy(() => import('./App.jsx'));

// Loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
      {useStudio ? '🚀' : '⚡'}
    </div>
    <div style={{ fontSize: '18px', fontWeight: '600' }}>
      Loading {useStudio ? 'Studio' : 'BLINK'}...
    </div>
    <div style={{
      marginTop: '24px',
      width: '200px',
      height: '4px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '30%',
        height: '100%',
        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
        borderRadius: '2px',
        animation: 'loading 1s ease-in-out infinite'
      }} />
    </div>
    <style>{`
      @keyframes loading {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(250%); }
        100% { transform: translateX(-100%); }
      }
    `}</style>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      showDialog={false}
    >
      <React.Suspense fallback={<LoadingFallback />}>
        <AppComponent />
      </React.Suspense>
    </SentryErrorBoundary>
  </React.StrictMode>
);
