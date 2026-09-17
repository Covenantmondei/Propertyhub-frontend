'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type VisitStatus = 'all' | 'pending' | 'confirmed' | 'proposed_reschedule' | 'completed' | 'cancelled';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<VisitStatus>('all');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    loadVisits();
  }, [router]);

  useEffect(() => {
    if (!Array.isArray(visits)) {
      setFiltered([]);
      return;
    }
    if (activeStatus === 'all') {
      setFiltered(visits);
    } else {
      setFiltered(visits.filter((v) => v?.status === activeStatus));
    }
  }, [activeStatus, visits]);

  async function loadVisits() {
    setLoading(true);
    try {
      const data = await apiCall('/visits/my-visits');
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data?.visits && Array.isArray(data.visits)) {
        list = data.visits;
      }
      setVisits(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to load visits:', err);
      setVisits([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelVisit(id: number) {
    if (!confirm('Are you sure you want to cancel this property visit?')) return;
    setActionLoading(true);
    try {
      const res = await apiCall(`/visits/${id}/cancel`, { method: 'PUT' });
      if (res?.success !== false) {
        loadVisits();
      } else {
        alert(res?.error || 'Failed to cancel visit');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel visit');
    } finally {
      setActionLoading(false);
    }
  }

  const statusTabs: { key: VisitStatus; label: string }[] = [
    { key: 'all', label: 'All Visits' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'proposed_reschedule', label: 'Reschedule Proposed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'pending':
        return { background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'proposed_reschedule':
        return { background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)' };
      case 'completed':
        return { background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'cancelled':
      default:
        return { background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
  };

  return (
    <>
      <AppNav activePage="visits" />

      <div className="page-wrapper landing-body" style={{ overflow: 'hidden', minHeight: '100vh' }}>
        {/* Left vertical guideline */}
        <div className="vertical-line left"></div>

        {/* Right vertical guideline */}
        <div className="vertical-line right"></div>

        <main style={{ position: 'relative', zIndex: 2, paddingTop: '7.5rem', paddingBottom: '5rem' }}>
          <div className="container">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
                My Property Visits
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '1.0625rem',
                  maxWidth: '560px',
                  margin: '0 auto',
                }}
              >
                Track, reschedule, and manage all your scheduled on-site property viewings.
              </p>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {statusTabs.map((tab) => {
                const isActive = activeStatus === tab.key;
                const count = tab.key === 'all'
                  ? visits.length
                  : visits.filter((v) => v?.status === tab.key).length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveStatus(tab.key)}
                    style={{
                      padding: '0.45rem 1.1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                      color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                      border: `1px solid ${isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          background: isActive ? 'rgba(255,255,255,0.2)' : 'hsl(var(--muted))',
                          color: isActive ? 'inherit' : 'hsl(var(--foreground))',
                          fontWeight: 600,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Visits List / States */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem' }}>Loading your visits...</p>
              </div>
            ) : !Array.isArray(filtered) || filtered.length === 0 ? (
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
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                  No visit requests found
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
                  {activeStatus === 'all'
                    ? 'You have not scheduled any property visits yet.'
                    : `No visits currently in "${activeStatus.replace('_', ' ')}" status.`}
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
                  Browse Available Properties
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filtered.map((visit) => {
                  const badgeStyle = getStatusBadgeStyle(visit.status);
                  const title = visit.property?.title || visit.property_title || 'Property Visit';
                  const dateStr = visit.preferred_date || 'Date pending';
                  const timeStr = visit.preferred_time || '';

                  return (
                    <div
                      key={visit.id}
                      style={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1.25rem',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.07)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                      }}
                    >
                      <div>
                        {/* Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '9999px',
                              ...badgeStyle,
                            }}
                          >
                            {visit.status ? visit.status.replace('_', ' ') : 'Scheduled'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            ID: #{visit.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'hsl(var(--foreground))',
                            margin: '0 0 0.75rem 0',
                            lineHeight: 1.4,
                          }}
                        >
                          {title}
                        </h3>

                        {/* Date & Time */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'hsl(var(--muted-foreground))',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{dateStr} {timeStr && `• ${timeStr}`}</span>
                        </div>

                        {visit.notes && (
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'hsl(var(--muted-foreground))',
                              margin: '0.5rem 0 0 0',
                              fontStyle: 'italic',
                              lineHeight: 1.4,
                              background: 'hsl(var(--muted))',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '8px',
                            }}
                          >
                            "{visit.notes}"
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          paddingTop: '1rem',
                          borderTop: '1px solid hsl(var(--border))',
                        }}
                      >
                        <button
                          onClick={() => setSelectedVisit(visit)}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            borderRadius: '9999px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>

                        {visit.property_id && (
                          <Link
                            href={`/property?id=${visit.property_id}`}
                            className="btn-secondary"
                            style={{
                              borderRadius: '9999px',
                              padding: '0.5rem 0.85rem',
                              fontSize: '0.8125rem',
                              textDecoration: 'none',
                              color: 'inherit',
                            }}
                            title="View Property"
                          >
                            🏠
                          </Link>
                        )}

                        {visit.status === 'pending' && (
                          <button
                            onClick={() => cancelVisit(visit.id)}
                            disabled={actionLoading}
                            style={{
                              borderRadius: '9999px',
                              padding: '0.5rem 1rem',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              background: 'none',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Visit Details Modal */}
            {selectedVisit && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 200,
                  padding: '1rem',
                }}
                onClick={() => setSelectedVisit(null)}
              >
                <div
                  style={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '20px',
                    maxWidth: '500px',
                    width: '100%',
                    padding: '2rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, margin: 0 }}>
                      Visit Details
                    </h2>
                    <button
                      onClick={() => setSelectedVisit(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: 'hsl(var(--muted-foreground))',
                        padding: '0.25rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9375rem' }}>
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Property
                      </span>
                      <strong>{selectedVisit.property?.title || selectedVisit.property_title || 'Property Visit'}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <span style={{ color: 'hsl(var(--muted-foreground))', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Preferred Date
                        </span>
                        <span>{selectedVisit.preferred_date || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'hsl(var(--muted-foreground))', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Preferred Time
                        </span>
                        <span>{selectedVisit.preferred_time || 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Status
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          ...getStatusBadgeStyle(selectedVisit.status),
                        }}
                      >
                        {selectedVisit.status ? selectedVisit.status.replace('_', ' ') : 'Pending'}
                      </span>
                    </div>

                    {selectedVisit.notes && (
                      <div>
                        <span style={{ color: 'hsl(var(--muted-foreground))', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Notes / Request Message
                        </span>
                        <p style={{ margin: '0.25rem 0 0 0', background: 'hsl(var(--muted))', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                          {selectedVisit.notes}
                        </p>
                      </div>
                    )}

                    {selectedVisit.status === 'proposed_reschedule' && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          background: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          padding: '1rem',
                          borderRadius: '12px',
                        }}
                      >
                        <h4 style={{ margin: '0 0 0.35rem 0', color: '#6366f1', fontSize: '0.9375rem' }}>
                          Proposed Reschedule Time
                        </h4>
                        <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.875rem' }}>
                          {selectedVisit.proposed_date} at {selectedVisit.proposed_time}
                        </p>
                        <button
                          className="btn-primary"
                          style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
                          onClick={async () => {
                            try {
                              await apiCall(`/visits/${selectedVisit.id}/accept-reschedule`, { method: 'PUT' });
                              setSelectedVisit(null);
                              loadVisits();
                            } catch {}
                          }}
                        >
                          Confirm & Accept New Time
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSelectedVisit(null)}
                      className="btn-secondary"
                      style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <AppFooter />
      </div>
    </>
  );
}
