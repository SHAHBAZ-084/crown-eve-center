import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Contact = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Default Head Office Info
  const headOffice = {
    name: "Head Office",
    phone: "021-111000348, 0326-8330680",
    email: "info@crownelectricmobility.com",
    address: "Plot No. 672-673, Deh Joreji Taluka, Bin Qasim Town Karachi, 75600",
    timings: "Mon-Sat, 9:00 AM - 6:00 PM"
  };

  useEffect(() => {
    api.get("/branches")
      .then(res => {
        const branchList = res.data?.data || res.data || [];
        setBranches(Array.isArray(branchList) ? branchList : []);
      })
      .catch(err => console.error("Error fetching branches:", err));
  }, []);

  const currentInfo = selectedBranch ? {
    name: selectedBranch.name,
    phone: selectedBranch.phone || headOffice.phone,
    email: selectedBranch.email || headOffice.email,
    address: selectedBranch.location || headOffice.address,
    timings: headOffice.timings
  } : headOffice;

  return (
    <div id="page-contact" className="page">
      {/* HERO SECTION */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
      </section>

      {/* MAIN CONTENT */}
      <main className="contact-main">
        <div className="contact-left">
          <div className="branch-selector-wrapper">
            <span className="selector-label">Select Your Nearest Branch</span>
            <select 
              className="branch-selector-premium"
              onChange={(e) => {
                const branch = branches.find(b => String(b.id) === e.target.value);
                setSelectedBranch(branch || null);
              }}
            >
              <option value="">Corporate / Head Office</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <h2>We are always ready to help you and answer your questions</h2>
          <p className="sub">
            Whether you have questions about our products, need support, or want to become a dealer – our team is ready to assist you.
          </p>

          <div className="info-grid">
            <div className="info-block">
              <h4>Phone Number</h4>
              <div className="info-item">
                <span>📞</span>
                <div>
                  {currentInfo.phone.split(',').map((p, i) => (
                    <React.Fragment key={i}>{p.trim()}<br /></React.Fragment>
                  ))}
                </div>
              </div>
              <p className="time-note">{currentInfo.timings || "Mon-Sat, 9:00 AM - 6:00 PM"}</p>
            </div>

            <div className="info-block">
              <h4>Our Location</h4>
              <div className="info-item">
                <span>📍</span>
                <div>
                  <p>{currentInfo.address?.split('|')[0]}</p>
                  {currentInfo.address?.includes('|') && (
                    <a 
                      href={currentInfo.address.split('|')[1]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '5px', color: 'var(--orange)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="info-block">
              <h4>Email</h4>
              <div className="info-item">
                <span>✉️</span>
                <p>{currentInfo.email}</p>
              </div>
            </div>

            <div className="info-block">
              <h4>Social Network</h4>
              <div className="social-links">
                <a href="#">FB</a>
                <a href="#">IG</a>
                <a href="#">YT</a>
                <a href="#">LN</a>
                <a href="#">TK</a>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Contact;
