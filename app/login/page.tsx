'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

const BACKEND_URL = API_BASE_URL;

type AuthStep = 'login' | 'signup' | 'forgot-password' | 'success';

function extractJWTPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('login');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTitle, setSuccessTitle] = useState('Welcome!');
  const [successMsg, setSuccessMsg] = useState('Redirecting to home page...');

  // Form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFirst, setSignupFirst] = useState('');
  const [signupLast, setSignupLast] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState<'buyer' | 'agent'>('buyer');
  const [forgotEmail, setForgotEmail] = useState('');

  // Password strength check
  const [pwChecks, setPwChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [pwStrengthPercent, setPwStrengthPercent] = useState(0);
  const [pwStrengthLevel, setPwStrengthLevel] = useState('');
  const [pwStrengthColor, setPwStrengthColor] = useState('#ef4444');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('authToken')) {
      router.replace('/home');
    }
  }, [router]);

  function handlePasswordChange(pwd: string) {
    setSignupPassword(pwd);
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPwChecks(checks);

    const passedCount = Object.values(checks).filter(Boolean).length;
    const percent = passedCount === 0 ? 0 : (passedCount / 5) * 100;
    setPwStrengthPercent(percent);

    if (passedCount <= 1) {
      setPwStrengthLevel('Weak');
      setPwStrengthColor('#ef4444');
    } else if (passedCount <= 3) {
      setPwStrengthLevel('Fair');
      setPwStrengthColor('#f59e0b');
    } else if (passedCount === 4) {
      setPwStrengthLevel('Good');
      setPwStrengthColor('#3b82f6');
    } else {
      setPwStrengthLevel('Strong');
      setPwStrengthColor('#10b981');
    }
  }

  function showStep(newStep: AuthStep) {
    setError('');
    setStep(newStep);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid username or password');

      localStorage.setItem('authToken', data.access_token);
      if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);

      const payload = extractJWTPayload(data.access_token);
      if (payload?.sub && payload?.role) {
        const userData = { username: payload.sub, user_id: payload.user_id, role: payload.role };
        localStorage.setItem('user', JSON.stringify(userData));

        setSuccessTitle('Welcome Back!');
        setSuccessMsg('Signed in successfully. Redirecting...');
        setStep('success');

        setTimeout(() => {
          if (userData.role === 'admin') router.push('/admin');
          else if (userData.role === 'agent') router.push('/agent-dashboard');
          else router.push('/home');
        }, 1200);
      } else {
        throw new Error('Invalid token format received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
          first_name: signupFirst.trim(),
          last_name: signupLast.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      setSuccessTitle('Account Created!');
      setSuccessMsg('Your account has been created. Please sign in with your new credentials.');
      setStep('success');

      setTimeout(() => {
        setStep('login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send reset link');

      setSuccessTitle('Reset Link Sent');
      setSuccessMsg('Please check your email for password reset instructions.');
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-background"></div>
        <div className="login-overlay"></div>

        <div className="login-content">
          <div className="auth-card" id="auth-card">
            <div className="glass-card">
              <div className="glass-content" id="auth-content">
                {/* LOGIN STEP */}
                <div className={`auth-step ${step === 'login' ? 'active' : ''}`} id="login-step">
                  <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                  </div>

                  {error && <div className="auth-alert-error">{error}</div>}

                  <form id="login-form" className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label glass-label">Username or Email</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                          type="text"
                          className="form-input glass-input"
                          id="login-username"
                          placeholder="Enter your username or email"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label glass-label">Password</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          type={showLoginPw ? 'text' : 'password'}
                          className="form-input glass-input"
                          id="login-password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowLoginPw(!showLoginPw)}
                        >
                          {showLoginPw ? (
                            <svg className="icon-eye-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="icon-eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="form-footer">
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => showStep('forgot-password')}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full glass-button"
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                  <div className="auth-footer">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => showStep('signup')}
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </div>

                {/* SIGNUP STEP */}
                <div className={`auth-step ${step === 'signup' ? 'active' : ''}`} id="signup-step">
                  <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us today</p>
                  </div>

                  {error && <div className="auth-alert-error">{error}</div>}

                  <form id="signup-form" className="auth-form" onSubmit={handleSignup}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label glass-label">First Name</label>
                        <div className="input-with-icon">
                          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <input
                            type="text"
                            className="form-input glass-input"
                            id="signup-first-name"
                            placeholder="First name"
                            value={signupFirst}
                            onChange={(e) => setSignupFirst(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label glass-label">Last Name</label>
                        <div className="input-with-icon">
                          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <input
                            type="text"
                            className="form-input glass-input"
                            id="signup-last-name"
                            placeholder="Last name"
                            value={signupLast}
                            onChange={(e) => setSignupLast(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label glass-label">Username</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <polyline points="17 11 19 13 23 9" />
                        </svg>
                        <input
                          type="text"
                          className="form-input glass-input"
                          id="signup-username"
                          placeholder="Choose a username"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label glass-label">Email</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input
                          type="email"
                          className="form-input glass-input"
                          id="signup-email"
                          placeholder="Enter your email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label glass-label">Password</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          type={showSignupPw ? 'text' : 'password'}
                          className="form-input glass-input"
                          id="signup-password"
                          placeholder="Create a password"
                          value={signupPassword}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowSignupPw(!showSignupPw)}
                        >
                          {showSignupPw ? (
                            <svg className="icon-eye-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="icon-eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {signupPassword && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{
                              width: `${pwStrengthPercent}%`,
                              backgroundColor: pwStrengthColor,
                            }}
                          ></div>
                        </div>
                        <div className="strength-text">
                          <span>Password strength</span>
                          <span style={{ color: pwStrengthColor, fontWeight: 600 }}>{pwStrengthLevel}</span>
                        </div>
                        <div className="strength-requirements">
                          <div className={`strength-requirement ${pwChecks.length ? 'met' : ''}`}>
                            At least 8 characters
                          </div>
                          <div className={`strength-requirement ${pwChecks.upper && pwChecks.lower ? 'met' : ''}`}>
                            Upper & lowercase letters
                          </div>
                          <div className={`strength-requirement ${pwChecks.number ? 'met' : ''}`}>
                            At least one number
                          </div>
                          <div className={`strength-requirement ${pwChecks.special ? 'met' : ''}`}>
                            At least one special character
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label glass-label">Confirm Password</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          className="form-input glass-input"
                          id="signup-confirm-password"
                          placeholder="Confirm your password"
                          value={signupConfirm}
                          onChange={(e) => setSignupConfirm(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          aria-label="Toggle confirm password visibility"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                        >
                          {showConfirmPw ? (
                            <svg className="icon-eye-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="icon-eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {signupConfirm && signupPassword !== signupConfirm && (
                      <div id="password-match-message">Passwords do not match</div>
                    )}

                    <div className="form-group">
                      <label className="form-label glass-label">Account Type</label>
                      <div className="role-selector">
                        <label className="role-option">
                          <input
                            type="radio"
                            name="role"
                            value="buyer"
                            checked={signupRole === 'buyer'}
                            onChange={() => setSignupRole('buyer')}
                          />
                          <div className="role-card">
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <div className="role-title">Buyer</div>
                            <div className="role-description">Looking for property</div>
                          </div>
                        </label>
                        <label className="role-option">
                          <input
                            type="radio"
                            name="role"
                            value="agent"
                            checked={signupRole === 'agent'}
                            onChange={() => setSignupRole('agent')}
                          />
                          <div className="role-card">
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <div className="role-title">Agent</div>
                            <div className="role-description">Listing properties</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full glass-button"
                      disabled={loading}
                    >
                      {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                  </form>

                  <div className="auth-footer">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => showStep('login')}
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </div>

                {/* FORGOT PASSWORD STEP */}
                <div className={`auth-step ${step === 'forgot-password' ? 'active' : ''}`} id="forgot-password-step">
                  <button className="back-button" onClick={() => showStep('login')} type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="icon">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back to sign in</span>
                  </button>

                  <div className="auth-header">
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">Enter your email to receive reset instructions</p>
                  </div>

                  {error && <div className="auth-alert-error">{error}</div>}

                  <form id="forgot-password-form" className="auth-form" onSubmit={handleForgotPassword}>
                    <div className="form-group">
                      <label className="form-label glass-label">Email</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input
                          type="email"
                          className="form-input glass-input"
                          id="forgot-email"
                          placeholder="Enter your email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full glass-button"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </div>

                {/* SUCCESS STEP */}
                <div className={`auth-step ${step === 'success' ? 'active' : ''}`} id="success-step">
                  <div className="success-content">
                    <div className="success-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h1 className="auth-title" id="success-title">{successTitle}</h1>
                    <p className="auth-subtitle" id="success-message">{successMsg}</p>
                    <button
                      type="button"
                      className="btn btn-primary glass-button"
                      style={{ marginTop: '1rem', maxWidth: '200px' }}
                      onClick={() => showStep('login')}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
