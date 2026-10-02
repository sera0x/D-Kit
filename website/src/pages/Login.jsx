import React, { useState, useEffect, useRef } from 'react';
import { api, consumeSessionExpired } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, GitHubIcon } from '../components/ui/OAuthIcons';
import CodeSlots from '../components/ui/CodeSlots';
import './auth.css';

export default function Login({ onNavigate }) {
  const [step, setStep] = useState('credentials'); // 'credentials' | 'code'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeStatus, setCodeStatus] = useState('idle');
  const submittingRef = useRef(false);
  const [loginToken, setLoginToken] = useState('');
  const [error, setError] = useState(() => {
    const e = new URLSearchParams(window.location.search).get('error');
    if (e === 'rate') return 'Too many attempts. Please wait a few minutes and try again.';
    if (e === 'oauth') return 'Sign-in with that provider failed. Please try again.';
    if (consumeSessionExpired()) return 'Your session expired. Please log in again.';
    return '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState({ google: false, github: false });
  const { login } = useAuth();

  useEffect(() => {
    api.oauthProviders().then(setProviders).catch(() => {});
  }, []);

  const goTo = (path) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  const submitCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api.loginInitiate(email, password);
      setLoginToken(data.login_token);
      setStep('code');
    } catch (err) {
      if (err.status === 403) { goTo('/suspended'); return; }
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submitted by CodeSlots onComplete with the just-completed code, or by
  // the button as a manual fallback. submittingRef guards double submits
  // (auto-submit fires on the 6th digit; a form submit could race it).
  const submitCode = async (value) => {
    if (submittingRef.current || !/^\d{6}$/.test(value)) return;
    submittingRef.current = true;
    setError('');
    setSubmitting(true);
    try {
      const data = await api.loginVerify(loginToken, value);
      login(data.user, data.token, data.refresh_token);
      goTo('/dashboard');
    } catch (err) {
      submittingRef.current = false;
      if (err.status === 403) { goTo('/suspended'); return; }
      setError(err.message || 'Invalid or expired code');
      setCodeStatus('error'); // CodeSlots drains the digits and clears itself
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (value === '') setCodeStatus('idle'); // reset after the error drain
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Log In</h1>

        {step === 'credentials' && (
          <form onSubmit={submitCredentials}>
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
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <p className="auth-forgot">
              <a href="/forgot-password" onClick={(e) => { e.preventDefault(); goTo('/forgot-password'); }}>
                Forgot password?
              </a>
            </p>
            {error && <p className="auth-error">{error}</p>}
            <button className="cta-button primary" type="submit" disabled={submitting}>
              {submitting ? 'sending code...' : 'Continue'}
            </button>
            {(providers.google || providers.github) && (
              <>
                <div className="auth-divider">or</div>
                {providers.google && (
                  <a className="oauth-button" href="/api/auth/oauth/google">
                    <GoogleIcon /> Continue with Google
                  </a>
                )}
                {providers.github && (
                  <a className="oauth-button" href="/api/auth/oauth/github">
                    <GitHubIcon /> Continue with GitHub
                  </a>
                )}
              </>
            )}
          </form>
        )}

        {step === 'code' && (
          <div>
            <p className="auth-hint">Enter the code we sent to {email}.</p>
            <div className="auth-codeslots">
              <CodeSlots
                length={6}
                autoFocus
                onComplete={submitCode}
                onChange={handleCodeChange}
                status={codeStatus}
                disabled={submitting}
                ariaLabel="Login code"
                accentColor="#39ff88"
                inkColor="#39ff88"
                slotColor="#10130f"
                digitColor="#04130a"
                dangerColor="#ff3b30"
                slotSize={42}
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button
              type="button"
              className="auth-link-button"
              onClick={() => { setStep('credentials'); setError(''); setCode(''); setCodeStatus('empty'); }}
            >
              use a different email
            </button>
          </div>
        )}

        <p className="auth-switch">
          Don't have an account? <a href="/signup" onClick={(e) => { e.preventDefault(); goTo('/signup'); }}>Sign Up</a>
        </p>
      </div>
    </section>
  );
}
