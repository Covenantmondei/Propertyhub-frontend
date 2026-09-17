'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) { router.replace('/login'); return; }
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await apiCall('/properties/favorites/me');
      setFavorites(data);
    } catch {} finally { setLoading(false); }
  }

  async function removeFavorite(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await apiCall(`/properties/${id}/unfavorite`, { method: 'DELETE' });
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch {}
  }

  return (
    <>
      <AppNav />
      <main className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">❤️ My Favorites</h1>
              <p className="text-muted">Properties you've saved for later</p>
            </div>
          </div>
          <div id="favorites-container">
            {loading ? (
              <div className="loading-message"><p>Loading favorites...</p></div>
            ) : favorites.length === 0 ? (
              <div className="empty-message">
                <p>No favorites yet</p>
                <a href="/properties" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse Properties</a>
              </div>
            ) : (
              <div className="properties-grid">
                {favorites.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-card-image" onClick={() => router.push(`/property?id=${property.id}`)} style={{ cursor: 'pointer' }}>
                      <img src={property.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'} alt={property.title} />
                      <button className="favorite-btn active" onClick={e => removeFavorite(property.id, e)} title="Remove from favorites">
                        <svg className="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="property-card-content" onClick={() => router.push(`/property?id=${property.id}`)} style={{ cursor: 'pointer' }}>
                      <h3>{property.title}</h3>
                      <p className="price">{formatCurrency(property.price)}</p>
                      <p className="location">{property.city}, {property.state}</p>
                      <span className="type">{property.property_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
