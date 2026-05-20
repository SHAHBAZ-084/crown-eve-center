// frontend/src/pages/appointments/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBranch, setSelectedBranch] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/branches').then(res => setBranches(res.data.data || res.data || []))
    ]).finally(() => setLoading(false));
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !cellNumber || !whatsappNumber) {
      return alert('Please complete all fields');
    }

    setSubmitting(true);
    try {
      const payload = {
        branchId: Number(selectedBranch),
        booking_date: new Date().toISOString(),
        booking_time: "ASAP",
        customer_notes: `Cell: ${cellNumber} | WhatsApp: ${whatsappNumber}`,
        final_price: 0
      };

      await api.post('/bookings', payload);
      alert('Service Request Submitted!');
      navigate('/my/bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: 'var(--muted)' }}>Initializing...</div>;

  return (
    <div id="page-booking" className="page">
      <div className="booking-page-hero">
        <div className="section-label"><div className="section-label-line"></div><span>Service Centre</span></div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,7vw,100px)', lineHeight: '0.9', letterSpacing: '-2px' }}>
          Get Your <span style={{ color: 'var(--orange)' }}>Service.</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--white2)', marginTop: '16px', maxWidth: '480px', lineHeight: '1.8' }}>
          Select your branch and provide your contact details. Our team will reach out to you shortly.
        </p>
      </div>

      <div className="booking-form-layout" style={{ display: 'block', maxWidth: '600px', margin: '0 auto' }}>
        <div className="booking-form-main">
          <div className="form-section-title">Select Branch</div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ width: '100%', background: 'var(--black3)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--white)', padding: '14px 18px', fontFamily: "'Barlow',sans-serif", fontSize: '14px', outline: 'none' }}
            >
              <option value="">Select nearest branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} — {b.city || b.location}</option>
              ))}
            </select>
          </div>

          <div className="form-section-title">Cell Number</div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <input 
              type="text" 
              className="fi" 
              placeholder="Enter your cell number"
              value={cellNumber} 
              onChange={e => setCellNumber(e.target.value)} 
            />
          </div>

          <div className="form-section-title">WhatsApp Number</div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <input 
              type="text" 
              className="fi" 
              placeholder="Enter your WhatsApp number"
              value={whatsappNumber} 
              onChange={e => setWhatsappNumber(e.target.value)} 
            />
          </div>

          <button 
            className="form-submit" 
            style={{ marginTop: '8px', width: '100%' }} 
            onClick={handleBooking}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Request Service →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
