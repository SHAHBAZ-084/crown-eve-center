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
        <div className="hero-number">01</div>
        
        <div className="hero-content full-width">
          <div className="hero-badge">
            <div className="hero-badge-dot"></div>
            <span>Premium Bikes & Service — Pakistan</span>
          </div>
          <h1 className="hero-title">
            Ride<br />
            <span className="line2">The</span>
            <span className="line3">Legacy.</span>
          </h1>
          <p className="hero-sub">Crown Eve delivers premium motorcycles, expert servicing, and genuine parts — engineered for the road, built for the rider.</p>
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
          
          <div className="hero-stats horizontal">
            <div>
              <div className="stat-num">12+</div>
              <div className="stat-label">Branches</div>
            </div>
            <div>
              <div className="stat-num">1700+</div>
              <div className="stat-label">Genuine Parts</div>
            </div>
            <div>
              <div className="stat-num">50K+</div>
              <div className="stat-label">Customers</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="scroll-text">Scroll</span>
        </div>
      </section>

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
      <section id="booking" style={{ padding: '80px 5vw' }}>
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="feat-info">
                  <h4>Quality</h4>
                  <p>Durable Construction.</p>
                </div>
              </div>
              <div className="why-evee-feat">
                <div className="feat-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div className="feat-info">
                  <h4>Warranty</h4>
                  <p>Stress Free Claims.</p>
                </div>
              </div>
              <div className="why-evee-feat">
                <div className="feat-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Crown Eve is the only place I trust with my Duke. The technicians are certified, the parts are genuine, and the service is fast. Nothing compares."</p>
            <div className="testimonial-author">
              <div className="author-avatar">AK</div>
              <div>
                <div className="author-name">Ali Kamran</div>
                <div className="author-role">KTM Duke Owner, Lahore</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Booked my full service online in 2 minutes. Got an update when the tech started and when it was done. This is how bike service should work."</p>
            <div className="testimonial-author">
              <div className="author-avatar">SH</div>
              <div>
                <div className="author-name">Sara Hussain</div>
                <div className="author-role">Yamaha R15 Owner, Karachi</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"1700+ parts in stock — I found an obscure OEM part for my 2019 model within 20 minutes of walking in. Incredible inventory and knowledgeable staff."</p>
            <div className="testimonial-author">
              <div className="author-avatar">MR</div>
              <div>
                <div className="author-name">Muhammad Raza</div>
                <div className="author-role">Honda CBR Owner, Islamabad</div>
              </div>
            </div>
          </div>
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
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">fb</a>
              <a href="#" className="social-link">ig</a>
              <a href="#" className="social-link">yt</a>
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
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Lahore · Karachi · Islamabad · Faisalabad</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
