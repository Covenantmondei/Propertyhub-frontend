'use client';

import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function TermsPage() {
  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto', lineHeight: 1.8 }}>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Last updated: September 2026</p>

          <div style={{ background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              By accessing or using PropertyHub, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>2. User Accounts & Responsibilities</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Users are responsible for maintaining the confidentiality of their login credentials. Agents guarantee that all listed property information, descriptions, prices, and media are accurate, lawful, and authentic.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>3. Prohibited Activities</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Users must not upload false or fraudulent property listings, engage in abusive communications, attempt unauthorized access to other user data, or violate Nigerian real estate regulations.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>4. Platform Role & Disclaimer</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              PropertyHub provides a matchmaking and communication portal. While we verify agents and review listings, buyers and renters are advised to carry out independent title and physical inspections before making financial commitments.
            </p>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
