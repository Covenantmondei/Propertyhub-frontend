'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Property {
  id: number;
  title: string;
  price: number;
  city: string;
  state: string;
  property_type: string;
  primary_image?: string;
  is_available?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    city: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
  });
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }

    // Apply saved theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');

    loadFavorites();
    loadFeaturedProperties();
  }, [router]);

  async function loadFavorites() {
    try {
      const favs = await apiCall('/properties/favorites/me');
      if (Array.isArray(favs)) {
        setFavorites(favs.map((f: any) => f.id));
      } else if (favs?.data && Array.isArray(favs.data)) {
        setFavorites(favs.data.map((f: any) => f.id));
      }
    } catch {}
  }

  async function loadFeaturedProperties() {
    setLoading(true);
    try {
      const data = await apiCall('/properties/all?limit=6');
      if (Array.isArray(data)) {
        setFeaturedProperties(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setFeaturedProperties(data.data);
      } else {
        setFeaturedProperties([]);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await apiCall(`/properties/${id}/unfavorite`, { method: 'DELETE' });
        setFavorites((prev) => prev.filter((f) => f !== id));
      } else {
        await apiCall(`/properties/${id}/favorite`, { method: 'POST' });
        setFavorites((prev) => [...prev, id]);
      }
    } catch {}
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <>
      <AppNav activePage="home" />

      <div className="page-wrapper landing-body" style={{ overflow: 'hidden' }}>
        {/* Left vertical guideline */}
        <div className="vertical-line left"></div>

        {/* Right vertical guideline */}
        <div className="vertical-line right"></div>

        <main style={{ position: 'relative', zIndex: 2 }}>
          {/* Hero Section */}
          <section
            style={{
              paddingTop: '8rem',
              paddingBottom: '3.5rem',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div className="container">
              {/* Welcome Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  background: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.875rem',
                  color: 'hsl(var(--foreground))',
                  marginBottom: '1.5rem',
                  fontWeight: 500,
                }}
              >
                <span>✨ Welcome back{user?.username ? `, ${user.username}` : ''}</span>
              </div>

              {/* Editorial Serif Heading */}
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  color: 'hsl(var(--foreground))',
                }}
              >
                Find Your Next Property in Nigeria
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '1.125rem',
                  maxWidth: '620px',
                  margin: '0 auto 2.25rem auto',
                  lineHeight: 1.6,
                }}
              >
                Discover verified listings, manage your saved favorites, schedule viewings, and connect directly with trusted agents.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '2rem',
                }}
              >
                <Link
                  href="/properties"
                  className="btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.75rem 2rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  Browse Properties
                </Link>

                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="btn-secondary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.75rem 1.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {showSearch ? 'Hide Search Filters' : 'Filter & Search'}
                </button>

                {user?.role === 'agent' && (
                  <Link
                    href="/new-property"
                    className="btn-secondary"
                    style={{
                      borderRadius: '9999px',
                      padding: '0.75rem 1.75rem',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    + List Property
                  </Link>
                )}
              </div>

              {/* Expandable Filter / Search Panel */}
              {showSearch && (
                <div
                  style={{
                    maxWidth: '840px',
                    margin: '0 auto 2.5rem auto',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <form onSubmit={handleSearch}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.25rem',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lagos, Abuja"
                          value={searchParams.city}
                          onChange={(e) => setSearchParams((p) => ({ ...p, city: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                          Type
                        </label>
                        <select
                          value={searchParams.property_type}
                          onChange={(e) => setSearchParams((p) => ({ ...p, property_type: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            fontSize: '0.875rem',
                          }}
                        >
                          <option value="">Any Type</option>
                          <option value="house">House</option>
                          <option value="apartment">Apartment</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="land">Land</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                          Min Price (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={searchParams.min_price}
                          onChange={(e) => setSearchParams((p) => ({ ...p, min_price: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                          Max Price (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="No limit"
                          value={searchParams.max_price}
                          onChange={(e) => setSearchParams((p) => ({ ...p, max_price: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                          Bedrooms
                        </label>
                        <input
                          type="number"
                          placeholder="Any"
                          min="0"
                          value={searchParams.bedrooms}
                          onChange={(e) => setSearchParams((p) => ({ ...p, bedrooms: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setSearchParams({ city: '', property_type: '', min_price: '', max_price: '', bedrooms: '' })}
                        className="btn-secondary"
                        style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          borderRadius: '9999px',
                          padding: '0.5rem 1.5rem',
                          fontSize: '0.875rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Apply Filters
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions Grid Section */}
          <section style={{ padding: '1rem 0 3.5rem 0' }}>
            <div className="container">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Browse Properties Card */}
                <Link
                  href="/properties"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'hsl(var(--muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Browse Listings</h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      Discover thousands of verified properties
                    </p>
                  </div>
                </Link>

                {/* My Favorites Card */}
                <Link
                  href="/favorites"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'hsl(var(--muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Saved Favorites</h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      View and compare bookmarked properties
                    </p>
                  </div>
                </Link>

                {/* My Visits Card */}
                <Link
                  href="/visits"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'hsl(var(--muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Scheduled Visits</h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      Manage upcoming on-site viewings
                    </p>
                  </div>
                </Link>

                {/* Messages Card */}
                <Link
                  href="/chat"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'hsl(var(--muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Direct Messages</h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                      Chat instantly with verified agents
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Properties Section */}
          <section style={{ padding: '2rem 0 5rem 0' }}>
            <div className="container">
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: '2rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                      fontWeight: 400,
                      color: 'hsl(var(--foreground))',
                      margin: '0 0 0.35rem 0',
                    }}
                  >
                    Featured Properties
                  </h2>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', margin: 0 }}>
                    Handpicked verified listings available now across Nigeria
                  </p>
                </div>

                <Link
                  href="/properties"
                  className="btn-secondary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  View All Properties
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>

              {/* Properties Grid / Loader */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem' }}>
                    Loading featured properties...
                  </p>
                </div>
              ) : featuredProperties.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'hsl(var(--card))',
                    borderRadius: '16px',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem', margin: '0 0 1rem 0' }}>
                    No properties currently available.
                  </p>
                  <Link
                    href="/properties"
                    className="btn-primary"
                    style={{ borderRadius: '9999px', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    Explore Marketplace
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '1.75rem',
                  }}
                >
                  {featuredProperties.map((property) => {
                    const imageUrl =
                      property.primary_image ||
                      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                    const isFav = favorites.includes(property.id);
                    const pType =
                      property.property_type
                        ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
                        : 'Property';

                    return (
                      <Link
                        key={property.id}
                        href={`/property?id=${property.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.08)';
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1)';
                        }}
                      >
                        {/* Image Container */}
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/10',
                            overflow: 'hidden',
                            backgroundColor: 'hsl(var(--muted))',
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={property.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s ease',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                            }}
                          />

                          {/* Status Badge */}
                          <span
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: property.is_available !== false ? 'rgba(16, 185, 129, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                              color: 'white',
                              backdropFilter: 'blur(6px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            {property.is_available !== false ? 'Available' : 'Unavailable'}
                          </span>

                          {/* Favorite Button */}
                          <button
                            onClick={(e) => toggleFavorite(property.id, e)}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(6px)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: isFav ? '#ef4444' : '#6b7280',
                              transition: 'transform 0.2s ease, color 0.2s ease',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>

                        {/* Card Content */}
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {/* Property Type Badge */}
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.6875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                background: 'hsl(var(--muted))',
                                color: 'hsl(var(--foreground))',
                                fontWeight: 600,
                              }}
                            >
                              {pType}
                            </span>
                          </div>

                          {/* Property Title */}
                          <h3
                            style={{
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              margin: '0 0 0.5rem 0',
                              color: 'hsl(var(--foreground))',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {property.title}
                          </h3>

                          {/* Price */}
                          <div
                            style={{
                              fontSize: '1.35rem',
                              fontWeight: 700,
                              color: 'hsl(var(--primary))',
                              marginBottom: '0.5rem',
                            }}
                          >
                            {formatCurrency(property.price)}
                          </div>

                          {/* Location */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'hsl(var(--muted-foreground))',
                              fontSize: '0.875rem',
                              marginBottom: '1rem',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>
                              {property.city}, {property.state}
                            </span>
                          </div>

                          {/* Meta attributes (Beds, Baths, Sqft) */}
                          {(property.bedrooms || property.bathrooms || property.area_sqft) && (
                            <div
                              style={{
                                marginTop: 'auto',
                                paddingTop: '0.85rem',
                                borderTop: '1px solid hsl(var(--border))',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                fontSize: '0.8125rem',
                                color: 'hsl(var(--muted-foreground))',
                              }}
                            >
                              {property.bedrooms && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  🛏️ {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
                                </span>
                              )}
                              {property.bathrooms && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  🚿 {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
                                </span>
                              )}
                              {property.area_sqft && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  📐 {property.area_sqft.toLocaleString()} sqft
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        <AppFooter />
      </div>
    </>
  );
}
