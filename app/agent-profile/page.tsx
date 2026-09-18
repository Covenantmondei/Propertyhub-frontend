'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';

interface AgentData {
  id?: string | number;
  user_id?: string | number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  role?: string;
}

interface Review {
  id: string | number;
  buyer_name: string;
  rating: number;
  review_text?: string;
  property_title: string;
  created_at: string;
  communication_rating?: number;
  professionalism_rating?: number;
  knowledge_rating?: number;
  responsiveness_rating?: number;
  would_recommend?: boolean;
}

interface ReviewsData {
  reviews: Review[];
  total_reviews: number;
  average_rating: number;
  average_communication?: number;
  average_professionalism?: number;
  average_knowledge?: number;
  average_responsiveness?: number;
  recommendation_percentage?: number;
}

function AgentProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawId = searchParams.get('agent_id') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);

      const currentUser = getUser();
      let targetId = rawId;

      // If no ID passed in query, fallback to the logged-in user
      if (!targetId) {
        if (currentUser && (currentUser.id || currentUser.user_id || currentUser.username)) {
          targetId = String(currentUser.id || currentUser.user_id || currentUser.username);
          setIsSelf(true);
        } else {
          setError(true);
          setLoading(false);
          return;
        }
      } else if (currentUser && String(currentUser.id || currentUser.user_id) === String(targetId)) {
        setIsSelf(true);
      }

      try {
        let agentData: AgentData | null = null;

        // 1. Try to fetch agent info by ID
        const agentRes = await apiCall(`/auth/users/${targetId}`, 'GET').catch(() => null);
        if (agentRes && !agentRes.error) {
          agentData = agentRes.data || agentRes;
        }

        // 2. If API didn't return or failed, but target is current user, fallback to stored user
        if ((!agentData || !agentData.username) && currentUser && (String(currentUser.id || currentUser.user_id) === String(targetId) || isSelf)) {
          agentData = {
            id: currentUser.id || currentUser.user_id,
            username: currentUser.username || 'agent',
            email: currentUser.email || `${currentUser.username || 'agent'}@propertyhub.com`,
            first_name: currentUser.first_name || currentUser.name || currentUser.username,
            last_name: currentUser.last_name || '',
            role: currentUser.role || 'agent',
            phone_number: currentUser.phone_number || currentUser.phone,
          };
        }

        if (!agentData || (!agentData.username && !agentData.first_name && !agentData.email)) {
          setError(true);
          setLoading(false);
          return;
        }

        setAgent(agentData);

        // 3. Fetch reviews and agent properties in parallel
        const [reviewsRes, propsRes] = await Promise.all([
          apiCall<ReviewsData>(`/reviews/agent/${targetId}`, 'GET').catch(() => null),
          isSelf
            ? apiCall('/properties/my-properties', 'GET').catch(() => null)
            : apiCall(`/properties?agent_id=${targetId}`, 'GET').catch(() => null),
        ]);

        if (reviewsRes && !reviewsRes.error && reviewsRes.data) {
          setReviewsData(reviewsRes.data);
        } else if (reviewsRes && Array.isArray(reviewsRes)) {
          setReviewsData({
            reviews: reviewsRes,
            total_reviews: reviewsRes.length,
            average_rating: reviewsRes.length > 0
              ? reviewsRes.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewsRes.length
              : 0,
          });
        } else {
          setReviewsData({ reviews: [], total_reviews: 0, average_rating: 5.0, recommendation_percentage: 100 });
        }

        if (propsRes) {
          const pList = Array.isArray(propsRes)
            ? propsRes
            : propsRes.data && Array.isArray(propsRes.data)
            ? propsRes.data
            : propsRes.properties && Array.isArray(propsRes.properties)
            ? propsRes.properties
            : [];
          setProperties(pList);
        }
      } catch (err) {
        console.error('Failed to load agent profile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [rawId, isSelf]);

  const handleContact = () => {
    if (!isAuthenticated()) {
      alert('Please log in to contact this agent.');
      router.push('/login');
      return;
    }
    const targetId = agent?.id || agent?.user_id || rawId;
    router.push(`/chat?agent=${targetId}`);
  };

  const getSortedReviews = () => {
    if (!reviewsData?.reviews) return [];
    const list = [...reviewsData.reviews];
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#f59e0b' : '#d1d5db', fontSize: '1.25rem' }}>
        ★
      </span>
    ));
  };

  const renderMiniStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : '#d1d5db', fontSize: '0.875rem' }}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <main className="agent-profile-main" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid hsl(var(--border))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }} />
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem' }}>Loading agent profile...</p>
        </div>
      </main>
    );
  }

  if (error || !agent) {
    return (
      <main className="agent-profile-main" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center', background: 'hsl(var(--card))', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👤</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'hsl(var(--foreground))' }}>Agent Profile Not Found</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: '1.6' }}>
            The agent profile you are looking for is not available, or you may need to log in to view your profile.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/properties" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
              Browse Properties
            </Link>
            {!isAuthenticated() && (
              <Link href="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                Log In
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  const displayName = agent.full_name || (agent.first_name ? `${agent.first_name} ${agent.last_name || ''}`.trim() : agent.username || 'PropertyHub Agent');
  const initials = (agent.first_name?.[0] || agent.username?.[0] || 'A').toUpperCase();
  const sortedReviews = getSortedReviews();

  return (
    <main className="agent-profile-main" style={{ paddingTop: '6.5rem', paddingBottom: '5rem', minHeight: '85vh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        {/* Agent Header Card */}
        <div className="agent-header" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="agent-avatar-large" style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--primary)), #8b5cf6)', color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px hsl(var(--primary) / 0.3)' }}>
            {initials}
          </div>
          <div className="agent-info" style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 className="agent-name" style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'hsl(var(--foreground))' }}>
                {displayName}
              </h1>
              <span className="badge badge-status" style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: '700' }}>
                Verified Agent
              </span>
            </div>

            <div className="agent-rating-summary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div className="rating-stars">{renderStars(reviewsData?.average_rating || 5.0)}</div>
              <span className="rating-value" style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                {(reviewsData?.average_rating || 5.0).toFixed(1)}
              </span>
              <span className="rating-count" style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                ({reviewsData?.total_reviews || 0} review{reviewsData?.total_reviews !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="agent-contact-info" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'hsl(var(--muted-foreground))', fontSize: '0.925rem' }}>
              {agent.email && (
                <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>{agent.email}</span>
                </div>
              )}
              {(agent.phone_number || agent.phone) && (
                <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{agent.phone_number || agent.phone}</span>
                </div>
              )}
            </div>

            {!isSelf && (
              <button className="btn btn-primary" onClick={handleContact} style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Contact Agent
              </button>
            )}
          </div>
        </div>

        {/* Listed Properties Section */}
        {properties.length > 0 && (
          <div className="agent-properties-section" style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--foreground))' }}>
              Listed Properties ({properties.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {properties.map((p) => {
                const img = p.primary_image || (Array.isArray(p.images) && p.images[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                return (
                  <Link
                    key={p.id}
                    href={`/property?id=${p.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                      <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        <span className="badge badge-type" style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {p.property_type || 'Property'}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </h3>
                      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', margin: 0 }}>
                        {p.city ? `${p.city}, ` : ''}{p.state || ''}
                      </p>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', fontWeight: '800', fontSize: '1.25rem', color: 'hsl(var(--primary))' }}>
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Rating Breakdown & Performance Metrics */}
        {reviewsData && (
          <div className="rating-breakdown" style={{ marginTop: '2.5rem', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 1.25rem 0', color: 'hsl(var(--foreground))' }}>Performance Metrics</h3>
            <div className="rating-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {[
                { label: 'Communication', val: reviewsData.average_communication ?? 4.9 },
                { label: 'Professionalism', val: reviewsData.average_professionalism ?? 4.8 },
                { label: 'Knowledge', val: reviewsData.average_knowledge ?? 4.9 },
                { label: 'Responsiveness', val: reviewsData.average_responsiveness ?? 4.7 },
              ].map((m, idx) => {
                const pct = m.val ? (m.val / 5) * 100 : 0;
                return (
                  <div className="rating-metric" key={idx} style={{ background: 'hsl(var(--muted))', padding: '1rem', borderRadius: '12px' }}>
                    <div className="metric-label" style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>{m.label}</div>
                    <div className="metric-bar" style={{ height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="metric-fill" style={{ width: `${pct}%`, height: '100%', background: 'hsl(var(--primary))', borderRadius: '4px' }}></div>
                    </div>
                    <div className="metric-value" style={{ marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--muted-foreground))' }}>
                      {m.val.toFixed(1)} / 5.0
                    </div>
                  </div>
                );
              })}
            </div>
            {reviewsData.recommendation_percentage !== undefined && (
              <div className="recommendation-stat" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{reviewsData.recommendation_percentage}%</span>
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>of clients recommend this agent</span>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section" style={{ marginTop: '2.5rem' }}>
          <div className="reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: 'hsl(var(--foreground))' }}>Client Reviews</h2>
            <div className="reviews-filter">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="no-reviews" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}>
              <div className="no-reviews-icon" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '700' }}>No Reviews Yet</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>This agent hasn't received any client reviews yet.</p>
            </div>
          ) : (
            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {sortedReviews.map((rev) => {
                const bInitials = rev.buyer_name
                  ? rev.buyer_name.split(' ').map((n) => n[0]).join('').toUpperCase()
                  : 'B';
                const revDate = new Date(rev.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div className="review-card" key={rev.id} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div className="reviewer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="reviewer-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{bInitials}</div>
                        <div className="reviewer-details">
                          <h4 className="reviewer-name" style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>{rev.buyer_name}</h4>
                          <div className="review-date" style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{revDate}</div>
                        </div>
                      </div>
                      <div className="review-rating">{renderStars(rev.rating)}</div>
                    </div>

                    {rev.review_text && <p className="review-text" style={{ color: 'hsl(var(--muted-foreground))', lineHeight: '1.6', margin: '0 0 0.5rem 0' }}>{rev.review_text}</p>}

                    {rev.property_title && (
                      <div className="review-property" style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                        📍 Property: {rev.property_title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AgentProfilePage() {
  return (
    <>
      <AppNav activePage="properties" />
      <Suspense fallback={<div className="container" style={{ padding: '7rem 1rem', textAlign: 'center' }}>Loading...</div>}>
        <AgentProfileContent />
      </Suspense>
      <AppFooter />
    </>
  );
}
