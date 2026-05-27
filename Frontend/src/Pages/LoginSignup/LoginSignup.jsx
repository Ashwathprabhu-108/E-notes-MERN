import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';   // ← ADD THIS
import './LoginSignup.css';
import UsernameIcon from '../../assets/Username.svg';
import EmailIcon    from '../../assets/Email.svg';
import PasswordIcon from '../../assets/Password.svg';
import GoogleIcon   from '../../assets/Google.svg';
import ShowPassword  from '../../assets/eye-icon.svg';
import DontShowPassword  from '../../assets/eye-blind-icon.svg';

export default function LoginSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();                         // ← ADD THIS

  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isSignup = tab === 'signup';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.username || !form.password) {
      return setError('Username and password are required.');
    }

    if (isSignup) {
      if (!form.email) return setError('Email is required.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }

    const url = isSignup
      ? 'http://localhost:5000/api/auth/signup'
      : 'http://localhost:5000/api/auth/signin';

    const body = isSignup
      ? { username: form.username, email: form.email, password: form.password }
      : { username: form.username, password: form.password };

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Something went wrong.');
      }

      login(data.token, data.user); 
      navigate('/');

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    // ... rest of your JSX is completely unchanged ...
    <div className="auth-root">
      <div className="auth-card">

        <div className="tab-row">
          <button
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {!isSignup && (
          <>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={UsernameIcon} alt="" className="icon-img" />
                </span>
                <input className="field-input" type="text" name="username"
                  placeholder="Enter your username" value={form.username} onChange={handleChange} required/>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={PasswordIcon} alt="" className="icon-img" />
                </span>
                <input className="field-input" type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowPassword(prev => !prev)} type="button">
                  <img src={showPassword ? ShowPassword : DontShowPassword} alt="" className="icon-img" />
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>
          </>
        )}

        {isSignup && (
          <>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={UsernameIcon} alt="" className="icon-img" />
                </span>
                <input className="field-input" type="text" name="username"
                  placeholder="Choose a username" value={form.username} onChange={handleChange} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={EmailIcon} alt="" className="icon-img" />
                </span>
                <input className="field-input" type="email" name="email"
                  placeholder="Enter your email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <img src={PasswordIcon} alt="" className="icon-img" />
                </span>
                <input className="field-input" type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Create a password" value={form.password} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowPassword(prev => !prev)} type="button">
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
                <input className="field-input" type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} />
                <button className="eye-btn" onClick={() => setShowConfirmPassword(prev => !prev)} type="button">
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
            <span className="social-icon">
              <img src={GoogleIcon} alt="Google" className="icon-img" />
            </span>
            Google
          </button>
        </div>

      </div>
    </div>
  );
}