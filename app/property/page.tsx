'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
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
  listing_type?: string;
  status?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  year_built?: number;
  parking_spaces?: number;
  amenities?: string[];
  primary_image?: string;
  images?: string[];
  agent?: { id: number; username: string; average_rating?: number; email?: string };
}

function PropertyDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id');
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
    if (!propertyId) { setError('Property ID not found'); setLoading(false); return; }
    loadProperty();
  }, [propertyId]);

  async function loadProperty() {
    setLoading(true);
    try {
      const data = await apiCall(`/properties/${propertyId}`);
      setProperty(data);
      // Check if favorited
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const favs = await apiCall('/properties/favorites/me');
          setIsFavorite(favs.some((f: any) => f.id === data.id));
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      if (isFavorite) {
        await apiCall(`/properties/${property?.id}/unfavorite`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await apiCall(`/properties/${property?.id}/favorite`, { method: 'POST' });
        setIsFavorite(true);
      }
    } catch {}
  }

  async function contactAgent() {
    if (!isAuthenticated) { router.push('/login'); return; }
    router.push(`/chat?property_id=${propertyId}`);
  }

  async function scheduleVisit() {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      const date = prompt('Enter preferred visit date (YYYY-MM-DD):');
      if (!date) return;
      const time = prompt('Enter preferred time (HH:MM):');
      if (!time) return;
      await apiCall('/visits/', {
        method: 'POST',
        body: JSON.stringify({ property_id: Number(propertyId), preferred_date: date, preferred_time: time }),
      });
      alert('Visit scheduled successfully!');
      router.push('/visits');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule visit');
    }
  }

  function viewAgentProfile() {
    if (property?.agent?.id) router.push(`/agent-profile?id=${property.agent.id}`);
  }

  if (loading) return (
    <div id="loading-state" className="loading-state">
      <p>Loading property details...</p>
    </div>
  );

  if (error) return (
    <div className="error-message">
      <p>{error}</p>
      <button onClick={() => router.back()} className="btn btn-outline mt-4">Go Back</button>
    </div>
  );

  if (!property) return null;

  const images = property.images?.length ? property.images : [property.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop'];

  return (
    <section className="property-details" id="property-details">
      {/* Image Gallery */}
      <div className="property-images-container">
        <div className="main-image-wrapper">
          <div id="main-image" className="main-image" style={{ backgroundImage: `url(${images[currentImage]})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '400px', borderRadius: '12px' }}></div>
        </div>
        {images.length > 1 && (
          <div id="image-gallery" className="image-gallery">
            {images.map((img, i) => (
              <img key={i} src={img} alt={`View ${i + 1}`} className={i === currentImage ? 'active' : ''} onClick={() => setCurrentImage(i)} style={{ cursor: 'pointer', borderRadius: '8px', opacity: i === currentImage ? 1 : 0.6 }} />
            ))}
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="property-info-container">
        <div className="property-header">
          <div className="property-badges">
            <span className="badge badge-type" id="property-type-badge">{property.property_type}</span>
            <span className="badge badge-status" id="property-status-badge">{property.status || 'Available'}</span>
            {property.listing_type && <span className="badge badge-outline">For {property.listing_type}</span>}
          </div>
          <h1 id="property-title" className="property-title">{property.title}</h1>
          <div className="property-location">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span id="property-location">{property.city}, {property.state}</span>
          </div>
          <div className="property-price" id="property-price">{formatCurrency(property.price)}</div>
        </div>

        {/* Features */}
        <div className="property-features" id="property-features">
          {property.bedrooms != null && <div className="feature-item"><strong>{property.bedrooms}</strong><span>Bedrooms</span></div>}
          {property.bathrooms != null && <div className="feature-item"><strong>{property.bathrooms}</strong><span>Bathrooms</span></div>}
          {property.area_sqft != null && <div className="feature-item"><strong>{property.area_sqft.toLocaleString()}</strong><span>Sq Ft</span></div>}
          {property.year_built != null && <div className="feature-item"><strong>{property.year_built}</strong><span>Year Built</span></div>}
          {property.parking_spaces != null && <div className="feature-item"><strong>{property.parking_spaces}</strong><span>Parking</span></div>}
        </div>

        {/* Description */}
        <div className="property-description-section">
          <h3>Description</h3>
          <p id="property-description">{property.description}</p>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div id="property-amenities">
            <h3>Amenities</h3>
            <ul className="amenities-list">
              {property.amenities.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        {/* Agent */}
        {property.agent && (
          <div className="agent-profile-section" id="agent-profile-section">
            <h3>Listed By</h3>
            <div className="agent-profile-card">
              <div className="agent-avatar" id="agent-avatar">
                {property.agent.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="agent-info">
                <h4 className="agent-name" id="agent-name">{property.agent.username}</h4>
                <p className="agent-contact" id="agent-contact">{property.agent.email}</p>
              </div>
              <button className="btn btn-outline" onClick={viewAgentProfile}>View Profile</button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="property-actions">
          {isAuthenticated && (
            <button id="favorite-btn" className={`btn btn-favorite${isFavorite ? ' active' : ''}`} onClick={toggleFavorite}>
              <svg className="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={contactAgent}>Contact Agent</button>
          <button className="btn btn-secondary" onClick={scheduleVisit}>Schedule Visit</button>
        </div>
      </div>
    </section>
  );
}

export default function PropertyPage() {
  return (
    <>
      <AppNav />
      <main className="property-main">
        <div className="container">
          <Suspense fallback={<div className="loading-state"><p>Loading...</p></div>}>
            <PropertyDetailContent />
          </Suspense>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
