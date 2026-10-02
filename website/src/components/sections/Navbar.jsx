import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/dkit-logo.png';
import { useAuth } from '../../context/AuthContext';
import './sections.css';

const NAV_LINKS = [
  { path: '/docs', label: 'Docs' },
  { path: '/changelog', label: 'Changelog' },
];

// No "dkit login" while someone is already mid-login/signup — the page itself
// is the auth form.
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

const Navbar = ({ onNavigate, currentPath }) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const onAuthPage = AUTH_PATHS.includes((currentPath || '').split(/[?#]/)[0]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path) => { setOpen(false); onNavigate ? onNavigate(path) : (window.location.href = path); };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => go('/')}>
          <img src={logo} alt="" className="navbar-logo" />
          <span>D-Kit</span>
        </button>
        <div className="navbar-actions">
          {!onAuthPage && (user ? (
            <button className="cta-button ghost" onClick={() => go('/dashboard')}>dashboard</button>
          ) : (
            <button className="cta-button ghost" onClick={() => go('/login')}>dkit login</button>
          ))}
          <button className="icon-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X width="16" height="16" /> : <Menu width="16" height="16" />}
          </button>
        </div>
      </div>

      {createPortal(
        open && (
          <>
            <div className="navbar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="navbar-drawer" role="dialog" aria-label="Menu">
              <div className="navbar-drawer-header">
                <button className="navbar-brand" onClick={() => go('/')}>
                  <img src={logo} alt="" className="navbar-logo" />
                  <span>D-Kit</span>
                </button>
                <button className="navbar-drawer-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X width="16" height="16" />
                </button>
              </div>
              <nav className="navbar-drawer-links">
                {NAV_LINKS.map((l) => (
                  <button key={l.path} className="navbar-link" onClick={() => go(l.path)}>{l.label}</button>
                ))}
                {user && <button className="navbar-link" onClick={() => go('/dashboard')}>Dashboard</button>}
              </nav>
              {user && <div className="navbar-drawer-account">{user?.email}</div>}
            </div>
          </>
        ),
        document.body
      )}
    </header>
  );
};

export default Navbar;
