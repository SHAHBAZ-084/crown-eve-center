// frontend/src/pages/public/Contact.jsx


const Contact = () => {
  return (
    <div id="page-contact" className="page">
      <div className="contact-layout" style={{ minHeight: 'calc(100vh - 72px)', marginTop: '72px' }}>
        <div className="contact-info">
          <div className="section-label" style={{ marginBottom: '12px' }}><div className="section-label-line" style={{ background: '#000' }}></div><span style={{ color: '#000', opacity: 0.6 }}>Get In Touch</span></div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(52px,6vw,90px)', lineHeight: '0.9', color: '#000', letterSpacing: '-2px' }}>Let's<br />Talk.</h2>
          <div className="contact-detail">
            <div className="contact-item">
              <div className="contact-item-icon">📍</div>
              <div className="contact-item-text"><h4>Head Office</h4><p>12 Bikes Street, Gulberg III, Lahore, Pakistan</p></div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">📞</div>
              <div className="contact-item-text"><h4>Phone</h4><p>+92 42 1234 5678</p></div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">✉️</div>
              <div className="contact-item-text"><h4>Email</h4><p>hello@crowneve.pk</p></div>
            </div>
            <div className="contact-item" style={{ border: 'none', paddingBottom: 0 }}>
              <div className="contact-item-icon">🕐</div>
              <div className="contact-item-text"><h4>Hours</h4><p>Mon–Sat: 9am – 7pm · Sun: 10am – 4pm</p></div>
            </div>
          </div>
        </div>
        <div className="contact-form-panel">
          <div className="section-label"><div className="section-label-line"></div><span>Send A Message</span></div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px,5vw,72px)', lineHeight: '0.9', letterSpacing: '-1px', marginBottom: '36px' }}>How Can We<br /><span style={{ color: 'var(--orange)' }}>Help?</span></h2>
          <div className="form-row">
            <div className="form-group"><label>Your Name</label><input type="text" placeholder="Ali Khan" /></div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="ali@email.com" /></div>
          </div>
          <div className="form-group"><label>Subject</label>
            <select style={{ width: '100%', background: 'var(--black)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--white)', padding: '14px 18px', fontFamily: "'Barlow',sans-serif", fontSize: '14px', outline: 'none' }}>
              <option>General Enquiry</option>
              <option>Service Booking</option>
              <option>Parts Request</option>
              <option>Complaint</option>
              <option>Partnership</option>
            </select>
          </div>
          <div className="form-group"><label>Message</label><textarea className="form-textarea" placeholder="Tell us how we can help..." style={{ minHeight: '140px', resize: 'vertical' }}></textarea></div>
          <button className="form-submit" style={{ marginTop: '8px' }}>Send Message →</button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
