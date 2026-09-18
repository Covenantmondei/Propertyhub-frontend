'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { logout } from '@/lib/auth';

interface AppNavProps {
  activePage?: string;
}

export default function AppNav({ activePage }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username?: string; role?: string; email?: string } | null>(null);
  const [messagesBadge, setMessagesBadge] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync theme with DOM and localStorage
    const isDocDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : isDocDark;

    setIsDark(shouldBeDark);
    if (typeof document !== 'undefined') {
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Load user
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      } catch {}
    }
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextDark = !isCurrentlyDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isActive = (path: string) => pathname === path || activePage === path.replace('/', '');
  const isAgent = user?.role === 'agent';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="header-line"></div>
      <nav className="nav-container" style={{ padding: '0.5rem 1rem' }}>
        <div
          className="nav-content"
          style={{
            maxWidth: '880px',
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            padding: '0.4rem 0.85rem 0.4rem 1.25rem',
            gap: '0.75rem',
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/home"
            className="logo"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              whiteSpace: 'nowrap',
            }}
          >
            PropertyHub
          </Link>

          {/* Desktop Navigation Links */}
          <ul
            className="nav-links desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              listStyle: 'none',
              gap: '1.25rem',
              margin: 0,
              padding: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <li>
              <Link
                href="/home"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive('/home') ? 600 : 500,
                  color: isActive('/home') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  transition: 'color 0.15s ease',
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/properties"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive('/properties') ? 600 : 500,
                  color: isActive('/properties') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  transition: 'color 0.15s ease',
                }}
              >
                Properties
              </Link>
            </li>
            <li>
              <Link
                href="/favorites"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive('/favorites') ? 600 : 500,
                  color: isActive('/favorites') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  transition: 'color 0.15s ease',
                }}
              >
                Favorites
              </Link>
            </li>
            <li>
              <Link
                href="/visits"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive('/visits') ? 600 : 500,
                  color: isActive('/visits') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  transition: 'color 0.15s ease',
                }}
              >
                Visits
              </Link>
            </li>
            {isAgent && (
              <li>
                <Link
                  href="/agent-dashboard"
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive('/agent-dashboard') ? 600 : 500,
                    color: isActive('/agent-dashboard') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    transition: 'color 0.15s ease',
                  }}
                >
                  Dashboard
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive('/admin') ? 600 : 500,
                    color: isActive('/admin') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    transition: 'color 0.15s ease',
                  }}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Desktop Action Cluster (Theme, Messages, User Profile) */}
          <div
            className="desktop-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: isDark ? 'hsl(var(--muted))' : 'transparent',
                border: '1px solid hsl(var(--border))',
                cursor: 'pointer',
                color: isDark ? '#fbbf24' : 'hsl(var(--muted-foreground))',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                e.currentTarget.style.color = isDark ? '#f59e0b' : 'hsl(var(--foreground))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--border))';
                e.currentTarget.style.color = isDark ? '#fbbf24' : 'hsl(var(--muted-foreground))';
              }}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Messages Icon */}
            <Link
              href="/chat"
              title="Messages"
              style={{
                position: 'relative',
                color: isActive('/chat') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                padding: '0.35rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = isActive('/chat') ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))')
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {messagesBadge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    padding: '1px 4px',
                    lineHeight: 1,
                  }}
                >
                  {messagesBadge}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className={`dropdown ${profileDropdownOpen ? 'active' : ''}`} ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                className="btn-secondary dropdown-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {user?.username ? user.username.charAt(0) : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username || 'Account'}
                </span>
                <svg className="dropdown-icon" width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="dropdown-menu" style={{ right: 0, minWidth: '240px' }}>
                <div
                  className="dropdown-section"
                  style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>
                    {user?.username || 'User'}
                  </div>
                  {user?.email && (
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                      {user.email}
                    </div>
                  )}
                  {user?.role && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        fontSize: '0.6875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: 'hsl(var(--muted))',
                        color: 'hsl(var(--foreground))',
                        fontWeight: 600,
                      }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>

                <div className="dropdown-section">
                  {isAgent && (
                    <>
                      <Link href="/agent-dashboard" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                        <div className="dropdown-item-title">Agent Dashboard</div>
                      </Link>
                      <Link href="/agent-profile" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                        <div className="dropdown-item-title">Agent Profile</div>
                      </Link>
                      <Link href="/new-property" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                        <div className="dropdown-item-title">List New Property</div>
                      </Link>
                      <Link href="/kyc-verification" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                        <div className="dropdown-item-title">KYC Verification</div>
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                      <div className="dropdown-item-title">Admin Console</div>
                    </Link>
                  )}
                  <Link href="/favorites" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <div className="dropdown-item-title">Saved Favorites</div>
                  </Link>
                  <Link href="/visits" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <div className="dropdown-item-title">Scheduled Visits</div>
                  </Link>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section">
                  <button
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      await logout();
                    }}
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="dropdown-item-title" style={{ color: '#ef4444' }}>
                      Sign Out
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Hamburger Toggle (Visible ONLY when screen <= 900px) */}
          <button
            className="mobile-hamburger-btn"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'hsl(var(--foreground))',
              cursor: 'pointer',
              padding: '0.35rem',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isMobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Full Collapsible Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: '1rem',
            right: '1rem',
            maxWidth: '540px',
            margin: '0 auto',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '20px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
            padding: '1.25rem',
            zIndex: 1000,
            animation: 'slideInDown 0.25s ease',
          }}
        >
          {/* User Header Profile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid hsl(var(--border))',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {user?.username ? user.username.charAt(0) : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'hsl(var(--foreground))' }}>
                {user?.username || 'User'}
              </div>
              {user?.email && (
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              )}
            </div>
            {user?.role && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--foreground))',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {user.role}
              </span>
            )}
          </div>

          {/* Quick Actions Row: Theme Toggle & Messages */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '12px',
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isDark ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fbbf24' }}>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                  </svg>
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            {/* Messages Button */}
            <Link
              href="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '12px',
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Messages</span>
              {messagesBadge > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                  }}
                >
                  {messagesBadge}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
            <Link
              href="/home"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: isActive('/home') ? 600 : 500,
                background: isActive('/home') ? 'hsl(var(--muted))' : 'transparent',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </Link>
            <Link
              href="/properties"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: isActive('/properties') ? 600 : 500,
                background: isActive('/properties') ? 'hsl(var(--muted))' : 'transparent',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>Browse Properties</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: isActive('/favorites') ? 600 : 500,
                background: isActive('/favorites') ? 'hsl(var(--muted))' : 'transparent',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>Saved Favorites</span>
            </Link>
            <Link
              href="/visits"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: isActive('/visits') ? 600 : 500,
                background: isActive('/visits') ? 'hsl(var(--muted))' : 'transparent',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <span>Scheduled Visits</span>
            </Link>

            {isAgent && (
              <>
                <Link
                  href="/agent-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: isActive('/agent-dashboard') ? 600 : 500,
                    background: isActive('/agent-dashboard') ? 'hsl(var(--muted))' : 'transparent',
                    color: 'hsl(var(--foreground))',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  <span>Agent Dashboard</span>
                </Link>
                <Link
                  href="/new-property"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: isActive('/new-property') ? 600 : 500,
                    background: isActive('/new-property') ? 'hsl(var(--muted))' : 'transparent',
                    color: 'hsl(var(--foreground))',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>List New Property</span>
                </Link>
                <Link
                  href="/kyc-verification"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: isActive('/kyc-verification') ? 600 : 500,
                    background: isActive('/kyc-verification') ? 'hsl(var(--muted))' : 'transparent',
                    color: 'hsl(var(--foreground))',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>KYC Verification</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: isActive('/admin') ? 600 : 500,
                  background: isActive('/admin') ? 'hsl(var(--muted))' : 'transparent',
                  color: 'hsl(var(--foreground))',
                  textDecoration: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Sign Out Button */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border))' }}>
            <button
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await logout();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Responsive Breakpoint Styles */}
      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-nav,
          .desktop-actions {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .desktop-nav,
          .desktop-actions {
            display: flex !important;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
