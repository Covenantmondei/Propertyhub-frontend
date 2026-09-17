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
  const [searchParams, setSearchParams] = useState({ city: '', property_type: '', min_price: '', max_price: '', bedrooms: '' });
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) { try { setUser(JSON.parse(userStr)); } catch {} }

    // Apply saved theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');

    loadFavorites();
    loadFeaturedProperties();
  }, [router]);

  async function loadFavorites() {
    try {
      const favs = await apiCall('/properties/favorites/me');
      setFavorites(favs.map((f: any) => f.id));
    } catch {}
  }

  async function loadFeaturedProperties() {
    setLoading(true);
    try {
      const data = await apiCall('/properties/all?limit=6');
      setFeaturedProperties(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
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
        setFavorites(prev => prev.filter(f => f !== id));
      } else {
        await apiCall(`/properties/${id}/favorite`, { method: 'POST' });
        setFavorites(prev => [...prev, id]);
      }
    } catch {}
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <>
      <AppNav />
      <main className="home-main">
        {/* Hero / Welcome Section */}
        <section className="home-hero">
          <div className="container">
            <div className="home-welcome">
              <h1>Welcome back{user?.username ? `, ${user.username}` : ''}! 👋</h1>
              <p className="text-muted">Find your next dream property or manage your listings</p>
            </div>

            {/* Search Toggle */}
            <div className="search-section">
              <button
                className="btn btn-outline"
                id="search-toggle-btn"
                onClick={() => setShowSearch(!showSearch)}
              >
                <svg className="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                {showSearch ? 'Hide Search' : 'Search Properties'}
              </button>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="search-bar-container" id="search-bar-container">
                <form className="header-search-form" id="header-search-form" onSubmit={handleSearch}>
                  <div className="search-inputs">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input type="text" className="form-input" placeholder="City..." value={searchParams.city} onChange={e => setSearchParams(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Property Type</label>
                      <select className="form-select" value={searchParams.property_type} onChange={e => setSearchParams(p => ({ ...p, property_type: e.target.value }))}>
                        <option value="">Any</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Min Price</label>
                      <input type="number" className="form-input" placeholder="0" value={searchParams.min_price} onChange={e => setSearchParams(p => ({ ...p, min_price: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Price</label>
                      <input type="number" className="form-input" placeholder="No limit" value={searchParams.max_price} onChange={e => setSearchParams(p => ({ ...p, max_price: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bedrooms</label>
                      <input type="number" className="form-input" placeholder="Any" min="0" value={searchParams.bedrooms} onChange={e => setSearchParams(p => ({ ...p, bedrooms: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary search-submit-btn">
                    <svg className="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    Search
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <div className="container">
            <div className="quick-actions-grid">
              <Link href="/properties" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h3>Browse Properties</h3>
                <p>Discover thousands of listings</p>
              </Link>
              <Link href="/favorites" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3>My Favorites</h3>
                <p>View saved properties</p>
              </Link>
              <Link href="/visits" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3>My Visits</h3>
                <p>Scheduled property visits</p>
              </Link>
              <Link href="/chat" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>Messages</h3>
                <p>Chat with agents</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Properties</h2>
              <Link href="/properties" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {loading ? (
              <div className="loading-message"><p>Loading properties...</p></div>
            ) : featuredProperties.length === 0 ? (
              <p className="text-center text-muted">No properties available.</p>
            ) : (
              <div className="featured-properties-grid" id="featured-properties">
                {featuredProperties.map(property => {
                  const imageUrl = property.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
                  const isFav = favorites.includes(property.id);
                  const pType = property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1);
                  return (
                    <Link key={property.id} href={`/property?id=${property.id}`} className="property-card">
                      <div className="card">
                        <div className="property-image" style={{ position: 'relative' }}>
                          <img src={imageUrl} alt={property.title} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'; }} />
                          <span className={`badge badge-${property.is_available ? 'available' : 'unavailable'} property-badge`}>
                            {property.is_available ? 'Available' : 'Unavailable'}
                          </span>
                          <button
                            className={`favorite-btn${isFav ? ' active' : ''}`}
                            onClick={e => toggleFavorite(property.id, e)}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <svg className="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="card-content">
                          <div className="flex items-center justify-between mb-2">
                            <span className="badge badge-outline">{pType}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{property.title}</h3>
                          <p className="text-2xl font-bold text-primary mb-1">{formatCurrency(property.price)}</p>
                          <p className="text-muted text-sm">{property.city}, {property.state}</p>
                          {(property.bedrooms || property.bathrooms) && (
                            <div className="property-meta mt-2">
                              {property.bedrooms && <span>{property.bedrooms} bed</span>}
                              {property.bathrooms && <span>{property.bathrooms} bath</span>}
                              {property.area_sqft && <span>{property.area_sqft.toLocaleString()} sqft</span>}
                            </div>
                          )}
                        </div>
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
    </>
  );
}
