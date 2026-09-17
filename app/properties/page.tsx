'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

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

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserRole(JSON.parse(userStr).role);
      } catch {}
    }
    loadFavorites();
    loadProperties();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filterProperties(), 300);
  }, [search, type, properties]);

  async function loadFavorites() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const favs = await apiCall('/properties/favorites/me');
      let list: any[] = [];
      if (Array.isArray(favs)) {
        list = favs;
      } else if (favs?.data && Array.isArray(favs.data)) {
        list = favs.data;
      }
      setFavorites(list.map((f: any) => f.id));
    } catch {}
  }

  async function loadProperties() {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/properties/all?limit=50');
      let list: Property[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data?.properties && Array.isArray(data.properties)) {
        list = data.properties;
      }
      setProperties(list);
      setFiltered(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
      setProperties([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  function filterProperties() {
    const s = search.toLowerCase();
    const safeProps = Array.isArray(properties) ? properties : [];
    setFiltered(
      safeProps.filter((p) => {
        const matchSearch =
          !s ||
          (p.title || '').toLowerCase().includes(s) ||
          (p.city || '').toLowerCase().includes(s) ||
          (p.state || '').toLowerCase().includes(s);
        const matchType = !type || p.property_type === type;
        return matchSearch && matchType;
      })
    );
  }

  async function toggleFavorite(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await apiCall(`/properties/${id}/unfavorite`, { method: 'DELETE' });
        setFavorites((prev) => prev.filter((f) => f !== id));
      } else {
        await apiCall(`/properties/${id}/favorite`, { method: 'POST' });
        setFavorites((prev) => [...prev, id]);
      }
    } catch (err: any) {
      console.error('Favorite toggle failed:', err);
    }
  }

  const isAgent = userRole === 'agent';

  return (
    <>
      <AppNav activePage="properties" />

      <div className="page-wrapper landing-body" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <div className="vertical-line left"></div>
        <div className="vertical-line right"></div>

        <main style={{ position: 'relative', zIndex: 2, paddingTop: '7.5rem', paddingBottom: '5rem' }}>
          <div className="container">
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    color: 'hsl(var(--foreground))',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Explore Properties
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem', margin: 0 }}>
                  Discover verified houses, apartments, lands, and commercial real estate.
                </p>
              </div>

              {isAgent && (
                <Link
                  href="/new-property"
                  className="btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Listing
                </Link>
              )}
            </div>

            {/* Filter Bar */}
            <div
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                    Search Keyword
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      padding: '0.55rem 0.85rem',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by city, state, or title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.875rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem' }}>
                    Property Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Grid / Loader */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem' }}>Loading properties...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  background: 'hsl(var(--card))',
                  borderRadius: '16px',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <p style={{ color: '#ef4444', fontSize: '1rem', marginBottom: '1rem' }}>{error}</p>
                <button onClick={loadProperties} className="btn-primary" style={{ borderRadius: '9999px', padding: '0.6rem 1.5rem' }}>
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(filtered) || filtered.length === 0 ? (
              <div
                style={{
                  maxWidth: '520px',
                  margin: '0 auto',
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  background: 'hsl(var(--card))',
                  borderRadius: '20px',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No properties found</h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                  Try adjusting your search criteria or clear filters to see all listings.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setType('');
                  }}
                  className="btn-secondary"
                  style={{ borderRadius: '9999px', padding: '0.55rem 1.5rem', fontSize: '0.875rem' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {filtered.map((property) => {
                  const imageUrl =
                    property.primary_image ||
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                  const isFav = favorites.includes(property.id);
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
                            transition: 'transform 0.2s ease',
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
                            {property.bedrooms && <span>🛏️ {property.bedrooms} bed</span>}
                            {property.bathrooms && <span>🚿 {property.bathrooms} bath</span>}
                            {property.area_sqft && <span>📐 {formatNumber(property.area_sqft)} sqft</span>}
                          </div>
                        )}
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
