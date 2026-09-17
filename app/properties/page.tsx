'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  primary_image?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUserRole(JSON.parse(userStr).role); } catch {}
    }
    loadFavorites();
    loadProperties();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filterProperties(), 400);
  }, [search, type, properties]);

  async function loadFavorites() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const favs = await apiCall('/properties/favorites/me');
      setFavorites(favs.map((f: any) => f.id));
    } catch {}
  }

  async function loadProperties() {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/properties/all?limit=50');
      setProperties(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  function filterProperties() {
    const s = search.toLowerCase();
    setFiltered(properties.filter(p => {
      const matchSearch = !s || p.title.toLowerCase().includes(s) || p.city.toLowerCase().includes(s) || p.state.toLowerCase().includes(s);
      const matchType = !type || p.property_type === type;
      return matchSearch && matchType;
    }));
  }

  async function toggleFavorite(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) { router.push('/login'); return; }
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await apiCall(`/properties/${id}/unfavorite`, { method: 'DELETE' });
        setFavorites(prev => prev.filter(f => f !== id));
      } else {
        await apiCall(`/properties/${id}/favorite`, { method: 'POST' });
        setFavorites(prev => [...prev, id]);
      }
    } catch (err: any) {
      console.error('Favorite toggle failed:', err);
    }
  }

  const isAgent = userRole === 'agent';

  return (
    <>
      <AppNav />
      <main className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Properties</h1>
              <p className="text-muted">Browse through our available properties</p>
            </div>
            <div className="flex gap-3">
              {!isAgent && (
                <button id="smart-match-btn" className="btn btn-outline">
                  <svg className="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8a3 3 0 0 0-3 3"/>
                  </svg>
                  Smart Match
                </button>
              )}
              {isAgent && (
                <a href="/new-property" className="btn btn-primary desktop-only">
                  <svg className="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Property
                </a>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="card-content p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="search" className="form-label">Search</label>
                  <input
                    type="text" id="search" className="form-input"
                    placeholder="Search by city, state, or title..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type" className="form-label">Property Type</label>
                  <select id="type" className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading && (
            <div className="loading-message"><p>Loading properties...</p></div>
          )}
          {error && (
            <div className="error-message">
              <p>Unable to load properties</p>
              <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginTop: '0.5rem' }}>{error}</p>
              <button onClick={loadProperties} className="btn btn-primary" style={{ marginTop: '1rem' }}>Try Again</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <p className="no-properties">No properties found</p>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="properties-grid" id="properties-container">
              {filtered.map(property => {
                const imageUrl = property.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
                const isFav = favorites.includes(property.id);
                const pType = property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1);
                return (
                  <div key={property.id} className="property-card">
                    <div className="property-card-image" onClick={() => router.push(`/property?id=${property.id}`)} style={{ cursor: 'pointer' }}>
                      <img src={imageUrl} alt={property.title} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'; }} />
                      {!!localStorage.getItem('authToken') && (
                        <button className={`favorite-btn${isFav ? ' active' : ''}`} onClick={e => toggleFavorite(property.id, e)} title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                          <svg className="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="property-card-content" onClick={() => router.push(`/property?id=${property.id}`)} style={{ cursor: 'pointer' }}>
                      <h3>{property.title}</h3>
                      <p className="price">{formatCurrency(property.price)}</p>
                      <p className="location">{property.city}, {property.state}</p>
                      <div className="property-details">
                        {property.bedrooms ? <span>{property.bedrooms} bed</span> : null}
                        {property.bathrooms ? <span>{property.bathrooms} bath</span> : null}
                        {property.area_sqft ? <span>{formatNumber(property.area_sqft)} sqft</span> : null}
                      </div>
                      <span className="type">{pType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Smart Match Button (Mobile) */}
      {!isAgent && (
        <button className="floating-action-btn" id="floating-smart-match" aria-label="Smart Match">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8a3 3 0 0 0-3 3"/>
          </svg>
        </button>
      )}
      <AppFooter />
    </>
  );
}
