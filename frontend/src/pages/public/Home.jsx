import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const images = [
    '/1-1.png',
    '/1-2.png',
    '/1-3.png',
    '/1-4.png',
    '/1-5.png',
    '/1-6.png'
  ];
  
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

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
            <Link to="/appointments" className="btn-ghost">
              <span className="btn-ghost-line"></span>
              Book A Service
            </Link>
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
          <span className="marquee-item"><span class="marquee-sep">✦</span> Expert Service <span className="marquee-sep">✦</span></span>
          <span className="marquee-item highlight">Nationwide Branches</span>
          <span className="marquee-item"><span class="marquee-sep">✦</span> Ride The Legacy <span class="marquee-sep">✦</span></span>
          <span className="marquee-item highlight">1700+ Genuine Parts</span>
          {/* Duplicate for infinite loop */}
          <span className="marquee-item"><span class="marquee-sep">✦</span> Crown Eve Bikes <span class="marquee-sep">✦</span></span>
          <span className="marquee-item highlight">Premium Parts</span>
          <span className="marquee-item"><span class="marquee-sep">✦</span> Expert Service <span class="marquee-sep">✦</span></span>
          <span className="marquee-item highlight">Nationwide Branches</span>
          <span className="marquee-item"><span class="marquee-sep">✦</span> Ride The Legacy <span class="marquee-sep">✦</span></span>
          <span className="marquee-item highlight">1700+ Genuine Parts</span>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features">
        <div className="section-label">
          <div className="section-label-line"></div>
          <span>Why Crown Eve</span>
        </div>
        <h2 className="section-title">Built for<br /><span style={{ color: 'var(--orange)' }}>Riders.</span></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-num">01</div>
            <div className="feature-icon">⚡</div>
            <div className="feature-title">1700+ Genuine Parts</div>
            <div className="feature-desc">Access the largest catalog of authentic motorcycle parts sourced directly from manufacturers.</div>
          </div>
          <div className="feature-card featured">
            <div className="feature-num">02</div>
            <div className="feature-icon" style={{ borderColor: 'rgba(0,0,0,0.2)' }}>🔧</div>
            <div className="feature-title">Expert Technicians</div>
            <div className="feature-desc">Certified mechanics trained to handle every make and model with precision and care.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">03</div>
            <div className="feature-icon">📍</div>
            <div className="feature-title">12+ Branches</div>
            <div className="feature-desc">Nationwide presence so you're never far from premium Crown Eve service and support.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">04</div>
            <div className="feature-icon">📱</div>
            <div className="feature-title">Online Booking</div>
            <div className="feature-desc">Book services, track orders, and manage appointments from anywhere, any time.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">05</div>
            <div className="feature-icon">🏆</div>
            <div className="feature-title">Premium Quality</div>
            <div className="feature-desc">Every product we carry is hand-selected for performance, durability, and excellence.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">06</div>
            <div className="feature-icon">🔄</div>
            <div className="feature-title">Real-Time Tracking</div>
            <div className="feature-desc">Live order and service status updates so you always know exactly what's happening.</div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products">
        <div className="products-header">
          <div>
            <div className="section-label">
              <div className="section-label-line"></div>
              <span>Featured Lineup</span>
            </div>
            <h2 className="section-title">Our<br /><span style={{ color: 'var(--orange)' }}>Bikes.</span></h2>
          </div>
          <Link to="/shop" className="view-all">View all bikes →</Link>
        </div>
        <div className="products-grid">
          <div className="product-card">
            <div className="product-card-img">[ BIKE IMAGE ]
              <div className="product-card-overlay"></div>
              <div className="product-card-quick">View Details</div>
            </div>
            <div className="product-card-body">
              <div className="product-cat">Sport Series</div>
              <div className="product-name">Crown GT 390</div>
              <div style={{ fontSize: '13px', color: 'var(--white2)', marginTop: '4px' }}>450cc · Fuel Injected · ABS</div>
              <div className="product-price-row">
                <div className="product-price">PKR 485,000</div>
                <div className="product-badge">In Stock</div>
              </div>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-img" style={{ background: 'var(--black2)' }}>[ BIKE IMAGE ]
              <div className="product-card-overlay"></div>
              <div className="product-card-quick">View Details</div>
            </div>
            <div className="product-card-body">
              <div className="product-cat">Naked Series</div>
              <div className="product-name">Crown Duke R</div>
              <div style={{ fontSize: '13px', color: 'var(--white2)', marginTop: '4px' }}>250cc · Street Fighter · LED</div>
              <div className="product-price-row">
                <div className="product-price">PKR 310,000</div>
                <div className="product-badge" style={{ background: 'rgba(255,100,0,0.15)' }}>New Arrival</div>
              </div>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-img">[ BIKE IMAGE ]
              <div className="product-card-overlay"></div>
              <div className="product-card-quick">View Details</div>
            </div>
            <div className="product-card-body">
              <div className="product-cat">Adventure Series</div>
              <div className="product-name">Crown Trail X</div>
              <div style={{ fontSize: '13px', color: 'var(--white2)', marginTop: '4px' }}>650cc · Dual Sport · Long Range</div>
              <div className="product-price-row">
                <div className="product-price">PKR 720,000</div>
                <div className="product-badge">In Stock</div>
              </div>
            </div>
          </div>
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
            <div className="service-item">
              <div className="service-item-left">
                <span className="service-item-num">01</span>
                <div>
                  <div className="service-item-name">Full Tune-Up</div>
                  <div className="service-item-price">From PKR 2,500</div>
                </div>
              </div>
              <span className="service-item-icon">+</span>
            </div>
            <div className="service-item">
              <div className="service-item-left">
                <span className="service-item-num">02</span>
                <div>
                  <div className="service-item-name">Oil & Filter Change</div>
                  <div className="service-item-price">From PKR 800</div>
                </div>
              </div>
              <span className="service-item-icon">+</span>
            </div>
            <div className="service-item">
              <div className="service-item-left">
                <span className="service-item-num">03</span>
                <div>
                  <div className="service-item-name">Brake System Overhaul</div>
                  <div className="service-item-price">From PKR 3,200</div>
                </div>
              </div>
              <span className="service-item-icon">+</span>
            </div>
            <div className="service-item">
              <div className="service-item-left">
                <span className="service-item-num">04</span>
                <div>
                  <div className="service-item-name">Engine Diagnostics</div>
                  <div className="service-item-price">From PKR 1,500</div>
                </div>
              </div>
              <span className="service-item-icon">+</span>
            </div>
            <div className="service-item">
              <div className="service-item-left">
                <span className="service-item-num">05</span>
                <div>
                  <div className="service-item-name">Tyre Replacement</div>
                  <div className="service-item-price">From PKR 600</div>
                </div>
              </div>
              <span className="service-item-icon">+</span>
            </div>
          </div>
          <div className="services-cta-panel">
            <h3>Book Your<br /><span style={{ color: 'var(--orange)' }}>Service</span><br />Today.</h3>
            <p>Our certified technicians are ready to keep your ride in peak condition. Schedule online in under 2 minutes — choose your branch, pick a slot, and we handle the rest.</p>
            <Link to="/appointments" className="btn-primary">
              <span>Book Now</span>
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
              <li><Link to="/appointments">Book Service</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/my/orders">My Orders</Link></li>
              <li><Link to="/my/bookings">My Bookings</Link></li>
              <li><Link to="/track">Track Order</Link></li>
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
