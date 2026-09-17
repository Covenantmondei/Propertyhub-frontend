'use client';

import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function GDPRPage() {
  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto', lineHeight: 1.8 }}>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            GDPR & NDPR Compliance
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Last updated: September 2026</p>

          <div style={{ background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. Compliance Commitment</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              PropertyHub complies with the Nigeria Data Protection Regulation (NDPR) as well as the General Data Protection Regulation (GDPR) for international users interacting with properties in Nigeria.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>2. Your Data Rights</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              You have the right to request access to the personal data we hold about you, request corrections to erroneous information, and request permanent deletion of your profile and data records.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>3. Exercising Your Rights</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              To exercise your data protection rights, submit a request to dpo@propertyhub.com with your registered email address.
            </p>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
