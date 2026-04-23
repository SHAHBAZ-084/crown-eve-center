// frontend/src/pages/appointments/Appointments.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Appointments = () => {
  const [selectedService, setSelectedService] = useState('Full Tune-Up');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState('24');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();

  const services = [
    { name: 'Full Tune-Up', price: 2500 },
    { name: 'Oil Change', price: 800 },
    { name: 'Brake Overhaul', price: 3200 },
    { name: 'Diagnostics', price: 1500 },
    { name: 'Tyre Change', price: 600 },
    { name: 'Chain Service', price: 400 }
  ];

  const mutation = useMutation({
    mutationFn: (newBooking) => api.post('/appointments', newBooking),
    onSuccess: () => {
      alert('Booking Confirmed!');
      queryClient.invalidateQueries(['appointments']);
    },
    onError: () => alert('Booking failed. Please try again.')
  });

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedBranch) return alert('Please select a branch');
    mutation.mutate({
      serviceType: selectedService,
      branch: selectedBranch,
      date: `2025-04-${selectedDate}`,
      time: selectedTime,
      notes
    });
  };

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
          <div className="step-connector"></div>
          <div className="step-item"><div className="step-num">4</div> Confirm</div>
        </div>
      </div>

      <div className="booking-form-layout">
        <div className="booking-form-main">
          <div className="form-section-title">Choose A Service</div>
          <div className="service-selector">
            {services.map(s => (
              <div 
                key={s.name}
                className={`service-option ${selectedService === s.name ? 'selected' : ''}`}
                onClick={() => setSelectedService(s.name)}
              >
                <div className="service-option-name">{s.name}</div>
                <div className="service-option-price">From PKR {s.price.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title">Select Branch</div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ width: '100%', background: 'var(--black3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', padding: '14px 18px', fontFamily: "'Barlow',sans-serif", fontSize: '14px', outline: 'none' }}
            >
              <option value="">Select nearest branch</option>
              <option>Crown Eve Gulberg — Lahore</option>
              <option>Crown Eve DHA — Lahore</option>
              <option>Crown Eve Clifton — Karachi</option>
              <option>Crown Eve Blue Area — Islamabad</option>
              <option>Crown Eve Canal Road — Faisalabad</option>
            </select>
          </div>

          <div className="form-section-title">Select Date</div>
          <div className="date-grid">
            {['23', '24', '25', '26', '27', '28', '30'].map(d => (
              <div 
                key={d}
                className={`date-btn ${selectedDate === d ? 'selected' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                <div className="day-name">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Mon'][['23', '24', '25', '26', '27', '28', '30'].indexOf(d)]}</div>
                <div className="day-num">{d}</div>
              </div>
            ))}
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
          <button className="form-submit" style={{ marginTop: '8px' }} onClick={handleBooking}>Confirm Booking →</button>
        </div>

        <div className="booking-sidebar-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item"><span>Service</span><strong>{selectedService}</strong></div>
          <div className="summary-item"><span>Branch</span><strong>{selectedBranch || '—'}</strong></div>
          <div className="summary-item"><span>Date</span><strong>Tue, Apr {selectedDate}</strong></div>
          <div className="summary-item"><span>Time</span><strong>{selectedTime}</strong></div>
          <div className="summary-item"><span>Duration</span><strong>~2 hours</strong></div>
          <div className="summary-total"><span>Estimate</span><span>PKR {services.find(s => s.name === selectedService)?.price.toLocaleString()}</span></div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '16px', lineHeight: '1.6' }}>
            Final price confirmed at branch. Free cancellation up to 2 hours before appointment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
