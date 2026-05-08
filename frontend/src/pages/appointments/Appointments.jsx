// frontend/src/pages/appointments/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/services').then(res => setServices(res.data.data || res.data || [])),
      api.get('/branches').then(res => setBranches(res.data.data || res.data || []))
    ]).finally(() => setLoading(false));
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedBranch || !selectedDate) {
      return alert('Please complete all selections');
    }

    setSubmitting(true);
    try {
      const payload = {
        serviceId: selectedService.id,
        branchId: Number(selectedBranch),
        booking_date: new Date(selectedDate).toISOString(),
        booking_time: selectedTime,
        customer_notes: notes,
        final_price: parseFloat(selectedService.base_price)
      };

      await api.post('/bookings', payload);
      alert('Booking Confirmed!');
      navigate('/my/bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: 'var(--muted)' }}>Initializing booking system...</div>;

  return (
    <div id="page-booking" className="page">
      <div className="booking-page-hero">
        <div className="section-label"><div className="section-label-line"></div><span>Service Centre</span></div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,7vw,100px)', lineHeight: '0.9', letterSpacing: '-2px' }}>
          Book Your <span style={{ color: 'var(--orange)' }}>Service.</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--white2)', marginTop: '16px', maxWidth: '480px', lineHeight: '1.8' }}>
          Choose your branch, pick a service, select a date and time. Our certified technicians will handle the rest.
        </p>
        <div className="booking-steps">
          <div className={`step-item ${selectedService ? 'active' : ''}`}><div className="step-num">1</div> Select Service</div>
          <div className="step-connector"></div>
          <div className={`step-item ${selectedBranch ? 'active' : ''}`}><div className="step-num">2</div> Choose Branch</div>
          <div className="step-connector"></div>
          <div className={`step-item ${selectedDate ? 'active' : ''}`}><div className="step-num">3</div> Pick Date & Time</div>
        </div>
      </div>

      <div className="booking-form-layout">
        <div className="booking-form-main">
          <div className="form-section-title">Choose A Service</div>
          <div className="service-selector">
            {services.map(s => (
              <div 
                key={s.id}
                className={`service-option ${selectedService?.id === s.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(s)}
              >
                <div className="service-option-name">{s.name}</div>
                <div className="service-option-price">PKR {Number(s.base_price).toLocaleString()}</div>
              </div>
            ))}
          </div>

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

          <div className="form-section-title">Select Date</div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <input 
              type="date" 
              className="fi" 
              value={selectedDate} 
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)} 
            />
          </div>

          <div className="form-section-title">Select Time</div>
          <div className="time-grid">
            {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(t => (
              <div 
                key={t}
                className={`time-btn ${selectedTime === t ? 'selected' : ''}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="form-section-title">Additional Notes</div>
          <div className="form-group">
            <textarea 
              className="form-textarea" 
              style={{ background: 'var(--black3)' }} 
              placeholder="Any specific issues or requests?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          <button 
            className="form-submit" 
            style={{ marginTop: '8px' }} 
            onClick={handleBooking}
            disabled={submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm Booking →'}
          </button>
        </div>

        <div className="booking-sidebar-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item"><span>Service</span><strong>{selectedService?.name || '—'}</strong></div>
          <div className="summary-item"><span>Branch</span><strong>{branches.find(b => b.id == selectedBranch)?.name || '—'}</strong></div>
          <div className="summary-item"><span>Date</span><strong>{selectedDate || '—'}</strong></div>
          <div className="summary-item"><span>Time</span><strong>{selectedTime}</strong></div>
          <div className="summary-total">
            <span>Estimate</span>
            <span>PKR {selectedService ? Number(selectedService.base_price).toLocaleString() : '0'}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '16px', lineHeight: '1.6' }}>
            Final price confirmed at branch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
