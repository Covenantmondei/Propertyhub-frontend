'use client';

import { useState } from 'react';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      category: 'General',
      items: [
        {
          q: 'What is PropertyHub?',
          a: 'PropertyHub is Nigeria\'s premier digital real estate platform connecting property seekers, buyers, and renters with verified real estate agents and authentic property listings.',
        },
        {
          q: 'Is PropertyHub free to use for buyers?',
          a: 'Yes, searching for properties, bookmarking favorites, contacting agents, and scheduling visits is completely free for buyers.',
        },
        {
          q: 'How does PropertyHub ensure safety against real estate fraud?',
          a: 'We implement mandatory identity verification (KYC) for all agents and an admin approval workflow for all listed properties before they are made public.',
        },
      ],
    },
    {
      category: 'For Agents & Landlords',
      items: [
        {
          q: 'How do I become a verified agent?',
          a: 'Register an account as an Agent, navigate to the KYC Verification section in your dashboard, and upload your Government ID and a selfie holding the ID. Our admin team reviews and approves submissions within 24-48 hours.',
        },
        {
          q: 'How many properties can I list?',
          a: 'Verified agents can list unlimited properties with multi-image galleries, detailed amenities, and pricing structures.',
        },
        {
          q: 'How do I manage inquiries and visit bookings?',
          a: 'You can use the built-in real-time Chat system to converse with buyers and the Visits manager to accept, reschedule, or manage property viewing requests.',
        },
      ],
    },
    {
      category: 'Properties & Visits',
      items: [
        {
          q: 'How do I schedule a property viewing?',
          a: 'Click on any property card to view its details, then click "Schedule Visit". Select your preferred date, time, and optional notes to submit your request directly to the listing agent.',
        },
        {
          q: 'Can I cancel or reschedule a visit?',
          a: 'Yes, navigate to your Visits dashboard where you can view all upcoming visits and cancel or reschedule them with one click.',
        },
      ],
    },
  ];

  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Frequently Asked Questions
            </h1>
            <p className="page-subtitle" style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)' }}>
              Find quick answers to common questions about using PropertyHub.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {faqs.map((cat, catIdx) => (
              <div key={catIdx}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                  {cat.category}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cat.items.map((item, itemIdx) => {
                    const idx = catIdx * 100 + itemIdx;
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={itemIdx}
                        style={{
                          background: 'var(--card)',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            padding: '1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--foreground)',
                          }}
                        >
                          <span>{item.q}</span>
                          <span style={{ fontSize: '1.25rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            ▼
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
