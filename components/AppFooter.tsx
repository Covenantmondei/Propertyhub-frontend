'use client';

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
    <footer className="footer">
      <div className="container">
        <div className="footer-actions">
          {user && (
            <span id="footer-user-info" className="text-muted">
              {user.username || user.email}
            </span>
          )}
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </footer>
  );
}
