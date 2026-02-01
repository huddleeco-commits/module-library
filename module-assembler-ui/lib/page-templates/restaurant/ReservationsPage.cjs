/**
 * Restaurant ReservationsPage Generator
 */

function generateReservationsPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `/**
 * ReservationsPage - ${business.name}
 */
import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, Phone, Info } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const BUSINESS = ${JSON.stringify({ name: business.name, phone: business.phone }, null, 2)};

const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
];

export default function ReservationsPage() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    guests: 2,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    occasion: '',
    requests: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: COLORS.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Make a Reservation</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Book your table in just a few clicks</p>
      </section>

      {/* Progress */}
      {step < 4 && (
        <section style={{ padding: '40px 20px', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {['Party Size', 'Date & Time', 'Your Info'].map((label, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: step > idx ? COLORS.primary : step === idx + 1 ? COLORS.primary : '#E5E7EB',
                    color: step >= idx + 1 ? 'white' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontWeight: '600'
                  }}>
                    {step > idx + 1 ? <CheckCircle size={20} /> : idx + 1}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: step === idx + 1 ? '600' : '400',
                    color: step === idx + 1 ? COLORS.primary : '#6B7280'
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Form */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Step 1: Party Size */}
          {step === 1 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <Users size={28} color={COLORS.primary} />
                <h2 style={{ fontSize: '28px', fontWeight: '600' }}>How many guests?</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {[1, 2, 3, 4, 5, 6, 7, '8+'].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBooking({ ...booking, guests: num })}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: booking.guests === num ? \`2px solid \${COLORS.primary}\` : '2px solid #E5E7EB',
                      backgroundColor: booking.guests === num ? \`\${COLORS.primary}10\` : 'white',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: booking.guests === num ? COLORS.primary : '#374151'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <Calendar size={28} color={COLORS.primary} />
                <h2 style={{ fontSize: '28px', fontWeight: '600' }}>When would you like to dine?</h2>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Select Date</label>
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Select Time</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBooking({ ...booking, time })}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: booking.time === time ? \`2px solid \${COLORS.primary}\` : '1px solid #E5E7EB',
                        backgroundColor: booking.time === time ? \`\${COLORS.primary}10\` : 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        color: booking.time === time ? COLORS.primary : '#374151'
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: 'white',
                    color: COLORS.text,
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!booking.date || !booking.time}
                  style={{
                    flex: 2,
                    padding: '16px',
                    backgroundColor: booking.date && booking.time ? COLORS.primary : '#E5E7EB',
                    color: booking.date && booking.time ? 'white' : '#9CA3AF',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: booking.date && booking.time ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '32px' }}>Your Information</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                <input type="text" placeholder="Full Name" required value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="email" placeholder="Email Address" required value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="tel" placeholder="Phone Number" required value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <select value={booking.occasion} onChange={(e) => setBooking({ ...booking, occasion: e.target.value })} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                  <option value="">Special Occasion? (optional)</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="date">Date Night</option>
                  <option value="business">Business Meal</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Special Requests (optional)" rows={3} value={booking.requests} onChange={(e) => setBooking({ ...booking, requests: e.target.value })} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: COLORS.text, borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 2, padding: '16px', backgroundColor: COLORS.primary, color: 'white', borderRadius: '12px', border: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>
                  Complete Reservation
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} color="#059669" />
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Reservation Confirmed!</h2>
              <p style={{ opacity: 0.7, marginBottom: '32px' }}>A confirmation email has been sent to {booking.email}</p>

              <div style={{ backgroundColor: COLORS.background, borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><span style={{ opacity: 0.6 }}>Party Size:</span><br /><strong>{booking.guests} guests</strong></div>
                  <div><span style={{ opacity: 0.6 }}>Date:</span><br /><strong>{booking.date}</strong></div>
                  <div><span style={{ opacity: 0.6 }}>Time:</span><br /><strong>{booking.time}</strong></div>
                  <div><span style={{ opacity: 0.6 }}>Name:</span><br /><strong>{booking.name}</strong></div>
                </div>
              </div>

              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Need to modify? Call us at <a href="tel:${business.phone}" style={{ color: COLORS.primary }}>${business.phone || '(555) 123-4567'}</a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Policies */}
      {step < 4 && (
        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px', backgroundColor: COLORS.background, borderRadius: '12px' }}>
              <Info size={20} color={COLORS.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>
                <strong>Reservation Policy:</strong> Please arrive within 15 minutes of your reservation time. Reservations not claimed within 15 minutes may be released. For parties of 8 or more, please call us directly.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
`;
}

module.exports = { generateReservationsPage };
