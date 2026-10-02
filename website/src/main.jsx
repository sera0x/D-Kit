import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// No splash screen: #root is empty until the bundle executes, but the page
// background is already dark (index.html), so first paint is instant and the
// app renders the moment JS arrives — no "booting" stall in between.
async function boot() {
  const rootEl = document.getElementById('root')
  try {
    const [{ default: App }, { default: ErrorBoundary }] = await Promise.all([
      import('./App.jsx'),
      import('./components/ui/ErrorBoundary.jsx'),
    ])
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )
  } catch (err) {
    rootEl.innerHTML =
      '<pre style="color:#fff;padding:2rem;white-space:pre-wrap;font-family:monospace;font-size:13px;">BOOT ERROR:\n' +
      (err && err.stack ? err.stack : String(err)) +
      '</pre>'
  }
}

boot()
