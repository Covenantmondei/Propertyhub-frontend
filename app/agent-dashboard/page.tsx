'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, pendingVisits: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setAgent(u);
        if (u.role && u.role !== 'agent' && u.role !== 'admin') {
          router.replace('/home');
          return;
        }
      } catch {}
    }
    loadData();
  }, [router]);

  useEffect(() => {
    const safe = Array.isArray(properties) ? properties : [];
    if (filter === 'all') {
      setFilteredProps(safe);
    } else {
      setFilteredProps(safe.filter((p) => p?.status === filter));
    }
  }, [filter, properties]);

  async function loadData() {
    setLoading(true);
    try {
      const [propsRes, visitsRes] = await Promise.all([
        apiCall('/properties/my-properties'),
        apiCall('/visits/agent-visits').catch(() => []),
      ]);

      let propsList: any[] = [];
      if (Array.isArray(propsRes)) {
        propsList = propsRes;
      } else if (propsRes?.data && Array.isArray(propsRes.data)) {
        propsList = propsRes.data;
      } else if (propsRes?.properties && Array.isArray(propsRes.properties)) {
        propsList = propsRes.properties;
      }

      let visitsList: any[] = [];
      if (Array.isArray(visitsRes)) {
        visitsList = visitsRes;
      } else if (visitsRes?.data && Array.isArray(visitsRes.data)) {
        visitsList = visitsRes.data;
      } else if (visitsRes?.visits && Array.isArray(visitsRes.visits)) {
        visitsList = visitsRes.visits;
      }

      setProperties(propsList);
      setFilteredProps(propsList);

      const approved = propsList.filter((p: any) => p?.status === 'approved').length;
      const pending = propsList.filter((p: any) => p?.status === 'pending').length;
      const pendingVisits = visitsList.filter((v: any) => v?.status === 'pending').length;

      setStats({
        total: propsList.length,
        approved,
        pending,
        pendingVisits,
      });
    } catch (err) {
      console.error('Failed to load agent dashboard data:', err);
      setProperties([]);
      setFilteredProps([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProperty(id: number) {
    if (!confirm('Are you sure you want to delete this property listing?')) return;
    setDeleteLoading(id);
    try {
      const res = await apiCall(`/properties/${id}`, { method: 'DELETE' });
      if (res?.success !== false) {
        loadData();
      } else {
        alert(res?.error || 'Failed to delete property');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeleteLoading(null);
    }
  }

  const statCards = [
    { label: 'Total Listings', value: stats.total, icon: '🏠', color: 'hsl(var(--primary))' },
    { label: 'Approved & Live', value: stats.approved, icon: '✓', color: '#10b981' },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#f59e0b' },
    { label: 'Pending Visits', value: stats.pendingVisits, icon: '📅', color: '#6366f1' },
  ];

  const quickActions = [
    { href: '/new-property', label: 'Add New Property', desc: 'Create a new listing with photos and details', icon: '➕' },
    { href: '/visits', label: 'Visit Requests', desc: 'Review scheduled viewings from potential buyers', icon: '📅' },
    { href: '/chat', label: 'Buyer Inquiries', desc: 'Direct chat with interested clients', icon: '💬' },
    { href: '/agent-profile', label: 'Agent Profile', desc: 'Manage your public contact info & credentials', icon: '👤' },
    { href: '/kyc-verification', label: 'KYC Verification', desc: 'Complete identity verification to stay approved', icon: '🛡️' },
  ];

  return (
    <>
      <AppNav activePage="agent-dashboard" />

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
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '9999px',
                    background: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span>Agent Portal</span>
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    color: 'hsl(var(--foreground))',
                    margin: 0,
                  }}
                >
                  Agent Dashboard
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem', marginTop: '0.35rem' }}>
                  Welcome back, <strong>{agent?.username || 'Agent'}</strong>! Manage your properties and client leads.
                </p>
              </div>

              <Link
                href="/new-property"
                className="btn-primary"
                style={{
                  borderRadius: '9999px',
                  padding: '0.65rem 1.65rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                List New Property
              </Link>
            </div>

            {/* Stats Overview Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '3rem',
              }}
            >
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'hsl(var(--muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color, lineHeight: 1.1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Section */}
            <div style={{ marginBottom: '3.5rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  marginBottom: '1.25rem',
                  color: 'hsl(var(--foreground))',
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{action.icon}</div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>{action.label}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: 1.4 }}>
                      {action.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* My Listings Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    fontWeight: 400,
                    margin: 0,
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  My Property Listings
                </h2>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', background: 'hsl(var(--muted))', padding: '0.25rem', borderRadius: '9999px' }}>
                  {['all', 'approved', 'pending'].map((f) => {
                    const isActive = filter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                          padding: '0.35rem 1rem',
                          borderRadius: '9999px',
                          border: 'none',
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 500,
                          background: isActive ? 'hsl(var(--card))' : 'transparent',
                          color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                          boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textTransform: 'capitalize',
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid Content / States */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem' }}>Loading your listings...</p>
                </div>
              ) : !Array.isArray(filteredProps) || filteredProps.length === 0 ? (
                <div
                  style={{
                    maxWidth: '520px',
                    margin: '0 auto',
                    textAlign: 'center',
                    padding: '3.5rem 2rem',
                    background: 'hsl(var(--card))',
                    borderRadius: '20px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {filter === 'all' ? 'No Properties Listed Yet' : `No ${filter} properties`}
                  </h3>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
                    {filter === 'all'
                      ? 'Publish your first property to start receiving buyer inquiries and visit requests.'
                      : `You currently have no properties with status "${filter}".`}
                  </p>
                  <Link
                    href="/new-property"
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
                    + Create First Listing
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
                  {filteredProps.map((property) => {
                    const imageUrl =
                      property.primary_image ||
                      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                    const isApproved = property.status === 'approved';

                    return (
                      <div
                        key={property.id}
                        style={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        {/* Image */}
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/10',
                            overflow: 'hidden',
                            backgroundColor: 'hsl(var(--muted))',
                            cursor: 'pointer',
                          }}
                          onClick={() => router.push(`/property?id=${property.id}`)}
                        >
                          <img
                            src={imageUrl}
                            alt={property.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              background: isApproved ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                              color: 'white',
                              backdropFilter: 'blur(6px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            {property.status || 'Pending'}
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3
                            style={{
                              fontSize: '1.0625rem',
                              fontWeight: 600,
                              margin: '0 0 0.35rem 0',
                              color: 'hsl(var(--foreground))',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            onClick={() => router.push(`/property?id=${property.id}`)}
                          >
                            {property.title}
                          </h3>

                          <div
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              color: 'hsl(var(--primary))',
                              marginBottom: '0.35rem',
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
                              fontSize: '0.8125rem',
                              marginBottom: '1rem',
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>
                              {property.city}, {property.state}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div
                            style={{
                              marginTop: 'auto',
                              paddingTop: '0.85rem',
                              borderTop: '1px solid hsl(var(--border))',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <button
                              onClick={() => router.push(`/property?id=${property.id}`)}
                              className="btn-secondary"
                              style={{
                                flex: 1,
                                borderRadius: '9999px',
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              View Listing
                            </button>

                            <button
                              onClick={() => deleteProperty(property.id)}
                              disabled={deleteLoading === property.id}
                              style={{
                                borderRadius: '9999px',
                                padding: '0.45rem 0.85rem',
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
                              {deleteLoading === property.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </>
  );
}
