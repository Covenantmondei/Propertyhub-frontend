'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, messages: 0, pendingVisits: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) { router.replace('/login'); return; }
    const userStr = localStorage.getItem('user');
    if (userStr) { try { const u = JSON.parse(userStr); setAgent(u); if (u.role !== 'agent') router.replace('/home'); } catch {} }
    loadData();
  }, []);

  useEffect(() => {
    if (filter === 'all') setFilteredProps(properties);
    else setFilteredProps(properties.filter(p => p.status === filter));
  }, [filter, properties]);

  async function loadData() {
    setLoading(true);
    try {
      const [props, visits] = await Promise.all([
        apiCall('/properties/my-properties'),
        apiCall('/visits/agent-visits').catch(() => []),
      ]);
      setProperties(props);
      setFilteredProps(props);
      const approved = props.filter((p: any) => p.status === 'approved').length;
      const pending = props.filter((p: any) => p.status === 'pending').length;
      const pendingVisits = visits.filter((v: any) => v.status === 'pending').length;
      setStats({ total: props.length, approved, pending, messages: 0, pendingVisits });
    } catch {} finally { setLoading(false); }
  }

  async function deleteProperty(id: number) {
    if (!confirm('Delete this property?')) return;
    try {
      await apiCall(`/properties/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) { alert(err.message || 'Failed to delete'); }
  }

  return (
    <>
      <AppNav />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <div className="header-content">
              <h1>Agent Dashboard</h1>
              <p className="text-muted">Welcome back, <span id="agent-name">{agent?.username || 'Agent'}</span>!</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => router.push('/new-property')}>+ Add New Property</button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { label: 'Total Properties', value: stats.total, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
              { label: 'Approved', value: stats.approved, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
              { label: 'Pending Approval', value: stats.pending, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
              { label: 'Pending Visits', value: stats.pendingVisits, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            ].map(stat => (
              <div key={stat.label} className="stat-card">
                <div className="stat-icon" style={{ background: stat.gradient }}></div>
                <div className="stat-content">
                  <h3 id={`stat-${stat.label.toLowerCase().replace(/ /g, '-')}`}>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {[
                { href: '/new-property', label: 'Add Property', desc: 'List a new property for sale or rent' },
                { href: '/properties', label: 'Browse Properties', desc: 'View all listed properties' },
                { href: '/chat', label: 'View Messages', desc: 'Check inquiries and chats' },
                { href: '/visits', label: 'Manage Visits', desc: 'View and respond to visit requests' },
                { href: '/kyc-verification', label: 'KYC Verification', desc: 'Verify your identity to unlock all features' },
              ].map(action => (
                <a key={action.href} href={action.href} className="action-card">
                  <h3>{action.label}</h3>
                  <p>{action.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* My Properties */}
          <div className="properties-section">
            <div className="section-header">
              <h2>My Properties</h2>
              <div className="filter-tabs">
                {['all', 'approved', 'pending'].map(f => (
                  <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} data-filter={f} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div id="loading-properties" className="loading-state"><p>Loading your properties...</p></div>
            ) : filteredProps.length === 0 ? (
              <div id="empty-state" className="empty-state">
                <h3>No Properties Yet</h3>
                <p>Start by adding your first property listing</p>
                <a href="/new-property" className="btn btn-primary">Add Property</a>
              </div>
            ) : (
              <div id="properties-grid" className="properties-grid">
                {filteredProps.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-card-image" style={{ cursor: 'pointer' }} onClick={() => router.push(`/property?id=${property.id}`)}>
                      <img src={property.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'} alt={property.title} />
                    </div>
                    <div className="property-card-content">
                      <h3>{property.title}</h3>
                      <p className="price">{formatCurrency(property.price)}</p>
                      <p className="location">{property.city}, {property.state}</p>
                      <span className={`badge badge-${property.status}`}>{property.status}</span>
                      <div className="card-actions" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => router.push(`/property?id=${property.id}`)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProperty(property.id)}>Delete</button>
                      </div>
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
