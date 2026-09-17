'use client';

import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function TestimonialsPage() {
  const reviews = [
    {
      name: 'Adaeze Okonkwo',
      role: 'First-time Homebuyer',
      location: 'Lekki, Lagos',
      rating: 5,
      comment: 'Found my dream home in just two weeks! The verified listings and direct agent communication made the entire process smooth and stress-free.',
      avatar: 'AO',
    },
    {
      name: 'Chukwudi Nwosu',
      role: 'Certified Real Estate Agent',
      location: 'Maitama, Abuja',
      rating: 5,
      comment: 'As an agent, PropertyHub has transformed my business. I’ve closed more deals in 3 months than I did all last year. The platform verification gives buyers absolute trust.',
      avatar: 'CN',
    },
    {
      name: 'Oluwaseun Balogun',
      role: 'Property Investor',
      location: 'GRA, Port Harcourt',
      rating: 5,
      comment: 'Listed my property and got serious inquiries within 24 hours. The admin verification gives buyers confidence, and the dashboard is incredibly easy to use.',
      avatar: 'OB',
    },
    {
      name: 'Fatima Ibrahim',
      role: 'Tenant / Renter',
      location: 'Ikeja, Lagos',
      rating: 5,
      comment: 'The visit scheduling system is fantastic. No back-and-forth phone calls with unreachable middlemen. Everything happens transparently on PropertyHub.',
      avatar: 'FI',
    },
  ];

  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              What Our Users Say
            </h1>
            <p className="page-subtitle" style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)' }}>
              Real stories from verified buyers, renters, and top property agents across Nigeria.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '1rem' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p style={{ fontStyle: 'italic', color: 'var(--foreground)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    "{rev.comment}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #37322F, #5A524C)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{rev.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                      {rev.role} • {rev.location}
                    </p>
                  </div>
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
