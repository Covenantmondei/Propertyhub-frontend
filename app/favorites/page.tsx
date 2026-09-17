'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    loadFavorites();
  }, [router]);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await apiCall('/properties/favorites/me');
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data?.favorites && Array.isArray(data.favorites)) {
        list = data.favorites;
      }
      setFavorites(list);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiCall(`/properties/${id}/unfavorite`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {}
  }

  return (
    <>
      <AppNav activePage="favorites" />

      <div className="page-wrapper landing-body" style={{ overflow: 'hidden', minHeight: '100vh' }}>
        {/* Left vertical guideline */}
        <div className="vertical-line left"></div>

        {/* Right vertical guideline */}
        <div className="vertical-line right"></div>

        <main style={{ position: 'relative', zIndex: 2, paddingTop: '7.5rem', paddingBottom: '5rem' }}>
          <div className="container">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: 'hsl(var(--foreground))',
                  marginBottom: '0.75rem',
                }}
              >
                Saved Properties
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '1.0625rem',
                  maxWidth: '540px',
                  margin: '0 auto',
                }}
              >
                Your personal collection of bookmarked homes, lands, and apartments.
              </p>
            </div>

            {/* Content / States */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem' }}>
                  Loading saved properties...
                </p>
              </div>
            ) : !Array.isArray(favorites) || favorites.length === 0 ? (
              <div
                style={{
                  maxWidth: '520px',
                  margin: '0 auto',
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                  No saved properties yet
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
                  Click the heart icon on any property while browsing to bookmark it here for quick access.
                </p>
                <Link
                  href="/properties"
                  className="btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.65rem 1.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
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
                {favorites.map((property) => {
                  const imageUrl =
                    property.primary_image ||
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                  const pType = property.property_type
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

                        {/* Remove from Favorite Button */}
                        <button
                          onClick={(e) => removeFavorite(property.id, e)}
                          title="Remove from favorites"
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
                            color: '#ef4444',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
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

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'hsl(var(--muted-foreground))',
                            fontSize: '0.875rem',
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
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <AppFooter />
      </div>
    </>
  );
}
