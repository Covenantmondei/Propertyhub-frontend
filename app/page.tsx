'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuth } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  
  // Stats counter state
  const [stats, setStats] = useState({ properties: 0, agents: 0, cities: 0, buyers: 0 });
  const [hasAnimatedStats, setHasAnimatedStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Doc card auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDocIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Testimonials rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Intersection observer for stats
  useEffect(() => {
    if (!statsRef.current || hasAnimatedStats) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedStats) {
          setHasAnimatedStats(true);
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setStats({
              properties: Math.floor(5000 * progress),
              agents: Math.floor(500 * progress),
              cities: Math.floor(25 * progress),
              buyers: Math.floor(10000 * progress),
            });
            if (step >= steps) {
              setStats({ properties: 5000, agents: 500, cities: 25, buyers: 10000 });
              clearInterval(timer);
            }
          }, interval);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimatedStats]);

  const testimonials = [
    {
      quote: '"Found my dream home in just two weeks! The verified listings and direct agent communication made the entire process smooth and stress-free."',
      author: 'Adaeze Okonkwo',
      company: 'First-time Homebuyer, Lagos',
      initials: 'AO',
    },
    {
      quote: '"As an agent, PropertyHub has transformed my business. I\'ve closed more deals in 3 months than I did all last year. The platform is simply outstanding."',
      author: 'Chukwudi Nwosu',
      company: 'Real Estate Agent, Abuja',
      initials: 'CN',
    },
    {
      quote: '"Listed my property and got serious inquiries within 24 hours. The admin verification gives buyers confidence, and the dashboard is incredibly easy to use."',
      author: 'Oluwaseun Balogun',
      company: 'Property Investor, Port Harcourt',
      initials: 'OB',
    },
  ];

  const faqs = [
    {
      q: 'Is PropertyHub free to use?',
      a: 'Yes! Browsing properties and creating a buyer account is completely free. Agents have flexible listing plans with premium options for enhanced visibility and additional features.',
    },
    {
      q: 'How are agents verified on the platform?',
      a: 'All agents undergo a thorough verification process by our admin team. We verify credentials, business registration, and conduct background checks to ensure only legitimate professionals list properties on our platform.',
    },
    {
      q: 'Are all property listings authentic?',
      a: 'Yes! Every property listing goes through admin approval before going live. We verify documents, cross-check information, and ensure all listings meet our quality standards to protect buyers from fraud.',
    },
    {
      q: 'Can I list my property on PropertyHub?',
      a: 'Absolutely! Register as an agent, complete the verification process, and you\'ll be able to list unlimited properties. Our easy-to-use dashboard makes property management simple and efficient.',
    },
    {
      q: 'How do I contact agents about a property?',
      a: 'Simply click on any property you\'re interested in and use our built-in chat system to message the agent directly. You\'ll receive instant notifications and can schedule viewings right through the platform.',
    },
    {
      q: 'What areas does PropertyHub cover?',
      a: 'We cover 25+ major cities across Nigeria including Lagos, Abuja, Port Harcourt, Ibadan, Kano, and more. We\'re constantly expanding to new locations based on user demand.',
    },
  ];

  return (
    <>
      {/* Navigation Header */}
      <header className="header">
        <div className="header-line"></div>
        <nav className="nav-container">
          <div className="nav-content">
            <Link href="/" className="logo">
              PropertyHub
            </Link>
            <button
              className="mobile-menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <li>
                <Link href="/properties">Properties</Link>
              </li>
              <li>
                <a href="#howitworks">How It Works</a>
              </li>
              <li>
                <a href="#testimonials">Testimonials</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
            <div className={`nav-cta ${mobileMenuOpen ? 'active' : ''}`} ref={dropdownRef}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    href={user.role === 'agent' ? '/agent-dashboard' : user.role === 'admin' ? '/admin' : '/home'}
                    className="btn-primary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      clearAuth();
                      setUser(null);
                      router.push('/login');
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className={`dropdown ${dropdownOpen ? 'active' : ''}`}>
                  <button
                    className="btn-secondary dropdown-toggle"
                    id="authDropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    Sign In
                    <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="dropdown-menu" id="authDropdownMenu">
                    <div className="dropdown-section">
                      <div className="dropdown-header">Create Account</div>
                      <Link href="/login" className="dropdown-item">
                        <svg className="dropdown-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M23 21v-2a4 4 0 0 0-3-3.87"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 3.13a4 4 0 0 1 0 7.75"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div>
                          <div className="dropdown-item-title">Sign up as Agent</div>
                          <div className="dropdown-item-desc">List & manage properties</div>
                        </div>
                      </Link>
                      <Link href="/login" className="dropdown-item">
                        <svg className="dropdown-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <div>
                          <div className="dropdown-item-title">Sign up as Buyer</div>
                          <div className="dropdown-item-desc">Browse & buy properties</div>
                        </div>
                      </Link>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section">
                      <Link href="/login" className="dropdown-item highlight">
                        <svg className="dropdown-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="10 17 15 12 10 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="15"
                            y1="12"
                            x2="3"
                            y2="12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div>
                          <div className="dropdown-item-title">Already have an account?</div>
                          <div className="dropdown-item-desc">Login to your account</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="page-wrapper landing-body">
        {/* Left vertical line */}
        <div className="vertical-line left"></div>
        
        {/* Right vertical line */}
        <div className="vertical-line right"></div>

        {/* Hero Section */}
        <section className="hero-section" id="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Find Your Perfect Property with PropertyHub</h1>
              <p className="hero-description">
                Discover verified properties, connect with trusted agents, and experience seamless property management
                on Nigeria's premier real estate platform.
              </p>
              <div className="hero-cta">
                <Link href="/properties" className="btn-primary">
                  Browse Properties
                </Link>
                <Link href="/login" className="btn-outline">
                  List Your Property
                </Link>
              </div>
              <div className="hero-image-wrapper">
                <img
                  src="https://i.pinimg.com/1200x/77/7a/6f/777a6fb95e0bcf8d28c63bf4029fa734.jpg"
                  alt="Modern Property"
                  className="hero-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Smart Discovery Section */}
        <section className="feature-section section-border" id="features">
          <div className="container-wide">
            <div className="feature-grid">
              <div className="feature-text">
                <span className="badge">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="3" fill="#37322F" />
                  </svg>
                  <span>Smart · Verified · Trusted</span>
                </span>
                <h2 className="section-title">Smart property discovery made easy</h2>
                <p className="section-description">
                  Find your ideal property with advanced filters, verified listings, and real-time availability. Search
                  by location, price range, property type, and more with our intelligent search system.
                </p>
              </div>
              <div className="feature-visual">
                <div className="feature-image-container">
                  <img
                    src="https://i.pinimg.com/736x/b1/d2/4f/b1d24f5de0a156ec765aa6326e410904.jpg"
                    alt="Property Search Features"
                    className="feature-image"
                  />
                  <div className="feature-overlay">
                    <div className="overlay-card">
                      <span className="overlay-icon">🔍</span>
                      <span className="overlay-text">Advanced Search</span>
                    </div>
                    <div className="overlay-card">
                      <span className="overlay-icon">✓</span>
                      <span className="overlay-text">Verified Listings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Messaging Section */}
        <section className="feature-section section-border">
          <div className="container-wide">
            <div className="feature-grid reverse">
              <div className="feature-visual">
                <div className="feature-image-container">
                  <img
                    src="https://i.pinimg.com/1200x/76/67/7b/76677b46833363288bc7a075456a1cab.jpg"
                    alt="Chat and Communication"
                    className="feature-image"
                  />
                  <div className="chat-badge">
                    <span className="badge-icon">💬</span>
                    <span className="badge-text">Real-time Messaging</span>
                  </div>
                </div>
              </div>
              <div className="feature-text">
                <span className="badge">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="#37322F" strokeWidth="1.5" />
                  </svg>
                  <span>Seamless Connection</span>
                </span>
                <h2 className="section-title">Connect buyers and agents instantly</h2>
                <p className="section-description">
                  Bridge the gap between property seekers and trusted agents. Chat in real-time, schedule viewings, and
                  close deals faster with our integrated communication platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Platform Section */}
        <section className="integration-section section-border">
          <div className="container-wide">
            <div className="feature-grid">
              <div className="feature-text">
                <span className="badge">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="#37322F" strokeWidth="1" fill="none" />
                    <circle cx="6" cy="6" r="2" fill="#37322F" />
                  </svg>
                  <span>Complete Platform</span>
                </span>
                <h2 className="section-title">Everything you need in one place</h2>
                <p className="section-description">
                  From property search to secure messaging, favorites management to admin verification - all the tools
                  you need for a seamless real estate experience.
                </p>
              </div>
              <div className="feature-visual">
                <div className="feature-image-container">
                  <img
                    src="https://i.pinimg.com/736x/4d/18/db/4d18dbcd2fce51b2c0a650f393d8b4d7.jpg"
                    alt="Platform Dashboard"
                    className="feature-image"
                  />
                  <div className="platform-stats">
                    <div className="stat-badge">🏠 Search</div>
                    <div className="stat-badge">💬 Chat</div>
                    <div className="stat-badge">⭐ Reviews</div>
                    <div className="stat-badge">✓ Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers Section */}
        <section className="stats-section section-border" ref={statsRef}>
          <div className="container-wide">
            <div className="stats-showcase">
              <div className="showcase-images">
                <img
                  src="https://i.pinimg.com/736x/25/30/43/253043c53e1104838cf001a28452a543.jpg"
                  alt="Featured Property 1"
                  className="showcase-img showcase-img-1"
                />
                <img
                  src="https://i.pinimg.com/1200x/9b/42/d7/9b42d731fb195de92c4961e7aaaf63a2.jpg"
                  alt="Featured Property 2"
                  className="showcase-img showcase-img-2"
                />
                <img
                  src="https://i.pinimg.com/1200x/b9/94/82/b99482984e4f7a22d5692d425382b155.jpg"
                  alt="Featured Property 3"
                  className="showcase-img showcase-img-3"
                />
              </div>
            </div>
            <div className="stats-header">
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2v6" stroke="#37322F" strokeWidth="1.5" />
                </svg>
                <span>Our Impact</span>
              </span>
              <h2 className="section-title">Nigeria's fastest growing property platform</h2>
              <p className="section-description">
                Join thousands of buyers, sellers, and agents who trust PropertyHub for their real estate needs
              </p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.properties.toLocaleString()}+</div>
                <div className="stat-label">Properties Listed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.agents.toLocaleString()}+</div>
                <div className="stat-label">Verified Agents</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.cities}+</div>
                <div className="stat-label">Cities Covered</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.buyers.toLocaleString()}+</div>
                <div className="stat-label">Happy Buyers</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="documentation-section section-border" id="howitworks">
          <div className="container-wide">
            <div className="docs-header">
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="#37322F" strokeWidth="1" />
                </svg>
                <span>How It Works</span>
              </span>
              <h2 className="section-title">Your journey to finding the perfect property</h2>
              <p className="section-description">
                Simple steps to buy, rent, or list properties on PropertyHub.
                <br />
                Get started in minutes and join thousands of satisfied users.
              </p>
            </div>
            <div className="docs-content">
              <div className="docs-cards">
                <div
                  className={`doc-card ${activeDocIndex === 0 ? 'active' : ''}`}
                  onClick={() => setActiveDocIndex(0)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="progress-bar"></div>
                  <div className="doc-card-content">
                    <h3>Sign up as buyer or agent</h3>
                    <p>
                      Create your free account and complete
                      <br />
                      your profile in minutes.
                    </p>
                  </div>
                </div>
                <div
                  className={`doc-card ${activeDocIndex === 1 ? 'active' : ''}`}
                  onClick={() => setActiveDocIndex(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="progress-bar"></div>
                  <div className="doc-card-content">
                    <h3>Browse or list properties</h3>
                    <p>
                      Search verified listings or list your
                      <br />
                      property for thousands to see.
                    </p>
                  </div>
                </div>
                <div
                  className={`doc-card ${activeDocIndex === 2 ? 'active' : ''}`}
                  onClick={() => setActiveDocIndex(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="progress-bar"></div>
                  <div className="doc-card-content">
                    <h3>Connect and close deals</h3>
                    <p>
                      Chat with agents, schedule viewings,
                      <br />
                      and finalize your property transaction.
                    </p>
                  </div>
                </div>
              </div>
              <div className="docs-preview">
                <img
                  src="https://i.pinimg.com/736x/73/a1/34/73a134533324ac70e9906063e67b3eb1.jpg"
                  alt="How it works steps visualization"
                  className="docs-preview-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section section-border" id="testimonials">
          <div className="container-wide">
            <div className="testimonial-wrapper">
              <div className="testimonial-content">
                <div className="testimonial-image">
                  {testimonials.map((t, idx) => (
                    <img
                      key={idx}
                      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23E5E7EB' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='64' fill='%236B7280'%3E${t.initials}%3C/text%3E%3C/svg%3E`}
                      alt={t.author}
                      className={`testimonial-img ${activeTestimonial === idx ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <div className="testimonial-text">
                  <div className="testimonial-quote-wrapper">
                    {testimonials.map((t, idx) => (
                      <blockquote
                        key={idx}
                        className={`testimonial-quote ${activeTestimonial === idx ? 'active' : ''}`}
                      >
                        {t.quote}
                      </blockquote>
                    ))}
                  </div>
                  <div className="testimonial-author-wrapper">
                    {testimonials.map((t, idx) => (
                      <div
                        key={idx}
                        className={`testimonial-author ${activeTestimonial === idx ? 'active' : ''}`}
                      >
                        <div className="author-name">{t.author}</div>
                        <div className="author-company">{t.company}</div>
                      </div>
                    ))}
                  </div>
                  <div className="testimonial-nav">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        className={`nav-dot ${activeTestimonial === idx ? 'active' : ''}`}
                        onClick={() => setActiveTestimonial(idx)}
                        aria-label={`Testimonial ${idx + 1}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section section-border" id="faq">
          <div className="container-wide">
            <div className="faq-grid">
              <div className="faq-header">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <p className="section-description">
                  Everything you need to know about buying, selling,
                  <br />
                  and listing properties on PropertyHub.
                </p>
              </div>
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div className={`faq-item ${openFaq === idx ? 'active' : ''}`} key={idx}>
                    <button
                      className="faq-question"
                      aria-expanded={openFaq === idx}
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      <svg className="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="m6 9 6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section section-border" id="pricing">
          <div className="container-wide">
            <div className="pricing-header">
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                    stroke="#37322F"
                    strokeWidth="1"
                  />
                </svg>
                <span>Agent Pricing</span>
              </span>
              <h2 className="section-title">Simple pricing for agents and sellers</h2>
              <p className="section-description">
                List properties and connect with thousands of buyers.
                <br />
                Free for buyers, flexible plans for agents.
              </p>
            </div>

            <div className="billing-toggle-wrapper">
              <div className="billing-toggle">
                <div className="billing-toggle-inner" data-period={billingPeriod}>
                  <button
                    className={`toggle-btn ${billingPeriod === 'annually' ? 'active' : ''}`}
                    onClick={() => setBillingPeriod('annually')}
                    type="button"
                  >
                    Annually
                  </button>
                  <button
                    className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => setBillingPeriod('monthly')}
                    type="button"
                  >
                    Monthly
                  </button>
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>

            <div className="pricing-cards">
              <div className="pricing-card">
                <div className="pricing-card-header">
                  <h3 className="plan-name">Buyer</h3>
                  <p className="plan-description">Perfect for home seekers and property investors.</p>
                </div>
                <div className="pricing-amount">
                  <span className="price">Free</span>
                  <span className="period"></span>
                </div>
                <ul className="feature-list">
                  <li>Browse all properties</li>
                  <li>Save favorites</li>
                  <li>Message agents</li>
                  <li>Schedule viewings</li>
                </ul>
                <Link href="/login" className="btn-outline">
                  Sign Up Free
                </Link>
              </div>

              <div className="pricing-card featured">
                <div className="featured-badge">Most Popular</div>
                <div className="pricing-card-header">
                  <h3 className="plan-name">Agent Standard</h3>
                  <p className="plan-description">For professional agents growing their portfolio.</p>
                </div>
                <div className="pricing-amount">
                  <span className="price">{billingPeriod === 'annually' ? 'NGN 12,000' : 'NGN 15,000'}</span>
                  <span className="period">/month</span>
                </div>
                <ul className="feature-list">
                  <li>List unlimited properties</li>
                  <li>Verified agent badge</li>
                  <li>Dashboard analytics</li>
                  <li>Priority support</li>
                  <li>Featured listings (5/month)</li>
                </ul>
                <Link href="/login" className="btn-primary">
                  Get Started
                </Link>
              </div>

              <div className="pricing-card">
                <div className="pricing-card-header">
                  <h3 className="plan-name">Agent Premium</h3>
                  <p className="plan-description">For established agencies and top-performing agents.</p>
                </div>
                <div className="pricing-amount">
                  <span className="price">{billingPeriod === 'annually' ? 'NGN 24,000' : 'NGN 30,000'}</span>
                  <span className="period">/month</span>
                </div>
                <ul className="feature-list">
                  <li>Everything in Standard</li>
                  <li>Unlimited featured listings</li>
                  <li>Homepage spotlight</li>
                  <li>Dedicated account manager</li>
                  <li>Custom branding</li>
                  <li>API access</li>
                </ul>
                <Link href="/login" className="btn-outline">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section section-border" id="cta">
          <div className="cta-background">
            <img
              src="https://placehold.co/1920x600/1e293b/fff?text=Find+Your+Dream+Home"
              alt="CTA Background"
              className="cta-bg-image"
            />
            <div className="cta-overlay"></div>
          </div>
          <div className="diagonal-pattern"></div>
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Find your next home today</h2>
              <p className="cta-description">
                Join thousands of buyers and agents who trust PropertyHub
                <br />
                for verified listings and seamless property transactions.
              </p>
              <div className="cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/properties" className="btn-primary">
                  Browse Properties
                </Link>
                <Link href="/login" className="btn-outline">
                  Become an Agent
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer-section">
          <div className="container-wide">
            <div className="footer-content">
              <div className="footer-brand">
                <h3 className="footer-logo">PropertyHub</h3>
                <p className="footer-tagline">Your trusted real estate platform</p>
                <div className="social-links">
                  <a href="#" aria-label="Twitter" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" fill="currentColor"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="GitHub" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.374-12-12-12z" fill="currentColor"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="footer-links">
                <div className="footer-column">
                  <h4>Properties</h4>
                  <ul>
                    <li>
                      <Link href="/properties">Browse All</Link>
                    </li>
                    <li>
                      <Link href="/properties?type=sale">For Sale</Link>
                    </li>
                    <li>
                      <Link href="/properties?type=rent">For Rent</Link>
                    </li>
                    <li>
                      <Link href="/properties?type=apartment">Apartments</Link>
                    </li>
                    <li>
                      <Link href="/properties?type=house">Houses</Link>
                    </li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>For Agents</h4>
                  <ul>
                    <li>
                      <Link href="/login">Agent Login</Link>
                    </li>
                    <li>
                      <Link href="/login">List Property</Link>
                    </li>
                    <li>
                      <a href="#pricing">Pricing Plans</a>
                    </li>
                    <li>
                      <a href="#howitworks">How It Works</a>
                    </li>
                    <li>
                      <a href="#">Agent Resources</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Company</h4>
                  <ul>
                    <li>
                      <Link href="/about">About Us</Link>
                    </li>
                    <li>
                      <a href="#testimonials">Testimonials</a>
                    </li>
                    <li>
                      <a href="#faq">FAQ</a>
                    </li>
                    <li>
                      <Link href="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Legal</h4>
                  <ul>
                    <li>
                      <Link href="/privacy">Privacy Policy</Link>
                    </li>
                    <li>
                      <Link href="/terms">Terms of Service</Link>
                    </li>
                    <li>
                      <Link href="/cookies">Cookie Policy</Link>
                    </li>
                    <li>
                      <Link href="/gdpr">GDPR</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p>&copy; 2025 PropertyHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
