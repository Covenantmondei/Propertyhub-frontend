'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface AgentData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

interface Review {
  id: string;
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
  const agentId = searchParams.get('agent_id') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (!agentId) {
      setError(true);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [agentRes, reviewsRes] = await Promise.all([
          apiCall<AgentData>(`/auth/users/${agentId}`, 'GET'),
          apiCall<ReviewsData>(`/reviews/agent/${agentId}`, 'GET'),
        ]);

        if (!agentRes.success || !agentRes.data) {
          setError(true);
          return;
        }

        setAgent(agentRes.data);
        setReviewsData(
          reviewsRes.success && reviewsRes.data
            ? reviewsRes.data
            : { reviews: [], total_reviews: 0, average_rating: 0 }
        );
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agentId]);

  const handleContact = () => {
    if (!isAuthenticated()) {
      alert('Please log in to contact this agent.');
      router.push('/login');
      return;
    }
    router.push(`/chat?agent=${agentId}`);
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
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
        <p>Loading agent profile...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2>Agent Not Found</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          The agent you are looking for does not exist or has been removed.
        </p>
        <Link href="/properties" className="btn btn-primary">
          Browse Properties
        </Link>
      </div>
    );
  }

  const initials = `${agent.first_name?.[0] || ''}${agent.last_name?.[0] || ''}`.toUpperCase();
  const sortedReviews = getSortedReviews();

  return (
    <main className="agent-profile-main">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Agent Header Card */}
        <div className="agent-header">
          <div className="agent-avatar-large">{initials}</div>
          <div className="agent-info">
            <h1 className="agent-name">
              {agent.first_name} {agent.last_name}
            </h1>
            <div className="agent-rating-summary">
              <div className="rating-stars">{renderStars(reviewsData?.average_rating || 0)}</div>
              <span className="rating-value">{(reviewsData?.average_rating || 0).toFixed(1)}</span>
              <span className="rating-count">
                ({reviewsData?.total_reviews || 0} review{reviewsData?.total_reviews !== 1 ? 's' : ''})
              </span>
            </div>
            <div className="agent-contact-info">
              <div className="contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {agent.email}
              </div>
              {agent.phone_number && (
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {agent.phone_number}
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleContact} style={{ marginTop: '1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contact Agent
            </button>
          </div>
        </div>

        {/* Rating Breakdown */}
        {reviewsData && (
          <div className="rating-breakdown" style={{ marginTop: '2rem' }}>
            <h3>Performance Metrics</h3>
            <div className="rating-metrics">
              {[
                { label: 'Communication', val: reviewsData.average_communication },
                { label: 'Professionalism', val: reviewsData.average_professionalism },
                { label: 'Knowledge', val: reviewsData.average_knowledge },
                { label: 'Responsiveness', val: reviewsData.average_responsiveness },
              ].map((m, idx) => {
                const pct = m.val ? (m.val / 5) * 100 : 0;
                return (
                  <div className="rating-metric" key={idx}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="metric-value">{m.val ? m.val.toFixed(1) : 'N/A'} / 5.0</div>
                  </div>
                );
              })}
            </div>
            {reviewsData.recommendation_percentage !== undefined && (
              <div className="recommendation-stat" style={{ marginTop: '1.5rem' }}>
                <p className="recommendation-percentage">{reviewsData.recommendation_percentage}%</p>
                <p className="recommendation-label">of clients recommend this agent</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section" style={{ marginTop: '2.5rem' }}>
          <div className="reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Client Reviews</h2>
            <div className="reviews-filter">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="no-reviews" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div className="no-reviews-icon" style={{ fontSize: '3rem' }}>⭐</div>
              <h3>No Reviews Yet</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>This agent hasn't received any reviews yet.</p>
            </div>
          ) : (
            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
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
                  <div className="review-card" key={rev.id}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">{bInitials}</div>
                        <div className="reviewer-details">
                          <h4 className="reviewer-name">{rev.buyer_name}</h4>
                          <div className="review-date">{revDate}</div>
                        </div>
                      </div>
                      <div className="review-rating">{renderStars(rev.rating)}</div>
                    </div>

                    {rev.review_text && <p className="review-text">{rev.review_text}</p>}

                    {rev.property_title && (
                      <div className="review-property" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        📍 Property: {rev.property_title}
                      </div>
                    )}

                    <div className="review-metrics" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {rev.communication_rating && (
                        <div className="review-metric-item">
                          <span>Communication:</span>
                          <div className="stars">{renderMiniStars(rev.communication_rating)}</div>
                        </div>
                      )}
                      {rev.professionalism_rating && (
                        <div className="review-metric-item">
                          <span>Professionalism:</span>
                          <div className="stars">{renderMiniStars(rev.professionalism_rating)}</div>
                        </div>
                      )}
                      {rev.knowledge_rating && (
                        <div className="review-metric-item">
                          <span>Knowledge:</span>
                          <div className="stars">{renderMiniStars(rev.knowledge_rating)}</div>
                        </div>
                      )}
                      {rev.responsiveness_rating && (
                        <div className="review-metric-item">
                          <span>Responsiveness:</span>
                          <div className="stars">{renderMiniStars(rev.responsiveness_rating)}</div>
                        </div>
                      )}
                    </div>

                    {rev.would_recommend !== undefined && (
                      <div className={`recommendation-badge ${rev.would_recommend ? '' : 'not-recommend'}`} style={{ marginTop: '0.75rem' }}>
                        {rev.would_recommend ? '👍 Recommends this agent' : '👎 Does not recommend'}
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
      <Suspense fallback={<div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>Loading...</div>}>
        <AgentProfileContent />
      </Suspense>
      <AppFooter />
    </>
  );
}
