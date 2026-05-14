import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();



  const images = [
    '/hero-1.png',
    '/hero-2.png',
    '/hero-3.png'
  ];

  const [currentImg, setCurrentImg] = useState(0);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [expandedTestimonial, setExpandedTestimonial] = useState(null);

  const toggleTestimonial = (id) => {
    setExpandedTestimonial(expandedTestimonial === id ? null : id);
  };

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/testimonials`);
        const data = await res.json();
        setTestimonials(data);
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/services`
        );
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?product_type=bike&limit=2`
        );
        const result = await res.json();
        // Extract array from { data: [...], meta: {...} } or handle raw array
        const items = result.data || (Array.isArray(result) ? result : []);
        setProducts(items);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getImgUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const base = apiUrl.replace('/api', '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  return (
    <div id="page-home" className="page">
      {/* HERO */}
      <section id="hero" className="full-screen-hero">
        <div className="hero-slideshow">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`hero-slide ${idx === currentImg ? 'active' : ''}`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-lines"></div>


        <div className="hero-content full-width">

          <p className="hero-sub">Crown Eve delivers premium motorcycles, expert servicing, and genuine parts  engineered for the road, built for the rider.</p>
          <div className="hero-ctas">
            <Link to="/shop" className="btn-primary">
              <span>Explore Bikes</span>
              <span className="arrow">→</span>
            </Link>
            {user && (
              <Link to="/appointments" className="btn-ghost">
                <span className="btn-ghost-line"></span>
                Book A Service
              </Link>
            )}
          </div>


        </div>


        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="scroll-text">Scroll</span>
        </div>

        {/* MARQUEE */}
        <div className="marquee-section">
          <div className="marquee-track">
            <span className="marquee-item"><span className="marquee-sep">✦</span> Crown Eve Bikes <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">Premium Parts</span>
            <span className="marquee-item"><span className="marquee-sep">✦</span> Expert Service <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">Nationwide Branches</span>
            <span className="marquee-item"><span className="marquee-sep">✦</span> Ride The Legacy <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">1700+ Genuine Parts</span>
            {/* Duplicate for infinite loop */}
            <span className="marquee-item"><span className="marquee-sep">✦</span> Crown Eve Bikes <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">Premium Parts</span>
            <span className="marquee-item"><span className="marquee-sep">✦</span> Expert Service <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">Nationwide Branches</span>
            <span className="marquee-item"><span className="marquee-sep">✦</span> Ride The Legacy <span className="marquee-sep">✦</span></span>
            <span className="marquee-item highlight">1700+ Genuine Parts</span>
          </div>
        </div>
      </section>



      {/* FEATURED PRODUCTS */}
      <section id="products">
        <div className="products-header">
          <div>
            <h2 className="section-title" style={{ color: 'var(--orange)' }}>Choose from<br /><span style={{ color: '#111111' }}>Our Best Models.</span></h2>
          </div>
          <Link to="/shop" className="view-all">View all bikes →</Link>
        </div>
        <div className="products-grid three-cols">
          {productsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="product-card-img" style={{ height: '300px', background: 'var(--black3)' }}></div>
                <div className="product-card-body">
                  <div style={{ height: '20px', width: '60%', background: 'var(--black3)', marginBottom: '10px' }}></div>
                  <div style={{ height: '30px', width: '80%', background: 'var(--black3)' }}></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.slice(0, 3).map((p) => (
              <div key={p.id} className="product-card bike-card-new" onClick={() => navigate(`/product/${p.id}`)}>
                <div className="product-card-img">
                  <div className="bike-card-blob"></div>
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={getImgUrl(p.images[0].url)}
                      alt={p.name}
                      className="bike-main-img"
                    />
                  ) : (
                    <div className="placeholder-img">[ {p.name} ]</div>
                  )}
                </div>
                <div className="product-card-body">
                  <h3 className="bike-name-new">{p.name}</h3>
                  <div className="bike-price-new">PKR {Number(p.price).toLocaleString()}</div>

                  <div className="bike-card-footer">
                    <span className="check-details">Check details</span>
                    <div className="arrow-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">Our latest collection is arriving soon.</div>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-label">
          <div className="section-label-line"></div>
          <span>What We Do</span>
        </div>
        <h2 className="section-title">Our<br /><span style={{ color: 'var(--orange)' }}>Services.</span></h2>
        <div className="services-layout">
          <div className="services-list">
            {servicesLoading ? (
              // Simple skeleton — shows while loading
              [...Array(5)].map((_, i) => (
                <div key={i} className="service-item" style={{ opacity: 0.4 }}>
                  <div className="service-item-left">
                    <span className="service-item-num">0{i + 1}</span>
                    <div>
                      <div className="service-item-name" style={{ background: 'rgba(0,0,0,0.05)', height: '16px', width: '160px', borderRadius: '4px' }} />
                      <div className="service-item-price" style={{ background: 'rgba(0,0,0,0.04)', height: '12px', width: '100px', borderRadius: '4px', marginTop: '6px' }} />
                    </div>
                  </div>
                </div>
              ))
            ) : services.length > 0 ? (
              services.slice(0, 6).map((service, i) => (
                <div key={service.id} className="service-item">
                  <div className="service-item-left">
                    <span className="service-item-num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="service-item-name">{service.name}</div>
                      <div className="service-item-price">
                        {service.price
                          ? `PKR ${Number(service.price).toLocaleString()}`
                          : service.description || 'Contact for pricing'}
                      </div>
                    </div>
                  </div>
                  <span className="service-item-icon">+</span>
                </div>
              ))
            ) : (
              // Fallback if no services in DB yet
              <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Services coming soon.</p>
            )}
          </div>
          <div className="services-cta-panel">
            <h3>Ready to<br /><span style={{ color: 'var(--orange)' }}>Ride</span><br />With Us?</h3>
            <p>Our certified technicians are ready to keep your ride in peak condition. Sign in to schedule online in under 2 minutes — choose your branch, pick a slot, and we handle the rest.</p>
            <Link to={user ? "/appointments" : "/login"} className="btn-primary">
              <span>{user ? "Book Now" : "Sign In to Book"}</span>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* BOOKING CTA BANNER */}
      <section id="booking" style={{ padding: '200px 5vw', position: 'relative', overflow: 'hidden' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="booking-video-bg"
        >
          <source src="/videos/ride-bg.webm" type="video/webm" />
        </video>
        <div className="booking-overlay"></div>

        <div className="booking-inner">
          <div className="booking-text">
            <h2>Ready to<br />Ride?</h2>
            <p>Browse our full catalog of premium bikes, genuine parts, and accessories. Find your next ride today.</p>
          </div>
          <Link to="/shop" className="btn-booking">Shop The Collection →</Link>
        </div>
      </section>

      {/* WHY EVEE SECTION */}
      <section id="why-evee">
        <div className="why-evee-container">
          <div className="why-evee-content">
            <h2 className="why-evee-title" style={{ color: 'var(--orange)' }}>WHY EVEE?</h2>
            <p className="why-evee-desc">
              Our high-quality, affordable rides empower you to reduce your carbon footprint while cruising in style and safety.
              Join us in transforming city travel, one electric ride at a time!
            </p>

            <div className="why-evee-features">
              <div className="why-evee-feat">
                <div className="feat-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div className="feat-info">
                  <h4>Quality</h4>
                  <p>Durable Construction.</p>
                </div>
              </div>
              <div className="why-evee-feat">
                <div className="feat-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
                <div className="feat-info">
                  <h4>Warranty</h4>
                  <p>Stress Free Claims.</p>
                </div>
              </div>
              <div className="why-evee-feat">
                <div className="feat-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="feat-info">
                  <h4>Service</h4>
                  <p>Door to Door Service.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="why-evee-visual">
            <div className="why-evee-img-wrapper">
              <img src="/1-3.png" alt="Evee Electric Scooter" className="scooter-visual" />
              <div className="evee-visual-overlay">
                <div className="evee-main-text-float">evee</div>
                <div className="evee-sub-text-float">I am Evee. Are you?</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="section-label">
          <div className="section-label-line"></div>
          <span>What Riders Say</span>
        </div>
        <h2 className="section-title">Trusted by<br /><span style={{ color: 'var(--orange)' }}>Riders.</span></h2>
        <div className="testimonials-grid">
          {testimonials.length > 0 ? (
            testimonials.slice(0, 3).map((t, idx) => (
              <div key={t.id || idx} className="testimonial-card">
                <div className="stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                <p 
                  className={`testimonial-text ${expandedTestimonial === (t.id || idx) ? 'expanded' : ''}`}
                  onClick={() => toggleTestimonial(t.id || idx)}
                >
                  "{t.text}"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name ? t.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK'}</div>
                  <div className="author-info">
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role || 'Rider'}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p 
                  className={`testimonial-text ${expandedTestimonial === 'fallback-1' ? 'expanded' : ''}`}
                  onClick={() => toggleTestimonial('fallback-1')}
                >
                  "Crown Eve is the only place I trust with my Duke. The technicians are certified, the parts are genuine, and the service is fast. Nothing compares."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">AK</div>
                  <div className="author-info">
                    <div className="author-name">Ali Kamran</div>
                    <div className="author-role">KTM Duke Owner, Lahore</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p 
                  className={`testimonial-text ${expandedTestimonial === 'fallback-2' ? 'expanded' : ''}`}
                  onClick={() => toggleTestimonial('fallback-2')}
                >
                  "Booked my full service online in 2 minutes. Got an update when the tech started and when it was done. This is how bike service should work."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">SH</div>
                  <div className="author-info">
                    <div className="author-name">Sara Hussain</div>
                    <div className="author-role">Yamaha R15 Owner, Karachi</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p 
                  className={`testimonial-text ${expandedTestimonial === 'fallback-3' ? 'expanded' : ''}`}
                  onClick={() => toggleTestimonial('fallback-3')}
                >
                  "1700+ parts in stock — I found an obscure OEM part for my 2019 model within 20 minutes of walking in. Incredible inventory and knowledgeable staff."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">MR</div>
                  <div className="author-info">
                    <div className="author-name">Muhammad Raza</div>
                    <div className="author-role">Honda CBR Owner, Islamabad</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon"><span>CE</span></div>
              <span className="logo-text">Crown <em>Eve</em></span>
            </Link>
            <p>Pakistan's premier motorcycle destination. Premium bikes, genuine parts, expert service — all in one place.</p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/shop">Shop Bikes</Link></li>
              <li><Link to="/shop">Parts Catalog</Link></li>
              {user && <li><Link to="/appointments">Book Service</Link></li>}
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Register</Link></li>
              {user && (
                <>
                  <li><Link to="/my/orders">My Orders</Link></li>
                  <li><Link to="/my/bookings">My Bookings</Link></li>
                  <li><Link to="/track">Track Order</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Get Help</Link></li>
              <li><a href="#">Find A Branch</a></li>
              <li><a href="#">Warranty</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 <span>Crown Eve Bikes</span>. All rights reserved. Built with precision.</p>
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Main Branch Chishtian </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
