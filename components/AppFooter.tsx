'use client';

import Link from 'next/link';
import { logout } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function AppFooter() {
  const [user, setUser] = useState<{ username?: string; email?: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <footer
      style={{
        borderTop: '1px solid hsl(var(--border))',
        padding: '3rem 0 2rem 0',
        background: 'hsl(var(--background))',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          <div>
            <Link
              href="/home"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
              }}
            >
              PropertyHub
            </Link>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
              Nigeria's premier verified real estate marketplace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/properties" style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>
              Properties
            </Link>
            <Link href="/favorites" style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>
              Favorites
            </Link>
            <Link href="/visits" style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>
              Visits
            </Link>
            <Link href="/terms" style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>
              Privacy
            </Link>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
            fontSize: '0.8125rem',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          <div>&copy; {new Date().getFullYear()} PropertyHub. All rights reserved.</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <span>
                Signed in as <strong>{user.username || user.email}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
