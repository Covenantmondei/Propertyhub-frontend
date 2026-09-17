'use client';

import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function AboutPage() {
  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              About PropertyHub
            </h1>
            <p className="page-subtitle" style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)', maxWidth: '650px', margin: '0 auto' }}>
              Nigeria's premier real estate platform connecting buyers, sellers, and trusted agents with verified listings.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏠</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Our Mission</h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                To revolutionize the Nigerian real estate market by providing a transparent, secure, and efficient platform that connects property seekers with verified agents and authentic listings.
              </p>
            </div>

            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Our Vision</h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                To become Africa's most trusted real estate platform, making property transactions seamless, secure, and accessible to everyone.
              </p>
            </div>

            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Our Values</h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                Transparency, Trust, Innovation, and Customer-centricity drive everything we do. We believe in creating lasting value for our users.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '4rem', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Our Story</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              PropertyHub was founded with a simple yet powerful vision: to make real estate transactions in Nigeria transparent, secure, and accessible to everyone. We recognized the challenges faced by both property seekers and agents in the traditional real estate market – from fraudulent listings to difficulty in connecting with verified professionals.
            </p>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              Today, PropertyHub serves thousands of users across Nigeria, featuring verified agents, authenticated property listings, and a seamless communication platform. Our advanced verification system ensures that every agent on our platform is legitimate, and every property listing is authentic.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              We're proud to be building the future of real estate in Nigeria, one verified property at a time.
            </p>
          </div>

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>5,000+</div>
              <div style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Properties Listed</div>
            </div>
            <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>500+</div>
              <div style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Verified Agents</div>
            </div>
            <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>25+</div>
              <div style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Cities Covered</div>
            </div>
            <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>10,000+</div>
              <div style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Happy Users</div>
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
