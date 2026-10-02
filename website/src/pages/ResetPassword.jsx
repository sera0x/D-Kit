import React, { useState } from 'react';
import { api } from '../lib/api';
import './auth.css';

export default function ResetPassword({ onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const goTo = (path) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'That reset link is invalid or has expired');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section className="auth-section">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="auth-error">This reset link is missing its token. Request a new one below.</p>
          <p className="auth-switch">
            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); goTo('/forgot-password'); }}>
              Request a new reset link
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Reset Password</h1>

        {done ? (
          <>
            <p className="auth-hint">Password updated. You can log in now.</p>
            <button className="cta-button primary" onClick={() => goTo('/login')}>Log In</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="cta-button primary" type="submit" disabled={submitting}>
              {submitting ? 'updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
