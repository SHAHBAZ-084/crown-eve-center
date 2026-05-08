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

      {/* RATE US SECTION */}
      <section className="rate-us-section">
        <div className="rate-us-container">
          <div className="rate-us-header">
            <h2>Rate Your Experience</h2>
            <p>Your feedback helps us improve and serves our community of riders.</p>
          </div>
          
          <form className="rate-us-form" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              name: formData.get('name'),
              role: formData.get('role'),
              stars: parseInt(formData.get('stars')),
              text: formData.get('text')
            };

            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              if (res.ok) {
                alert('Thank you for your rating!');
                e.target.reset();
              } else {
                alert('Failed to submit rating. Please try again.');
              }
            } catch (err) {
              console.error(err);
              alert('Something went wrong.');
            }
          }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" name="name" required placeholder="e.g. Ali Kamran" />
              </div>
              <div className="form-group">
                <label>Your Bike/Role</label>
                <input type="text" name="role" placeholder="e.g. KTM Duke Owner" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Rating</label>
              <select name="stars" required>
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Experience</label>
              <textarea name="text" required placeholder="Tell us about your journey with Crown Eve..." rows="4"></textarea>
            </div>

            <button type="submit" className="submit-rate-btn">Submit Rating</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default About;

