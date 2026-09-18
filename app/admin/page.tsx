'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser, clearAuth } from '@/lib/auth';
import { apiCall } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>({
    total_users: 0,
    total_properties: 0,
    pending_approvals: 0,
    total_agents: 0,
    pending_properties: 0,
    pending_agents: 0,
    pending_kyc: 0,
  });

  // Data lists
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingAgents, setPendingAgents] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Filters
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [logDaysFilter, setLogDaysFilter] = useState('7');

  // Loading states
  const [loading, setLoading] = useState(true);

  // Modals
  const [rejectionModal, setRejectionModal] = useState<{
    open: boolean;
    type: 'property' | 'agent' | null;
    id: string | null;
    reason: string;
  }>({ open: false, type: null, id: null, reason: '' });

  const [kycModal, setKycModal] = useState<{
    open: boolean;
    item: any | null;
    rejectionOpen: boolean;
    rejectionReason: string;
  }>({ open: false, item: null, rejectionOpen: false, rejectionReason: '' });

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(stored);
    loadStats();
    loadRecentActivity();
  }, []);

  function extractArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.properties)) return res.properties;
    if (Array.isArray(res.users)) return res.users;
    if (Array.isArray(res.agents)) return res.agents;
    if (Array.isArray(res.kyc)) return res.kyc;
    if (Array.isArray(res.logs)) return res.logs;
    if (Array.isArray(res.activity_logs)) return res.activity_logs;
    return [];
  }

  const loadStats = async () => {
    try {
      const res = await apiCall<any>('/admin/dashboard', 'GET');
      if (res && res.success && res.data) {
        setStats(res.data);
      } else if (res && typeof res === 'object') {
        setStats((prev: any) => ({ ...prev, ...res }));
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const res = await apiCall<any>('/admin/activity-logs?days=1', 'GET');
      let list = extractArray(res);
      if (list.length === 0) {
        const fallbackRes = await apiCall<any>('/admin/activity-logs?days=7', 'GET');
        list = extractArray(fallbackRes);
      }
      setRecentActivity(list.slice(0, 5));
    } catch (err) {
      console.error('Failed to load recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProperties = async () => {
    try {
      setLoading(true);
      const res = await apiCall<any>('/admin/properties/pending', 'GET');
      let list = extractArray(res);
      if (list.length === 0) {
        const allRes = await apiCall<any>('/admin/properties', 'GET');
        const allList = extractArray(allRes);
        const filtered = allList.filter((p: any) => p.status === 'pending');
        if (filtered.length > 0) list = filtered;
      }
      setPendingProperties(list);
    } catch (err) {
      console.error('Failed to load pending properties:', err);
      setPendingProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAgents = async () => {
    try {
      setLoading(true);
      const res = await apiCall<any>('/admin/agents/pending', 'GET');
      let list = extractArray(res);
      if (list.length === 0) {
        const usersRes = await apiCall<any>('/admin/users?role=agent', 'GET');
        const userList = extractArray(usersRes);
        const pending = userList.filter((u: any) => !u.is_verified || u.status === 'pending');
        if (pending.length > 0) list = pending;
      }
      setPendingAgents(list);
    } catch (err) {
      console.error('Failed to load pending agents:', err);
      setPendingAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingKYC = async () => {
    try {
      setLoading(true);
      const res = await apiCall<any>('/admin/kyc/pending', 'GET');
      let list = extractArray(res);
      if (list.length === 0) {
        const allKyc = await apiCall<any>('/admin/kyc', 'GET');
        const kycArray = extractArray(allKyc);
        const pending = kycArray.filter((k: any) => k.status === 'pending' || !k.verified);
        if (pending.length > 0) list = pending;
      }
      setKycList(list);
    } catch (err) {
      console.error('Failed to load pending KYC:', err);
      setKycList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProperties = async () => {
    try {
      setLoading(true);
      const url = propertyStatusFilter
        ? `/admin/properties?status=${propertyStatusFilter}`
        : '/admin/properties';
      let res = await apiCall<any>(url, 'GET');
      let list = extractArray(res);

      // If empty or admin route didn't return data, fallback to public properties API
      if (list.length === 0) {
        const publicRes = await apiCall<any>('/properties/all?limit=100', 'GET');
        list = extractArray(publicRes);
        if (list.length === 0) {
          const baseRes = await apiCall<any>('/properties', 'GET');
          list = extractArray(baseRes);
        }
      }

      if (propertyStatusFilter && list.length > 0) {
        list = list.filter((p: any) => !p.status || p.status.toLowerCase() === propertyStatusFilter.toLowerCase());
      }

      setAllProperties(list);
    } catch (err) {
      console.error('Failed to load all properties:', err);
      setAllProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const url = userRoleFilter ? `/admin/users?role=${userRoleFilter}` : '/admin/users';
      let res = await apiCall<any>(url, 'GET');
      let list = extractArray(res);
      if (list.length === 0 && !userRoleFilter) {
        const fallbackUsers = await apiCall<any>('/users', 'GET');
        list = extractArray(fallbackUsers);
      }
      if (userRoleFilter && list.length > 0) {
        list = list.filter((u: any) => u.role?.toLowerCase() === userRoleFilter.toLowerCase());
      }
      setAllUsers(list);
    } catch (err) {
      console.error('Failed to load all users:', err);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      let res = await apiCall<any>(`/admin/activity-logs?days=${logDaysFilter}`, 'GET');
      let list = extractArray(res);
      if (list.length === 0) {
        const fallbackRes = await apiCall<any>('/admin/logs', 'GET');
        list = extractArray(fallbackRes);
      }
      setActivityLogs(list);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (section: string) => {
    setActiveSection(section);
    if (section === 'overview') {
      loadStats();
      loadRecentActivity();
    } else if (section === 'pending-properties') {
      loadPendingProperties();
    } else if (section === 'pending-agents') {
      loadPendingAgents();
    } else if (section === 'kyc-verification') {
      loadPendingKYC();
    } else if (section === 'all-properties') {
      loadAllProperties();
    } else if (section === 'all-users') {
      loadAllUsers();
    } else if (section === 'activity-logs') {
      loadActivityLogs();
    }
    setSidebarOpen(false);
  };

  // Actions
  const approveProperty = async (id: string) => {
    try {
      const res = await apiCall(`/admin/properties/${id}/approve`, 'PUT');
      if (res.success) {
        alert('Property approved successfully');
        loadPendingProperties();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveAgent = async (id: string) => {
    try {
      const res = await apiCall(`/admin/agents/${id}/approve`, 'PUT');
      if (res.success) {
        alert('Agent approved successfully');
        loadPendingAgents();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitRejection = async () => {
    if (!rejectionModal.id || !rejectionModal.type) return;
    try {
      const url =
        rejectionModal.type === 'property'
          ? `/admin/properties/${rejectionModal.id}/reject`
          : `/admin/agents/${rejectionModal.id}/reject`;

      const res = await apiCall(url, 'PUT', { reason: rejectionModal.reason });
      if (res.success) {
        alert(`${rejectionModal.type} rejected successfully`);
        setRejectionModal({ open: false, type: null, id: null, reason: '' });
        if (rejectionModal.type === 'property') loadPendingProperties();
        else loadPendingAgents();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyKYC = async (id: string) => {
    try {
      const res = await apiCall(`/admin/kyc/${id}/verify`, 'PUT');
      if (res.success) {
        alert('KYC verified successfully');
        setKycModal({ open: false, item: null, rejectionOpen: false, rejectionReason: '' });
        loadPendingKYC();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitKYCRejection = async () => {
    if (!kycModal.item?.id) return;
    try {
      const res = await apiCall(`/admin/kyc/${kycModal.item.id}/reject`, 'PUT', {
        reason: kycModal.rejectionReason,
      });
      if (res.success) {
        alert('KYC rejected');
        setKycModal({ open: false, item: null, rejectionOpen: false, rejectionReason: '' });
        loadPendingKYC();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-body">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`} id="admin-sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <svg
              className="logo-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>PropertyHub Admin</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => handleNav('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Overview</span>
          </button>
          <button
            className={`sidebar-link ${activeSection === 'pending-properties' ? 'active' : ''}`}
            onClick={() => handleNav('pending-properties')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Pending Properties</span>
            {stats.pending_properties > 0 && (
              <span className="badge-count">{stats.pending_properties}</span>
            )}
          </button>
          <button
            className={`sidebar-link ${activeSection === 'pending-agents' ? 'active' : ''}`}
            onClick={() => handleNav('pending-agents')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
            <span>Pending Agents</span>
            {stats.pending_agents > 0 && <span className="badge-count">{stats.pending_agents}</span>}
          </button>
          <button
            className={`sidebar-link ${activeSection === 'kyc-verification' ? 'active' : ''}`}
            onClick={() => handleNav('kyc-verification')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>KYC Verification</span>
            {stats.pending_kyc > 0 && <span className="badge-count">{stats.pending_kyc}</span>}
          </button>
          <button
            className={`sidebar-link ${activeSection === 'all-properties' ? 'active' : ''}`}
            onClick={() => handleNav('all-properties')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>All Properties</span>
          </button>
          <button
            className={`sidebar-link ${activeSection === 'all-users' ? 'active' : ''}`}
            onClick={() => handleNav('all-users')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>All Users</span>
          </button>
          <button
            className={`sidebar-link ${activeSection === 'activity-logs' ? 'active' : ''}`}
            onClick={() => handleNav('activity-logs')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            <span>Activity Logs</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="admin-info">
              <p className="admin-name">{user?.username || 'Admin'}</p>
              <p className="admin-role">Administrator</p>
            </div>
          </div>
          <button
            className="btn-logout-sidebar"
            onClick={() => {
              clearAuth();
              router.push('/login');
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <button
            className="sidebar-toggle"
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div style={{ flex: 1 }}></div>

          <div className="topbar-actions">
            <Link href="/" className="btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              View Site
            </Link>
          </div>
        </div>

        {/* Content Body */}
        <div className="admin-content">
          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">Dashboard Overview</h1>
                  <p className="section-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <button onClick={() => { loadStats(); loadRecentActivity(); }} className="btn-secondary">
                  Refresh
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card gradient-blue">
                  <div className="stat-content">
                    <p className="stat-label">Total Users</p>
                    <h3 className="stat-value">{stats.total_users || 0}</h3>
                  </div>
                </div>
                <div className="stat-card gradient-green">
                  <div className="stat-content">
                    <p className="stat-label">Total Properties</p>
                    <h3 className="stat-value">{stats.total_properties || 0}</h3>
                  </div>
                </div>
                <div className="stat-card gradient-orange">
                  <div className="stat-content">
                    <p className="stat-label">Pending Approvals</p>
                    <h3 className="stat-value">{stats.pending_approvals || 0}</h3>
                  </div>
                </div>
                <div className="stat-card gradient-purple">
                  <div className="stat-content">
                    <p className="stat-label">Total Agents</p>
                    <h3 className="stat-value">{stats.total_agents || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="overview-grid" style={{ marginTop: '2rem' }}>
                <div className="quick-actions-card">
                  <h3 className="card-title">Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => handleNav('pending-properties')}>
                      <span>Review Properties</span>
                    </button>
                    <button className="action-btn" onClick={() => handleNav('pending-agents')}>
                      <span>Approve Agents</span>
                    </button>
                    <button className="action-btn" onClick={() => handleNav('all-users')}>
                      <span>Manage Users</span>
                    </button>
                    <button className="action-btn" onClick={() => handleNav('activity-logs')}>
                      <span>View Activity</span>
                    </button>
                  </div>
                </div>

                <div className="recent-activity-card">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="activity-list">
                    {recentActivity.length === 0 ? (
                      <p style={{ color: 'var(--admin-muted)', padding: '1rem', margin: 0 }}>No recent activity</p>
                    ) : (
                      recentActivity.map((act, idx) => (
                        <div key={idx} className="activity-item">
                          <div className="activity-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div className="activity-details">
                            <p className="activity-title">{act.action || act.description}</p>
                            <p className="activity-time">{formatDate(act.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PENDING PROPERTIES */}
          {activeSection === 'pending-properties' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">Pending Properties</h1>
                  <p className="section-subtitle">Review and approve property listings</p>
                </div>
                <button onClick={loadPendingProperties} className="btn-secondary">
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading pending properties...</p>
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No pending properties</h3>
                  <p>All submitted properties have been reviewed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingProperties.map((prop) => (
                    <div key={prop.id} className="admin-card-item">
                      <div>
                        <h4 className="admin-card-title">{prop.title}</h4>
                        <p className="admin-card-subtitle">
                          📍 {prop.location} • <strong>{formatCurrency(prop.price)}</strong> • Agent: {prop.agent_name || prop.user_id}
                        </p>
                        <span className="admin-card-meta">Submitted: {formatDate(prop.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href={`/property?id=${prop.id}`} className="btn-secondary btn-sm" target="_blank">
                          View
                        </Link>
                        <button
                          onClick={() => approveProperty(prop.id)}
                          className="btn-primary btn-sm"
                          style={{ background: '#10b981' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectionModal({ open: true, type: 'property', id: prop.id, reason: '' })}
                          className="btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PENDING AGENTS */}
          {activeSection === 'pending-agents' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">Pending Agents</h1>
                  <p className="section-subtitle">Review and approve agent registrations</p>
                </div>
                <button onClick={loadPendingAgents} className="btn-secondary">
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading pending agents...</p>
                </div>
              ) : pendingAgents.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No pending agents</h3>
                  <p>All agent applications have been reviewed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingAgents.map((ag) => (
                    <div key={ag.id} className="admin-card-item">
                      <div>
                        <h4 className="admin-card-title">
                          {ag.first_name} {ag.last_name} (@{ag.username})
                        </h4>
                        <p className="admin-card-subtitle">
                          ✉️ {ag.email} • 📞 {ag.phone_number || 'N/A'}
                        </p>
                        <span className="admin-card-meta">Registered: {formatDate(ag.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => approveAgent(ag.id)}
                          className="btn-primary btn-sm"
                          style={{ background: '#10b981' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectionModal({ open: true, type: 'agent', id: ag.id, reason: '' })}
                          className="btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* KYC VERIFICATION */}
          {activeSection === 'kyc-verification' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">KYC Verification</h1>
                  <p className="section-subtitle">Review agent KYC submissions and documents</p>
                </div>
                <button onClick={loadPendingKYC} className="btn-secondary">
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading KYC submissions...</p>
                </div>
              ) : kycList.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No pending KYC submissions</h3>
                  <p>All submissions have been verified.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {kycList.map((k) => (
                    <div key={k.id} className="admin-card-item">
                      <div>
                        <h4 className="admin-card-title">{k.agent_name || k.full_name}</h4>
                        <p className="admin-card-subtitle">
                          ID Type: <strong>{k.id_type || 'Government ID'}</strong> • ID Number: <strong>{k.id_number}</strong>
                        </p>
                        <span className="admin-card-meta">Submitted: {formatDate(k.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => setKycModal({ open: true, item: k, rejectionOpen: false, rejectionReason: '' })}
                          className="btn-secondary btn-sm"
                        >
                          Review KYC
                        </button>
                        <button
                          onClick={() => verifyKYC(k.id)}
                          className="btn-primary btn-sm"
                          style={{ background: '#10b981' }}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ALL PROPERTIES */}
          {activeSection === 'all-properties' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">All Properties</h1>
                  <p className="section-subtitle">Manage all property listings on the platform</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={propertyStatusFilter}
                    onChange={(e) => {
                      setPropertyStatusFilter(e.target.value);
                      loadAllProperties();
                    }}
                    className="form-select"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={loadAllProperties} className="btn-secondary">
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading properties...</p>
                </div>
              ) : allProperties.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No properties found</h3>
                  <p>There are currently no property listings matching your filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {allProperties.map((p) => (
                    <div key={p.id} className="admin-card-item">
                      <div>
                        <h4 className="admin-card-title">{p.title}</h4>
                        <p className="admin-card-subtitle">
                          📍 {p.location} • <strong>{formatCurrency(p.price)}</strong> • Status:{' '}
                          <span className={`badge badge-${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'}`}>
                            {p.status || 'active'}
                          </span>
                        </p>
                      </div>
                      <Link href={`/property?id=${p.id}`} className="btn-secondary btn-sm" target="_blank">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ALL USERS */}
          {activeSection === 'all-users' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">All Users</h1>
                  <p className="section-subtitle">Manage registered accounts and roles</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      loadAllUsers();
                    }}
                    className="form-select"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px' }}
                  >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="agent">Agents</option>
                    <option value="admin">Admins</option>
                  </select>
                  <button onClick={loadAllUsers} className="btn-secondary">
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading users...</p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No users found</h3>
                  <p>There are currently no registered users matching your filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {allUsers.map((u) => (
                    <div key={u.id} className="admin-card-item">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                          <h4 className="admin-card-title">
                            {u.first_name || ''} {u.last_name || ''} (@{u.username})
                          </h4>
                          <span className={`badge badge-${u.role === 'admin' ? 'admin' : u.role === 'agent' ? 'agent' : 'buyer'}`}>
                            {u.role}
                          </span>
                          <span className={`badge badge-${u.is_verified ? 'approved' : 'secondary'}`}>
                            {u.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <p className="admin-card-subtitle">
                          ✉️ {u.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ACTIVITY LOGS */}
          {activeSection === 'activity-logs' && (
            <section className="content-section active">
              <div className="section-header">
                <div>
                  <h1 className="section-title">Activity Logs</h1>
                  <p className="section-subtitle">Track system events and audit logs</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={logDaysFilter}
                    onChange={(e) => {
                      setLogDaysFilter(e.target.value);
                      loadActivityLogs();
                    }}
                    className="form-select"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px' }}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                  <button onClick={loadActivityLogs} className="btn-secondary">
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading activity logs...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No activity logs recorded</h3>
                  <p>No activity logs found for the selected time range.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activityLogs.map((log, idx) => (
                    <div key={idx} className="admin-card-item" style={{ padding: '1rem 1.25rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--admin-text)' }}>
                          {log.action || log.description}
                        </p>
                        <span className="admin-card-meta">
                          User: <strong>{log.user_id || 'System'}</strong> • {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* REJECTION MODAL */}
      {rejectionModal.open && (
        <div className="modal" style={{ display: 'flex' }}>
          <div
            className="modal-overlay"
            onClick={() => setRejectionModal({ open: false, type: null, id: null, reason: '' })}
          ></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Rejection Reason</h3>
              <button
                className="modal-close"
                onClick={() => setRejectionModal({ open: false, type: null, id: null, reason: '' })}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                className="form-textarea"
                placeholder="Enter detailed reason for rejection..."
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
              ></textarea>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setRejectionModal({ open: false, type: null, id: null, reason: '' })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={submitRejection} className="btn-danger" style={{ background: '#ef4444', color: 'white' }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC DETAILS MODAL */}
      {kycModal.open && kycModal.item && (
        <div className="modal" style={{ display: 'flex' }}>
          <div
            className="modal-overlay"
            onClick={() => setKycModal({ open: false, item: null, rejectionOpen: false, rejectionReason: '' })}
          ></div>
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3 className="modal-title">KYC Verification Details</h3>
              <button
                className="modal-close"
                onClick={() => setKycModal({ open: false, item: null, rejectionOpen: false, rejectionReason: '' })}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Agent Name:</strong> {kycModal.item.agent_name || kycModal.item.full_name}</p>
              <p><strong>ID Type:</strong> {kycModal.item.id_type}</p>
              <p><strong>ID Number:</strong> {kycModal.item.id_number}</p>
              <p><strong>Address:</strong> {kycModal.item.address || 'N/A'}</p>
              {kycModal.item.document_url && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Document Preview:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={kycModal.item.document_url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                      View Uploaded Document ↗
                    </a>
                  </div>
                </div>
              )}

              {kycModal.rejectionOpen && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reason for Rejection:</label>
                  <textarea
                    value={kycModal.rejectionReason}
                    onChange={(e) => setKycModal({ ...kycModal, rejectionReason: e.target.value })}
                    rows={3}
                    className="form-textarea"
                    placeholder="Enter reason..."
                    style={{ width: '100%', padding: '0.5rem' }}
                  ></textarea>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={submitKYCRejection} className="btn-danger btn-sm" style={{ background: '#ef4444', color: 'white' }}>
                      Submit Rejection
                    </button>
                    <button onClick={() => setKycModal({ ...kycModal, rejectionOpen: false })} className="btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setKycModal({ open: false, item: null, rejectionOpen: false, rejectionReason: '' })}
                className="btn-secondary"
              >
                Close
              </button>
              {!kycModal.rejectionOpen && (
                <button
                  onClick={() => setKycModal({ ...kycModal, rejectionOpen: true })}
                  className="btn-danger"
                  style={{ background: '#ef4444', color: 'white' }}
                >
                  Reject KYC
                </button>
              )}
              <button
                onClick={() => verifyKYC(kycModal.item.id)}
                className="btn-success"
                style={{ background: '#10b981', color: 'white' }}
              >
                Verify KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
