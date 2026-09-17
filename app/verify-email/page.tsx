'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCall } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in the URL. Please check the link in your email.');
      return;
    }

    async function verify() {
      try {
        const res = await apiCall<{ message?: string }>(`/auth/verify-email?token=${token}`, 'GET');
        if (res.success) {
          if (res.data?.message === 'Email already verified') {
            setStatus('already');
          } else {
            setStatus('success');
            setTimeout(() => {
              router.push('/login');
            }, 2500);
          }
        } else {
          setStatus('error');
          setErrorMessage(res.error || 'Failed to verify email. The token may be expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Network error verifying email.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="login-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <Link href="/" className="logo" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
          PropertyHub
        </Link>

        {status === 'loading' && (
          <div style={{ padding: '3rem 0' }}>
            <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verifying your email</h3>
            <p style={{ color: 'var(--muted-foreground)' }}>Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ padding: '3rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email Verified Successfully!</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Your account has been activated. Redirecting to login...
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem' }}>
              Go to Login
            </Link>
          </div>
        )}

        {status === 'already' && (
          <div style={{ padding: '3rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email Already Verified</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Your email is already active. You can log in right away.
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem' }}>
              Log In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '3rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
              Verification Failed
            </h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/login" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                Back to Login
              </Link>
              <Link href="/" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="login-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
