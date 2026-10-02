import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { applyChromeTheme, nudgeBrowserChrome } from '../../lib/browserChrome';

// Same storage key as AppShell, so the preference carries between the
// marketing pages and the dashboard/docs shell in both directions.
export const MarketingThemeContext = React.createContext('dark');

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('dkit_theme') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    try { localStorage.setItem('dkit_theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}

// Wraps every marketing page (home, login, signup, password reset) so they all
// carry one data-theme switch, one toggle button, and one chrome treatment —
// the marketing counterpart to AppShell.
export default function MarketingShell({ children }) {
  const [theme, toggleTheme] = useTheme();

  useLayoutEffect(() => { applyChromeTheme(theme); }, [theme]);
  useLayoutEffect(() => () => applyChromeTheme('dark'), []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return undefined; }
    return nudgeBrowserChrome({ keepPosition: true });
  }, [theme]);

  return (
    <MarketingThemeContext.Provider value={theme}>
      <div className="marketing-shell" data-theme={theme}>
        {children}
        <button
          className="icon-btn marketing-theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun width="16" height="16" /> : <Moon width="16" height="16" />}
        </button>
      </div>
    </MarketingThemeContext.Provider>
  );
}
