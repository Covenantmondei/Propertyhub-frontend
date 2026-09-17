'use client';

import { useState } from 'react';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <AppNav activePage="home" />
      <div className="page-wrapper" style={{ padding: '3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Contact Us
            </h1>
            <p className="page-subtitle" style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)' }}>
              Have questions, feedback, or need assistance? We're here to help.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Contact Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Office Location</h3>
                <p style={{ color: 'var(--muted-foreground)' }}>Victoria Island, Lagos State, Nigeria</p>
              </div>

              <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Us</h3>
                <p style={{ color: 'var(--muted-foreground)' }}>support@propertyhub.com</p>
                <p style={{ color: 'var(--muted-foreground)' }}>info@propertyhub.com</p>
              </div>

              <div style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Call Us</h3>
                <p style={{ color: 'var(--muted-foreground)' }}>+234 800 PROPERTY (0800 776 7378)</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Mon - Fri: 8am - 6pm WAT</p>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                    Thank you for reaching out. Our support team will get back to you shortly.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary btn-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">Message</label>
                    <textarea
                      required
                      rows={4}
                      className="form-textarea"
                      placeholder="Type your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '0.75rem', marginTop: '0.5rem', borderRadius: '8px' }}
                  >
                    {loading ? 'Sending message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
