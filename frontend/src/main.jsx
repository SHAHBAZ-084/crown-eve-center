import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import './styles/catalog-layout.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { shouldRetryQuery, queryRetryDelay } from './utils/queryRetry'
// Auto-reload on Vite preload errors (new deployment chunk name mismatch)
window.addEventListener('vite:preloadError', (event) => {
  const lastReload = sessionStorage.getItem('last-chunk-reload');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('last-chunk-reload', now.toString());
    console.warn('Vite preload error detected, reloading page to fetch latest bundles...');
    window.location.reload();
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      retryDelay: queryRetryDelay,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <SpeedInsights />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
