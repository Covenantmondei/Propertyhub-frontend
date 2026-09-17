'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import { apiCall, getAuthHeaders, API_BASE_URL } from '@/lib/api';

export default function KYCVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    phone_number: '',
    company: '',
    id_type: 'national_id',
    id_number: '',
  });

  // Files
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getStoredUser();
    if (user?.role !== 'agent') {
      router.push('/home');
      return;
    }

    async function loadStatus() {
      try {
        const res = await apiCall<any>('/kyc/status', 'GET');
        if (res.success && res.data) {
          setKycStatus(res.data);
          if (res.data.phone_number) {
            setFormData({
              phone_number: res.data.phone_number || '',
              company: res.data.company || '',
              id_type: res.data.id_type || 'national_id',
              id_number: res.data.id_number || '',
            });
          }
          if (res.data.government_id_url) setIdPreview(res.data.government_id_url);
          if (res.data.selfie_url) setSelfiePreview(res.data.selfie_url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIdPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelfieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSelfiePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiCall('/kyc/submit', 'POST', formData);
      if (res.success) {
        setStep(2);
      } else {
        alert(res.error || 'Failed to save information');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving personal info');
    }
  };

  const handleFinalSubmit = async () => {
    if (!agreeTerms) {
      alert('Please agree to the verification terms.');
      return;
    }

    try {
      setSubmitting(true);
      if (idFile || selfieFile) {
        const data = new FormData();
        if (idFile) data.append('government_id', idFile);
        if (selfieFile) data.append('selfie', selfieFile);

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const res = await fetch(`${API_BASE_URL}/kyc/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to upload verification documents');
        }
      }

      alert('KYC submitted successfully! You will be notified once reviewed.');
      router.push('/agent-dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppNav activePage="home" />
        <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
          <div className="spinner-large" style={{ margin: '0 auto 1.5rem auto' }}></div>
          <p>Loading KYC status...</p>
        </div>
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <AppNav activePage="home" />
      <div className="container" style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Agent Identity Verification (KYC)</h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
          Verify your identity to list properties, schedule viewings, and receive inquiries.
        </p>

        {/* Status Banner */}
        {kycStatus?.kyc_status === 'pending_review' && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <strong>⏳ Verification Pending</strong>: Your submission is currently under review by our admin team.
          </div>
        )}
        {kycStatus?.kyc_status === 'verified' && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <strong>✓ Verified Agent</strong>: Your KYC verification has been approved!
          </div>
        )}
        {kycStatus?.kyc_status === 'rejected' && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <strong>✕ Verification Rejected</strong>: {kycStatus?.kyc_rejection_reason || 'Please check and resubmit.'}
          </div>
        )}

        {/* Stepper Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          {[
            { num: 1, title: 'Personal Info' },
            { num: 2, title: 'Document Upload' },
            { num: 3, title: 'Review & Submit' },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: step === s.num ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: step === s.num ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (s.num <= step) setStep(s.num);
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step >= s.num ? 'var(--primary)' : 'var(--muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                }}
              >
                {s.num}
              </div>
              <span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+234 800 000 0000"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label className="form-label">Real Estate Agency / Company Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Realty Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label className="form-label">Government ID Type</label>
              <select
                className="form-select"
                value={formData.id_type}
                onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="national_id">National Identity Number (NIN / National ID)</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
              </select>
            </div>

            <div>
              <label className="form-label">ID Number</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter ID number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.875rem', marginTop: '1rem' }}>
              Save & Proceed to Document Upload →
            </button>
          </form>
        )}

        {/* STEP 2: Document Upload */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Government ID */}
            <div style={{ border: '2px dashed var(--border)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. Upload Government ID</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Upload a clear image or PDF of your selected ID document (Max 5MB)
              </p>
              {idPreview ? (
                <div>
                  <img src={idPreview} alt="ID Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                  <button onClick={() => { setIdFile(null); setIdPreview(null); }} className="btn-secondary btn-sm">
                    Remove & Re-upload
                  </button>
                </div>
              ) : (
                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Choose ID File
                  <input type="file" accept="image/*,.pdf" onChange={handleIdFile} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Selfie with ID */}
            <div style={{ border: '2px dashed var(--border)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. Upload Selfie with ID</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Hold your ID next to your face clearly showing your face and ID details.
              </p>
              {selfiePreview ? (
                <div>
                  <img src={selfiePreview} alt="Selfie Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                  <button onClick={() => { setSelfieFile(null); setSelfiePreview(null); }} className="btn-secondary btn-sm">
                    Remove & Re-upload
                  </button>
                </div>
              ) : (
                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Choose Selfie File
                  <input type="file" accept="image/*" onChange={handleSelfieFile} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!idPreview || !selfiePreview) {
                    alert('Please provide both the ID document and the selfie.');
                    return;
                  }
                  setStep(3);
                }}
                className="btn-primary"
              >
                Proceed to Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Verification Summary</h3>
              <p><strong>Phone:</strong> {formData.phone_number}</p>
              <p><strong>Company:</strong> {formData.company || 'Not provided'}</p>
              <p><strong>ID Type:</strong> {formData.id_type.replace('_', ' ').toUpperCase()}</p>
              <p><strong>ID Number:</strong> {formData.id_number}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <strong>Government ID:</strong>
                  {idPreview && <img src={idPreview} alt="ID" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />}
                </div>
                <div>
                  <strong>Selfie with ID:</strong>
                  {selfiePreview && <img src={selfiePreview} alt="Selfie" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="agree" style={{ fontSize: '0.875rem' }}>
                I confirm that all provided information and documents are valid, authentic, and belong to me.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Submitting Verification...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
      <AppFooter />
    </>
  );
}
