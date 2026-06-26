import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginSignup.css';
import UsernameIcon from '../../assets/Username.svg';
import EmailIcon    from '../../assets/Email.svg';
import PasswordIcon from '../../assets/Password.svg';
import GoogleIcon   from '../../assets/Google.svg';
import ShowPassword  from '../../assets/eye-icon.svg';
import DontShowPassword  from '../../assets/eye-blind-icon.svg';

export default function LoginSignup() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Already logged in → go straight to Home
  if (user) return <Navigate to="/" replace />;

  const [tab, setTab]                           = useState('login');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]                       = useState('');
  const [loading, setLoading]                   = useState(false);

  // ─── Forgot Password Modal ───────────────────────────────────────
  const [showForgot, setShowForgot]             = useState(false);
  const [fpStep, setFpStep]                     = useState(1); // 1=verify identity, 2=new password
  const [fpUsername, setFpUsername]             = useState('');
  const [fpEmail, setFpEmail]                   = useState('');
  const [fpPassword, setFpPassword]             = useState('');
  const [fpConfirm, setFpConfirm]               = useState('');
  const [fpShowPass, setFpShowPass]             = useState(false);
  const [fpShowConfirm, setFpShowConfirm]       = useState(false);
  const [fpError, setFpError]                   = useState('');
  const [fpLoading, setFpLoading]               = useState(false);
  const [fpDone, setFpDone]                     = useState(false);

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });

  const isSignup = tab === 'signup';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.username || !form.password) return setError('Username and password are required.');
    if (isSignup) {
      if (!form.email) return setError('Email is required.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }

    const url  = isSignup ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/signin';
    const body = isSignup
      ? { username: form.username, email: form.email, password: form.password }
      : { username: form.username, password: form.password };

    try {
      setLoading(true);
      const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Something went wrong.');
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const openForgot = () => {
    setShowForgot(true); setFpStep(1);
    setFpUsername(''); setFpEmail(''); setFpPassword(''); setFpConfirm('');
    setFpError(''); setFpDone(false);
  };

  // Step 1 — Verify username + email
  const handleVerifyIdentity = async () => {
    setFpError('');
    if (!fpUsername) return setFpError('Please enter your username.');
    if (!fpEmail)    return setFpError('Please enter your email.');
    try {
      setFpLoading(true);
      const res  = await fetch('http://localhost:5000/api/auth/verify-identity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fpUsername, email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) return setFpError(data.message || 'Verification failed.');
      setFpStep(2);
    } catch {
      setFpError('Network error. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  // Step 2 — Set new password
  const handleResetPassword = async () => {
    setFpError('');
    if (!fpPassword || fpPassword.length < 6) return setFpError('Password must be at least 6 characters.');
    if (fpPassword !== fpConfirm) return setFpError('Passwords do not match.');
    try {
      setFpLoading(true);
      const res  = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fpUsername, email: fpEmail, password: fpPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setFpError(data.message || 'Something went wrong.');
      setFpDone(true);
      setTimeout(() => setShowForgot(false), 2500);
    } catch {
      setFpError('Network error. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">

        <div className="tab-row">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
          <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        {!isSignup && (
          <>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={UsernameIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type="text" name="username" placeholder="Enter your username" value={form.username} onChange={handleChange} required />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={PasswordIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowPassword(p => !p)} type="button">
                  <img src={showPassword ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>
            <div className="forgot-row">
              <button className="forgot-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={openForgot}>
                Forgot Password?
              </button>
            </div>
          </>
        )}

        {isSignup && (
          <>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={UsernameIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type="text" name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={EmailIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={PasswordIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a password" value={form.password} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowPassword(p => !p)} type="button">
                  <img src={showPassword ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div className="field-wrap">
                <span className="field-icon"><img src={PasswordIcon} alt="" className="icon-img" /></span>
                <input className="field-input" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)} type="button">
                  <img src={showConfirmPassword ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>
          </>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">or continue with</span>
          <div className="divider-line" />
        </div>

        <div className="social-row">
          <button className="social-btn" onClick={handleGoogleLogin}>
            <span className="social-icon"><img src={GoogleIcon} alt="Google" className="icon-img" /></span>
            Google
          </button>
        </div>

      </div>

      {/* ─── Forgot Password Modal ─────────────────────────────────── */}
      {showForgot && (
        <div className="fp-overlay" onClick={() => setShowForgot(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <button className="fp-close" onClick={() => setShowForgot(false)}>✕</button>

            {/* Step dots */}
            {!fpDone && (
              <div className="fp-steps">
                <div className={`fp-step-dot ${fpStep >= 1 ? 'active' : ''} ${fpStep > 1 ? 'done' : ''}`}>
                  {fpStep > 1 ? '✓' : '1'}
                </div>
                <div className="fp-step-line" />
                <div className={`fp-step-dot ${fpStep >= 2 ? 'active' : ''}`}>2</div>
              </div>
            )}

            {/* ── Success ── */}
            {fpDone ? (
              <div className="fp-success">
                <div className="fp-success-icon">✓</div>
                <p className="fp-success-title">Password Updated!</p>
                <p className="fp-success-sub">You can now log in with your new password.</p>
              </div>

            /* ── Step 1: Verify Identity ── */
            ) : fpStep === 1 ? (
              <>
                <div className="fp-icon">🔍</div>
                <h3 className="fp-title">Verify Your Identity</h3>
                <p className="fp-desc">Enter the username and email linked to your account.</p>

                <div className="field-group" style={{ marginBottom: '0.75rem' }}>
                  <div className="field-wrap">
                    <span className="field-icon"><img src={UsernameIcon} alt="" className="icon-img" /></span>
                    <input className="field-input" type="text" placeholder="Your username"
                      value={fpUsername} onChange={e => { setFpUsername(e.target.value); setFpError(''); }} />
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '1rem' }}>
                  <div className="field-wrap">
                    <span className="field-icon"><img src={EmailIcon} alt="" className="icon-img" /></span>
                    <input className="field-input" type="email" placeholder="Your registered email"
                      value={fpEmail} onChange={e => { setFpEmail(e.target.value); setFpError(''); }} />
                  </div>
                </div>

                {fpError && <p className="fp-error">{fpError}</p>}
                <button className="fp-btn" onClick={handleVerifyIdentity} disabled={fpLoading}>
                  {fpLoading ? 'Verifying…' : 'Verify Identity →'}
                </button>
              </>

            /* ── Step 2: Set New Password ── */
            ) : (
              <>
                <div className="fp-icon">🔐</div>
                <h3 className="fp-title">Set New Password</h3>
                <p className="fp-desc">Choose a strong password for <strong>{fpUsername}</strong>.</p>

                <div className="field-group" style={{ marginBottom: '0.75rem' }}>
                  <div className="field-wrap">
                    <span className="field-icon"><img src={PasswordIcon} alt="" className="icon-img" /></span>
                    <input className="field-input" type={fpShowPass ? 'text' : 'password'}
                      placeholder="New password (min 6 chars)"
                      value={fpPassword} onChange={e => { setFpPassword(e.target.value); setFpError(''); }} />
                    <button className="eye-btn" type="button" onClick={() => setFpShowPass(p => !p)}>
                      <img src={fpShowPass ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                    </button>
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '1rem' }}>
                  <div className="field-wrap">
                    <span className="field-icon"><img src={PasswordIcon} alt="" className="icon-img" /></span>
                    <input className="field-input" type={fpShowConfirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={fpConfirm} onChange={e => { setFpConfirm(e.target.value); setFpError(''); }} />
                    <button className="eye-btn" type="button" onClick={() => setFpShowConfirm(p => !p)}>
                      <img src={fpShowConfirm ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                    </button>
                  </div>
                </div>

                {fpError && <p className="fp-error">{fpError}</p>}
                <button className="fp-btn" onClick={handleResetPassword} disabled={fpLoading}>
                  {fpLoading ? 'Saving…' : 'Reset Password'}
                </button>
                <button className="fp-resend" onClick={() => { setFpStep(1); setFpError(''); }}>
                  ← Change identity
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}