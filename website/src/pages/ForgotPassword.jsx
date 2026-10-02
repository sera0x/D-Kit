import React, { useState } from 'react';
import { api } from '../lib/api';
import './auth.css';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const goTo = (path) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Reset Password</h1>

        {sent ? (
          <p className="auth-hint">
            If an account exists for {email}, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={submit}>
            <p className="auth-hint">Enter your account email and we'll send a reset link.</p>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="cta-button primary" type="submit" disabled={submitting}>
              {submitting ? 'sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remembered it? <a href="/login" onClick={(e) => { e.preventDefault(); goTo('/login'); }}>Log In</a>
        </p>
      </div>
    </section>
  );
}
