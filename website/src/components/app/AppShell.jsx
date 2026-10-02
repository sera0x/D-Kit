import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X, LogOut, Sun, Moon, LayoutGrid, BookOpen, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/dkit-logo.png';
import { applyChromeTheme, nudgeBrowserChrome } from '../../lib/browserChrome';
import '../../pages/dashboard.css';
import '../../pages/render-look.css';

// Shared chrome for every "app" page — Dashboard, Docs, Changelog — so the
// three share one navbar, one theme toggle, and one visual language.
//
// The theme is applied via the `data-theme` attribute on this component's own
// root element (.dash-shell), not on <html>. CSS variables set there only
// cascade to what's inside this shell, so toggling light mode here can never
// leak out to the marketing site (home, login, signup), which always stays
// on its own fixed dark look.

// The browser's status bar / overscroll area is kept in step with this shell's theme by
// lib/browserChrome (theme-color meta + <html> background). It is set here, and handed back
// to the marketing site's dark default the moment the shell unmounts.

export default function AppShell({ active, onNavigate, primaryNav, children }) {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('dkit_theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    try { localStorage.setItem('dkit_theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);

  // Layout effect: runs before paint, so the very first frame already has the right
  // status-bar color instead of flashing the dark marketing one.
  useLayoutEffect(() => { applyChromeTheme(theme); }, [theme]);
  useLayoutEffect(() => () => applyChromeTheme('dark'), []);

  // Safari re-tints its bars at scroll/toolbar moments, not on DOM changes — nudge it after a
  // theme switch. (Route changes are already nudged in App.jsx, so skip the first run.)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return undefined; }
    return nudgeBrowserChrome({ keepPosition: true });
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const goto = (path) => { setDrawerOpen(false); onNavigate ? onNavigate(path) : (window.location.href = path); };
  const goHome = () => goto('/');
  const handleLogout = () => { logout(); goto('/'); };

  const quickLinks = (
    <>
      {user && (
        <button className={'dash-nav-item' + (active === 'dashboard' ? ' active' : '')} onClick={() => goto('/dashboard')}>
          <LayoutGrid width="16" height="16" /> Dashboard
        </button>
      )}
      <button className={'dash-nav-item' + (active === 'docs' ? ' active' : '')} onClick={() => goto('/docs')}>
        <BookOpen width="16" height="16" /> Docs
      </button>
      <button className={'dash-nav-item' + (active === 'changelog' ? ' active' : '')} onClick={() => goto('/changelog')}>
        <History width="16" height="16" /> Changelog
      </button>
    </>
  );

  const nav = (
    // Clicking any nav item — workspace or quick link — closes the mobile drawer.
    <nav className="dash-nav" onClick={() => setDrawerOpen(false)}>
      {primaryNav && (
        <>
          <span className="dash-side-chip">Workspace</span>
          {primaryNav}
          <hr className="dash-nav-divider" />
        </>
      )}
      <span className="dash-side-chip">Quick links</span>
      {quickLinks}
    </nav>
  );

  const accountSlot = user ? (
    <div className="dash-side-user">
      <div className="dash-user-row">
        <span className="dash-avatar">{(user?.email || '?').slice(0, 1).toUpperCase()}</span>
        <div className="dash-user-meta">
          <div className="dash-user-name">{user?.email?.split('@')[0] || 'account'}</div>
          <div className="dash-user-email">{user?.email}</div>
        </div>
      </div>
      <div className="dash-side-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun width="14" height="14" /> : <Moon width="14" height="14" />}
        </button>
        <button className="dash-logout" onClick={handleLogout}><LogOut width="14" height="14" /> log out</button>
      </div>
    </div>
  ) : (
    <div className="dash-side-user">
      <div className="dash-side-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun width="14" height="14" /> : <Moon width="14" height="14" />}
        </button>
        <button className="dash-login" onClick={() => goto('/login')}>dkit login</button>
      </div>
    </div>
  );

  const sidebar = (
    <aside className="dash-side">
      <button className="dash-side-header" onClick={goHome} title="Back to home">
        <img src={logo} alt="" className="dash-side-logo" />
        <span>D-Kit</span>
      </button>
      {nav}
      {accountSlot}
    </aside>
  );

  const topbar = (
    <div className="dash-topbar">
      <button className="dash-topbar-brand" onClick={goHome}><img src={logo} alt="" />D-Kit</button>
      <div className="dash-topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme">
          {theme === 'dark' ? <Sun width="16" height="16" /> : <Moon width="16" height="16" />}
        </button>
        {!user && <button className="cta-button ghost" onClick={() => goto('/login')}>log in</button>}
        <button className="icon-btn" aria-label="Open menu" onClick={() => setDrawerOpen(true)}><Menu width="16" height="16" /></button>
      </div>
    </div>
  );

  const drawer = drawerOpen && (
    <>
      <div className="dash-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <div className="dash-drawer" role="dialog" aria-label="Menu">
        <div className="dash-drawer-header">
          <button className="dash-side-header" onClick={goHome}><img src={logo} alt="" className="dash-side-logo" /><span>D-Kit</span></button>
          <button className="dash-drawer-close" aria-label="Close menu" onClick={() => setDrawerOpen(false)}><X width="16" height="16" /></button>
        </div>
        {nav}
        {accountSlot}
      </div>
    </>
  );

  return (
    <div className="dash-shell" data-theme={theme}>
      {sidebar}
      {topbar}
      {drawer}
      <main className="dash-main">
        <div className="dash-main-inner">{children}</div>
      </main>
    </div>
  );
}
