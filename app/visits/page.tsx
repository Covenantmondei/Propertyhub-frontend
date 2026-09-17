'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!localStorage.getItem('authToken')) { router.replace('/login'); return; }
    loadVisits();
  }, []);

  useEffect(() => {
    if (activeStatus === 'all') setFiltered(visits);
    else setFiltered(visits.filter(v => v.status === activeStatus));
  }, [activeStatus, visits]);

  async function loadVisits() {
    setLoading(true);
    try {
      const data = await apiCall('/visits/my-visits');
      setVisits(data);
      setFiltered(data);
    } catch {} finally { setLoading(false); }
  }

  async function cancelVisit(id: number) {
    if (!confirm('Cancel this visit?')) return;
    try {
      await apiCall(`/visits/${id}/cancel`, { method: 'PUT' });
      loadVisits();
    } catch (err: any) { alert(err.message || 'Failed to cancel'); }
  }

  const statusTabs: VisitStatus[] = ['all', 'pending', 'confirmed', 'proposed_reschedule', 'completed', 'cancelled'];

  return (
    <>
      <AppNav />
      <main className="visits-main">
        <div className="container">
          <div className="visits-header">
            <h1>My Property Visits</h1>
            <p className="subtitle">Manage your property visit requests and schedules</p>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {statusTabs.map(s => (
              <button key={s} className={`filter-tab${activeStatus === s ? ' active' : ''}`} data-status={s} onClick={() => setActiveStatus(s)}>
                {s === 'all' ? 'All Visits' : s === 'proposed_reschedule' ? 'Reschedule Proposed' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div id="loading-state" className="loading-state"><p>Loading your visits...</p></div>
          ) : filtered.length === 0 ? (
            <div id="empty-state" className="empty-state">
              <h3>No visit requests yet</h3>
              <p>Browse properties and schedule visits to view them here</p>
              <a href="/properties" className="btn btn-primary">Browse Properties</a>
            </div>
          ) : (
            <div id="visits-list" className="visits-list">
              {filtered.map(visit => (
                <div key={visit.id} className="visit-card">
                  <div className="visit-info">
                    <h3>{visit.property?.title || 'Property Visit'}</h3>
                    <p className="visit-date">📅 {visit.preferred_date} at {visit.preferred_time}</p>
                    <span className={`badge badge-${visit.status}`}>{visit.status.replace('_', ' ')}</span>
                  </div>
                  <div className="visit-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedVisit(visit)}>View Details</button>
                    {visit.status === 'pending' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelVisit(visit.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visit Details Modal */}
          {selectedVisit && (
            <div className="modal" style={{ display: 'flex' }}>
              <div className="modal-content modal-large">
                <div className="modal-header">
                  <h2>Visit Details</h2>
                  <button className="modal-close" onClick={() => setSelectedVisit(null)}>✕</button>
                </div>
                <div className="modal-body" id="visit-details-body">
                  <p><strong>Property:</strong> {selectedVisit.property?.title}</p>
                  <p><strong>Date:</strong> {selectedVisit.preferred_date}</p>
                  <p><strong>Time:</strong> {selectedVisit.preferred_time}</p>
                  <p><strong>Status:</strong> {selectedVisit.status}</p>
                  {selectedVisit.notes && <p><strong>Notes:</strong> {selectedVisit.notes}</p>}
                  {selectedVisit.status === 'proposed_reschedule' && (
                    <div>
                      <p><strong>Proposed New Time:</strong> {selectedVisit.proposed_date} at {selectedVisit.proposed_time}</p>
                      <div className="modal-actions" style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={async () => {
                          try {
                            await apiCall(`/visits/${selectedVisit.id}/accept-reschedule`, { method: 'PUT' });
                            setSelectedVisit(null); loadVisits();
                          } catch {}
                        }}>Confirm New Time</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </>
  );
}
