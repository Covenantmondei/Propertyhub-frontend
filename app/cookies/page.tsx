'use client';

import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function CookiesPage() {
  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto', lineHeight: 1.8 }}>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Cookie Policy
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Last updated: September 2026</p>

          <div style={{ background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. What Are Cookies?</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Cookies and local storage tokens are small pieces of data stored on your device to help us recognize you, maintain your login sessions, and remember your platform preferences.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>2. How We Use Storage & Cookies</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              We use authentication tokens (`authToken`, `user`) in local storage to keep you logged in and enable instant communication. We do not use intrusive third-party cross-site tracking cookies.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>3. Managing Preferences</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              You can clear your browser storage and cookies at any time through your browser settings. Note that clearing storage will log you out of your account.
            </p>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
