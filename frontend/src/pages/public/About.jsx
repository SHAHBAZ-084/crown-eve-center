// frontend/src/pages/public/About.jsx
import React from 'react';

const About = () => {
  return (
    <div id="page-about" className="page">
      <div className="about-hero">
        <div className="about-hero-content">
          <div className="section-label"><div className="section-label-line"></div><span>Our Story</span></div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,8vw,120px)', lineHeight: '0.9', letterSpacing: '-2px', marginBottom: '32px' }}>
            We Live<br />to <span style={{ color: 'var(--orange)' }}>Ride.</span>
          </h1>
          <p style={{ fontSize: '17px', fontWeight: '300', color: 'var(--white2)', lineHeight: '1.9', maxWidth: '580px' }}>
            Crown Eve was founded by riders, for riders. What started as a single workshop in Lahore has grown into Pakistan's most trusted motorcycle destination — 12 branches, 50,000+ customers, and a relentless commitment to the ride.
          </p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ background: 'var(--black2)', padding: '72px 5vw' }}>
          <div className="section-label"><div className="section-label-line"></div><span>Our Mission</span></div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '60px', lineHeight: '0.9', letterSpacing: '-1px', marginBottom: '24px' }}>
            Elevating<br />Every<br /><span style={{ color: 'var(--orange)' }}>Ride.</span>
          </h2>
          <p style={{ fontSize: '15px', fontWeight: '300', color: 'var(--white2)', lineHeight: '1.9' }}>
            We believe every rider deserves access to premium bikes, genuine parts, and expert care — regardless of city or budget. Our mission is to be the most trusted name in Pakistan's motorcycle industry.
          </p>
        </div>
        <div style={{ background: 'var(--black3)', padding: '72px 5vw', borderLeft: '1px solid rgba(232,71,10,0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(232,71,10,0.1),transparent)', pointerEvents: 'none' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '64px', color: 'var(--orange)', lineHeight: 1 }}>12+</div><div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>Branches</div></div>
            <div><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '64px', color: 'var(--orange)', lineHeight: 1 }}>50K+</div><div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>Customers</div></div>
            <div><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '64px', color: 'var(--orange)', lineHeight: 1 }}>1700+</div><div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>Parts</div></div>
            <div><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '64px', color: 'var(--orange)', lineHeight: 1 }}>8+</div><div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>Years</div></div>
          </div>
        </div>
      </div>
      <section style={{ padding: '100px 5vw', background: 'var(--black)' }}>
        <div className="section-label"><div className="section-label-line"></div><span>Our Values</span></div>
        <h2 className="section-title">What<br />Drives <span style={{ color: 'var(--orange)' }}>Us.</span></h2>
        <div className="about-values" style={{ marginTop: '60px' }}>
          <div className="value-card"><div className="value-icon">⚡</div><div className="value-title">Performance First</div><div className="value-desc">Every product is selected for its performance credentials — no compromises.</div></div>
          <div className="value-card"><div className="value-icon">🔒</div><div className="value-title">Trusted Quality</div><div className="value-desc">Only genuine parts. Only certified technicians. Only real results.</div></div>
          <div className="value-card"><div className="value-icon">🤝</div><div className="value-title">Rider Community</div><div className="value-desc">We're riders too. We speak your language and understand your needs.</div></div>
          <div className="value-card"><div className="value-icon">🌍</div><div className="value-title">Nationwide Access</div><div className="value-desc">12 branches and growing — Crown Eve is wherever you are.</div></div>
        </div>
      </section>
    </div>
  );
};

export default About;
