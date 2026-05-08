import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div id="page-about" className="page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Redefining<br />The Ride.</h1>
          <p>
            From our humble beginnings to becoming Pakistan's premier mobility destination, our journey has been fueled by one passion: the thrill of the road.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-mission">
        <div className="mission-text">
          <h2>Our Legacy in Motion</h2>
          <p>
            Founded on the principles of engineering excellence and customer trust, Crown Eve has evolved from a single workshop into a nationwide network. We don't just sell bikes; we provide the freedom to explore, the tools to build, and the community to belong.
          </p>
          <div className="mission-stats">
            <div className="stat-item">
              <h3>12+</h3>
              <p>Showrooms</p>
            </div>
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Riders Served</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Genuine Parts</p>
            </div>
            <div className="stat-item">
              <h3>8+</h3>
              <p>Years Excellence</p>
            </div>
          </div>
        </div>
        <div className="philosophy-image" style={{ 
          borderRadius: '12px', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1000&q=80" 
            alt="Crown Eve Showroom" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="about-philosophy">
        <div className="philosophy-grid">
          <div className="philosophy-video-wrapper" style={{ 
            borderRadius: '12px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            height: '600px'
          }}>
            <video 
              src="/about-philosophy.webm" 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="philosophy-content">
            <h2>The Crown Philosophy</h2>
            <div className="value-grid">
              <div className="value-item">
                <h4>Uncompromising Quality</h4>
                <p>We source only the highest grade components and partner with global manufacturers to ensure every bike meets our rigorous standards.</p>
              </div>
              <div className="value-item">
                <h4>Innovation First</h4>
                <p>We stay ahead of the curve, embracing electric mobility and smart technologies to reshape the future of transportation in Pakistan.</p>
              </div>
              <div className="value-item">
                <h4>Rider Community</h4>
                <p>We're more than a dealership. We're a hub for enthusiasts, providing expert maintenance and a platform for riders to connect.</p>
              </div>
              <div className="value-item">
                <h4>Integrity & Trust</h4>
                <p>Transparent pricing, honest advice, and lifelong support. That's our promise to every customer who joins the Crown family.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;

