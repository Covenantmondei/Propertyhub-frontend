'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AppNavProps {
  activePage?: string;
}

export default function AppNav({ activePage }: AppNavProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [messagesBadge, setMessagesBadge] = useState(0);

  useEffect(() => {
    // Load theme
    const theme = localStorage.getItem('theme') || 'light';
    const dark = theme === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);

    // Load user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch {}
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const handleProfileClick = () => {
    if (userRole === 'agent') {
      window.location.href = '/agent-profile';
    } else if (userRole === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/home';
    }
  };

  const isActive = (path: string) => pathname === path || activePage === path.replace('/', '');

  const isAgent = userRole === 'agent';

  return (
    <header>
      <div className="header-container">
        <div className="flex items-center gap-6">
          <Link href="/home" className="logo">PropertyHub</Link>
          <nav>
            <ul className="nav-menu desktop">
              <li><Link href="/home" className={`nav-link${isActive('/home') ? ' active' : ''}`}>Home</Link></li>
              <li><Link href="/properties" className={`nav-link${isActive('/properties') ? ' active' : ''}`}>Properties</Link></li>
              <li><Link href="/favorites" className={`nav-link${isActive('/favorites') ? ' active' : ''}`}>Favorites</Link></li>
              <li><Link href="/visits" className={`nav-link${isActive('/visits') ? ' active' : ''}`}>Visits</Link></li>
              {isAgent && (
                <>
                  <li><Link href="/agent-dashboard" className={`nav-link${isActive('/agent-dashboard') ? ' active' : ''}`}>Dashboard</Link></li>
                  <li><Link href="/new-property" className={`nav-link${isActive('/new-property') ? ' active' : ''}`}>+ List Property</Link></li>
                  <li><Link href="/kyc-verification" className={`nav-link${isActive('/kyc-verification') ? ' active' : ''}`}>KYC Verification</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>

        <div className="header-actions">
          {/* Theme Toggle */}
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? (
              <svg className="icon moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="icon sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            )}
          </button>

          {/* Messages */}
          <Link href="/chat" className="btn btn-icon btn-ghost" title="Messages" style={{ position: 'relative' }}>
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {messagesBadge > 0 && (
              <span className="notification-badge" style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', borderRadius: '10px', fontSize: '0.7rem', padding: '1px 5px' }}>
                {messagesBadge}
              </span>
            )}
          </Link>

          {/* Profile */}
          <button className="btn btn-icon btn-ghost" onClick={handleProfileClick} title="Profile">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-icon btn-ghost mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="icon menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ display: 'block' }}>
          <nav className="grid gap-2" style={{ display: 'grid', gap: '0.5rem', padding: '1rem' }}>
            <Link href="/home" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/properties" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Properties</Link>
            <Link href="/favorites" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Favorites</Link>
            <Link href="/visits" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Visits</Link>
            <Link href="/chat" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Messages</Link>
            {isAgent && (
              <>
                <Link href="/agent-dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/new-property" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>+ List Property</Link>
                <Link href="/kyc-verification" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>KYC Verification</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
