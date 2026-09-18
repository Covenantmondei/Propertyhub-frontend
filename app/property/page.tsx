'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import './property.css';

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
  amenities?: string[] | string;
  primary_image?: string;
  image_url?: string;
  images?: any;
  agent?: { id: number; username: string; average_rating?: number; email?: string };
}

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
];

function parseArrayField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => (typeof v === 'string' ? v.trim() : String(v).trim())).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(v => (typeof v === 'string' ? v.trim() : String(v).trim())).filter(Boolean);
        }
      } catch {
        // Fall through to delimiter split
      }
    }
    return trimmed
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

function extractImages(property: Property | null): string[] {
  if (!property) return DEFAULT_FALLBACK_IMAGES;
  const list: string[] = [];

  const extractUrl = (item: any): string | null => {
    if (!item) return null;
    if (typeof item === 'string') {
      const s = item.trim();
      if (!s) return null;
      if (s.startsWith('[') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            parsed.forEach(p => {
              const u = extractUrl(p);
              if (u && !list.includes(u)) list.push(u);
            });
            return null;
          } else if (typeof parsed === 'object') {
            return extractUrl(parsed);
          }
        } catch {
          // not valid json
        }
      }
      return s;
    }
    if (typeof item === 'object') {
      return item.image_url || item.url || item.image || item.src || item.path || null;
    }
    return null;
  };

  // 1. Process property.images
  if (Array.isArray(property.images)) {
    property.images.forEach(img => {
      const u = extractUrl(img);
      if (u && !list.includes(u)) list.push(u);
    });
  } else if (typeof property.images === 'string') {
    const raw = property.images.trim();
    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => {
            const u = extractUrl(p);
            if (u && !list.includes(u)) list.push(u);
          });
        }
      } catch {
        raw.split(/[\n,]+/).forEach(s => {
          const trimmed = s.trim();
          if (trimmed && !list.includes(trimmed)) list.push(trimmed);
        });
      }
    } else {
      raw.split(/[\n,]+/).forEach(s => {
        const trimmed = s.trim();
        if (trimmed && !list.includes(trimmed)) list.push(trimmed);
      });
    }
  }

  // 2. Process primary_image and image_url
  if (property.primary_image && typeof property.primary_image === 'string') {
    const pImg = property.primary_image.trim();
    if (pImg && !list.includes(pImg)) {
      list.unshift(pImg);
    }
  }

  if (property.image_url && typeof property.image_url === 'string') {
    const imgUrl = property.image_url.trim();
    if (imgUrl && !list.includes(imgUrl)) {
      list.push(imgUrl);
    }
  }

  // Filter out bogus values
  const validImages = list.filter(u => u && u.length > 5 && !u.includes('undefined') && !u.includes('null'));

  return validImages.length > 0 ? validImages : DEFAULT_FALLBACK_IMAGES;
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
    if (!propertyId) {
      setError('Property ID not found');
      setLoading(false);
      return;
    }
    loadProperty();
  }, [propertyId]);

  async function loadProperty() {
    setLoading(true);
    try {
      const data = await apiCall(`/properties/${propertyId}`);
      if (!data || data.error) {
        throw new Error(data?.error || 'Property not found');
      }
      setProperty(data);
      // Check if favorited
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const favs = await apiCall('/properties/favorites/me');
          if (Array.isArray(favs)) {
            setIsFavorite(favs.some((f: any) => f.id === data.id));
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }

  const images = extractImages(property);

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevImage, nextImage, isLightboxOpen]);

  async function toggleFavorite() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/chat?property_id=${propertyId}`);
  }

  async function scheduleVisit() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const date = prompt('Enter preferred visit date (YYYY-MM-DD):');
      if (!date) return;
      const time = prompt('Enter preferred time (HH:MM):');
      if (!time) return;
      try {
        await apiCall('/visit/request', {
          method: 'POST',
          body: JSON.stringify({ property_id: Number(propertyId), preferred_date: date, preferred_time: time }),
        });
      } catch (e) {
        await apiCall('/visits/', {
          method: 'POST',
          body: JSON.stringify({ property_id: Number(propertyId), preferred_date: date, preferred_time: time }),
        });
      }
      alert('Visit scheduled successfully!');
      router.push('/visits');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule visit');
    }
  }

  function viewAgentProfile() {
    const agentId = property?.agent?.id || (property as any)?.agent_id || (property as any)?.owner_id;
    if (agentId) {
      router.push(`/agent-profile?id=${agentId}`);
    } else {
      router.push('/agent-profile');
    }
  }

  if (loading) {
    return (
      <div id="loading-state" className="loading-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid hsl(var(--border))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.25rem', fontSize: '1.1rem', color: 'hsl(var(--muted-foreground))' }}>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message" style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', maxWidth: '600px', margin: '3rem auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Unable to load property</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => router.push('/properties')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
          Browse Other Properties
        </button>
      </div>
    );
  }

  if (!property) return null;

  const amenitiesList = parseArrayField(property.amenities);
  const activeImgSrc = imageErrorMap[currentImage]
    ? DEFAULT_FALLBACK_IMAGES[0]
    : images[currentImage] || DEFAULT_FALLBACK_IMAGES[0];

  return (
    <div className="property-page-layout" id="property-details-section">
      {/* 2-Column Grid Layout */}
      <div className="property-page-grid">
        {/* Left Column: Image Carousel, Gallery & Action Buttons */}
        <div className="property-gallery-column">
          <div className="property-carousel-card">
            {/* Main Featured Image Container */}
            <div className="carousel-viewport">
              <img
                src={activeImgSrc}
                alt={property.title || 'Property image'}
                className="carousel-main-img"
                onClick={() => setIsLightboxOpen(true)}
                onError={() => setImageErrorMap((prev) => ({ ...prev, [currentImage]: true }))}
              />

              {/* Gradient Overlays for contrast */}
              <div className="carousel-gradient-overlay" />

              {/* Prev Navigation Button `<` */}
              {images.length > 1 && (
                <button
                  type="button"
                  id="prev-image-btn"
                  className="carousel-nav-btn carousel-nav-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                  title="Previous image (<)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-arrow-icon">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              {/* Next Navigation Button `>` */}
              {images.length > 1 && (
                <button
                  type="button"
                  id="next-image-btn"
                  className="carousel-nav-btn carousel-nav-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                  title="Next image (>)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-arrow-icon">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}

              {/* Image Counter & Fullscreen trigger */}
              <div className="carousel-bottom-bar">
                <div className="image-counter-pill">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{currentImage + 1} / {images.length}</span>
                </div>

                <button
                  type="button"
                  className="fullscreen-expand-btn"
                  onClick={() => setIsLightboxOpen(true)}
                  title="View Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>

              {/* Dot Indicators */}
              {images.length > 1 && (
                <div className="carousel-dots-indicator">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-dot ${idx === currentImage ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="thumbnails-strip-wrapper">
                <div className="thumbnails-strip" id="property-thumbnail-gallery">
                  {images.map((img, i) => {
                    const thumbSrc = imageErrorMap[i] ? DEFAULT_FALLBACK_IMAGES[0] : img;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`thumbnail-item ${i === currentImage ? 'active' : ''}`}
                        onClick={() => setCurrentImage(i)}
                        aria-label={`Select photo ${i + 1}`}
                      >
                        <img
                          src={thumbSrc}
                          alt={`Thumbnail ${i + 1}`}
                          className="thumbnail-img"
                          onError={() => setImageErrorMap((prev) => ({ ...prev, [i]: true }))}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Save, Contact Agent, Schedule Visit (Placed below the image) */}
          <div className="property-gallery-actions-card">
            <div className="property-action-bar">
              <button
                id="favorite-btn"
                type="button"
                className={`btn btn-favorite ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                aria-label={isFavorite ? 'Saved property' : 'Save property'}
              >
                <svg className="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <button type="button" className="btn btn-primary action-btn-contact" onClick={contactAgent}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Contact Agent</span>
              </button>

              <button type="button" className="btn btn-secondary action-btn-schedule" onClick={scheduleVisit}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Schedule Visit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Property Information */}
        <div className="property-info-column">
          <div className="property-header-card">
            {/* Badges */}
            <div className="property-badges">
              <span className="badge badge-type" id="property-type-badge">
                {property.property_type ? property.property_type.toUpperCase() : 'PROPERTY'}
              </span>
              <span className="badge badge-status" id="property-status-badge">
                {(property.status || 'AVAILABLE').toUpperCase()}
              </span>
              {property.listing_type && (
                <span className="badge badge-listing-type">
                  FOR {property.listing_type.toUpperCase()}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 id="property-title" className="property-title">
              {property.title}
            </h1>

            {/* Location */}
            <div className="property-location">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="location-pin-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="property-location">
                {property.city ? `${property.city}, ` : ''}{property.state || ''}
              </span>
            </div>

            {/* Price */}
            <div className="property-price" id="property-price">
              {formatCurrency(property.price)}
            </div>
          </div>

          {/* Features Grid */}
          <div className="property-features-grid" id="property-features">
            {property.bedrooms != null && (
              <div className="feature-box">
                <span className="feature-val">{property.bedrooms}</span>
                <span className="feature-lbl">Bedrooms</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="feature-box">
                <span className="feature-val">{property.bathrooms}</span>
                <span className="feature-lbl">Bathrooms</span>
              </div>
            )}
            {property.area_sqft != null && (
              <div className="feature-box">
                <span className="feature-val">{property.area_sqft.toLocaleString()}</span>
                <span className="feature-lbl">Sq Ft</span>
              </div>
            )}
            {property.year_built != null && (
              <div className="feature-box">
                <span className="feature-val">{property.year_built}</span>
                <span className="feature-lbl">Year Built</span>
              </div>
            )}
            {property.parking_spaces != null && (
              <div className="feature-box">
                <span className="feature-val">{property.parking_spaces}</span>
                <span className="feature-lbl">Parking</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="property-card-section">
            <h3 className="section-title">Description</h3>
            <p id="property-description" className="property-description-text">
              {property.description || 'No description provided for this property.'}
            </p>
          </div>

          {/* Amenities Section */}
          {amenitiesList.length > 0 && (
            <div className="property-card-section" id="property-amenities">
              <h3 className="section-title">Amenities</h3>
              <div className="amenities-tags-container">
                {amenitiesList.map((a, i) => (
                  <div key={i} className="amenity-pill">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listed By Agent Section */}
          {property.agent && (
            <div className="property-card-section agent-section" id="agent-profile-section">
              <h3 className="section-title">Listed By</h3>
              <div className="agent-profile-box">
                <div className="agent-avatar" id="agent-avatar">
                  {property.agent.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="agent-meta">
                  <h4 className="agent-name" id="agent-name">{property.agent.username}</h4>
                  <p className="agent-contact" id="agent-contact">{property.agent.email || 'Verified Agent'}</p>
                </div>
                <button type="button" className="btn btn-outline agent-view-btn" onClick={viewAgentProfile}>
                  View Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="lightbox-modal" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen view"
            >
              ✕
            </button>

            <div className="lightbox-img-wrapper">
              <img
                src={activeImgSrc}
                alt={property.title || 'Fullscreen property image'}
                className="lightbox-main-img"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div className="lightbox-counter">
              {currentImage + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyPage() {
  return (
    <>
      <AppNav />
      <main className="property-main">
        <Suspense fallback={
          <div className="loading-state" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p>Loading property...</p>
          </div>
        }>
          <PropertyDetailContent />
        </Suspense>
      </main>
      <AppFooter />
    </>
  );
}
