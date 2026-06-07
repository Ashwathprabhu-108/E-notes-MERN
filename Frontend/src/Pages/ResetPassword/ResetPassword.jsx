import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordIcon from '../../assets/Password.svg';
import ShowPassword from '../../assets/eye-icon.svg';
import DontShowPassword from '../../assets/eye-blind-icon.svg';
import './ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!password || !confirmPassword) return setError('Both fields are required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) return setError(data.message || 'Something went wrong.');

      setSuccess(true);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-root">
      <div className="rp-card">
        <div className="rp-header">
          <div className="rp-icon">🔐</div>
          <h2 className="rp-title">Set New Password</h2>
          <p className="rp-subtitle">Enter your new password below</p>
        </div>

        {success ? (
          <div className="rp-success">
            <div className="rp-success-icon">✓</div>
            <p>{message}</p>
            <p className="rp-redirect">Redirecting to login…</p>
          </div>
        ) : (
          <>
            <div className="field-group">
              <label className="field-label">New Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={PasswordIcon} alt="" className="icon-img" />
                </span>
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button className="eye-btn" type="button" onClick={() => setShowPassword(p => !p)}>
                  <img src={showPassword ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={PasswordIcon} alt="" className="icon-img" />
                </span>
                <input
                  className="field-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                />
                <button className="eye-btn" type="button" onClick={() => setShowConfirm(p => !p)}>
                  <img src={showConfirm ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>

            {error && <p className="rp-error">{error}</p>}

            <button className="rp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Updating…' : 'Reset Password'}
            </button>

            <button className="rp-back" onClick={() => navigate('/login')}>
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
