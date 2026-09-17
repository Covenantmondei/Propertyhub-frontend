'use client';

import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function BlogPage() {
  const articles = [
    {
      title: 'Top 5 Real Estate Investment Opportunities in Lagos for 2026',
      date: 'September 10, 2026',
      category: 'Market Trends',
      summary: 'Explore high-yield residential and commercial property hotspots across Lekki, Epe, and Ikeja.',
      readTime: '5 min read',
      image: 'https://i.pinimg.com/1200x/77/7a/6f/777a6fb95e0bcf8d28c63bf4029fa734.jpg',
    },
    {
      title: 'The First-Time Homebuyer\'s Complete Guide to Due Diligence',
      date: 'August 28, 2026',
      category: 'Buyer Guide',
      summary: 'Essential title verification steps, governor\'s consent checks, and how to avoid land grab scams.',
      readTime: '8 min read',
      image: 'https://i.pinimg.com/736x/b1/d2/4f/b1d24f5de0a156ec765aa6326e410904.jpg',
    },
    {
      title: 'How Verified Agent Badges Are Revolutionizing Property Trust',
      date: 'August 14, 2026',
      category: 'Platform News',
      summary: 'Learn how PropertyHub\'s rigorous KYC and admin verification protect buyers and boost agent sales.',
      readTime: '4 min read',
      image: 'https://i.pinimg.com/1200x/76/67/7b/76677b46833363288bc7a075456a1cab.jpg',
    },
  ];

  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              PropertyHub Insights & Blog
            </h1>
            <p className="page-subtitle" style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)' }}>
              Expert guides, real estate market trends, and platform news.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {articles.map((art, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={art.image}
                    alt={art.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>{art.category}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{art.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {art.title}
                  </h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                    {art.summary}
                  </p>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{art.date}</div>
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
