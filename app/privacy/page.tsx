'use client';

import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function PrivacyPage() {
  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto', lineHeight: 1.8 }}>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Last updated: September 2026</p>

          <div style={{ background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. Introduction</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              PropertyHub ("we", "our", or "us") is dedicated to protecting your privacy. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your personal data when using our platform.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>2. Information We Collect</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              We collect information provided directly by you during account registration (name, email, phone number, password), KYC identity verification data for agents (government identification cards, selfie photos), and data relating to property searches, saved favorites, and chat conversations.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>3. How We Use Your Information</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Your information is used to provide and improve our platform services, verify agent legitimacy, connect buyers with agents, facilitate real-time chat and visit scheduling, and ensure platform safety.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>4. Data Security</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              We employ industry-standard encryption and security protocols to safeguard your personal information against unauthorized access, alteration, or disclosure.
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>5. Contact Us</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              For any privacy-related questions or data deletion requests, please contact us at privacy@propertyhub.com.
            </p>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
