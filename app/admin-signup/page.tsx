'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCall } from '@/lib/api';

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const checks = [
    { text: 'At least 8 characters', valid: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter', valid: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', valid: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number', valid: (pwd: string) => /\d/.test(pwd) },
    { text: 'One special character', valid: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const passedChecks = checks.filter((c) => c.valid(formData.password)).length;
  const strengthPercent = passedChecks === 0 ? 0 : Math.min(100, (passedChecks / checks.length) * 100);
  const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  const colorPalette = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#10b981'];
  const levelIndex = Math.min(Math.floor(passedChecks), 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.terms) {
      setError('Please accept the administrator terms and conditions');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await apiCall<{ detail?: string }>('/auth/register', 'POST', {
        email: formData.email,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        username: formData.username,
        password: formData.password,
        role: 'admin',
      });

      if (!res.success) {
        throw new Error(res.error || 'Admin registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="logo" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            PropertyHub
          </Link>
          <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', fontWeight: 600 }}>Admin Registration</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Create an administrator account to manage the platform
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Account Created!</h3>
            <p style={{ color: 'var(--muted-foreground)' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>First Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Last Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Username</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin_john"
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@propertyhub.com"
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {formData.password && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
                  <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${strengthPercent}%`, height: '100%', background: colorPalette[levelIndex], transition: 'width 0.3s' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: colorPalette[levelIndex], fontWeight: 600 }}>
                    <span>Strength</span>
                    <span>{strengthLevels[levelIndex]}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              {formData.confirm_password && formData.password !== formData.confirm_password && (
                <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>Passwords do not match</small>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              />
              <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                I agree to the Administrator Terms and Conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', borderRadius: '8px' }}
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              Already an admin?{' '}
              <Link href="/login" style={{ color: 'var(--foreground)', fontWeight: 600, textDecoration: 'underline' }}>
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
