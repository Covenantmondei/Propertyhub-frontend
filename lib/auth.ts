import { apiCall, API_BASE_URL } from './api';

export interface User {
  username?: string;
  email?: string;
  role?: 'buyer' | 'agent' | 'admin';
  name?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export const getStoredUser = getUser;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('lastUnreadMessages');
  sessionStorage.clear();
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
  }

  clearAuth();
  window.location.href = '/login';
}

// Make logout globally accessible
if (typeof window !== 'undefined') {
  (window as any).logout = logout;
}
