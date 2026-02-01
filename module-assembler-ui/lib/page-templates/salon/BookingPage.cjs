/**
 * Salon BookingPage Generator
 * Fetches services from API and submits bookings
 */
function generateBookingPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React, { useState, useEffect } from 'react';
import { Scissors, User, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Data from API
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Booking state
  const [booking, setBooking] = useState({
    services: [],
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [confirmation, setConfirmation] = useState(null);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch time slots when date changes
  useEffect(() => {
    if (booking.date) {
      fetchTimeSlots(booking.date);
    }
  }, [booking.date]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(\`\${API_BASE}/api/booking/services\`);
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date) => {
    try {
      const res = await fetch(\`\${API_BASE}/api/booking/slots/\${date}\`);
      const data = await res.json();
      if (data.success) {
        setTimeSlots(data.slots?.filter(s => s.available) || []);
      }
    } catch (err) {
      console.error('Failed to fetch time slots:', err);
    }
  };

  const toggleService = (id) => {
    setBooking(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const selectedServices = services.filter(s => booking.services.includes(s.id));
      const res = await fetch(\`\${API_BASE}/api/booking\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: booking.name,
          customerEmail: booking.email,
          customerPhone: booking.phone,
          serviceId: booking.services[0],
          serviceType: selectedServices.map(s => s.name).join(', '),
          bookingDate: booking.date,
          startTime: booking.time,
          notes: booking.notes
        })
      });

      const data = await res.json();

      if (data.success) {
        setConfirmation(data.data);
        setStep(5);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Unable to complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedServicesTotal = () => {
    return services
      .filter(s => booking.services.includes(s.id))
      .reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? \`$\${price}\` : price;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return \`\${minutes} min\`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? \`\${hrs}h \${mins}m\` : \`\${hrs} hr\`;
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: COLORS.primary }} />
          <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading services...</p>
        </div>
        <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Book Appointment</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Schedule your visit at ${business?.name || 'our salon'}</p>
      </section>

      {step < 5 && (
        <section style={{ padding: '40px 20px', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            {['Services', 'Date & Time', 'Your Info'].map((label, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: step > idx + 1 ? COLORS.primary : step === idx + 1 ? COLORS.primary : '#E5E7EB',
                  color: step >= idx + 1 ? 'white' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px', fontWeight: '600'
                }}>
                  {step > idx + 1 ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === idx + 1 ? '600' : '400', color: step === idx + 1 ? COLORS.primary : '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div style={{ maxWidth: '700px', margin: '20px auto', padding: '16px', backgroundColor: '#FEE2E2', borderRadius: '8px', color: '#DC2626', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {step === 1 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Select Services</h2>
              <p style={{ color: '#6B7280', marginBottom: '32px' }}>{services.length} services available</p>

              {services.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No services available</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
                  {services.map(s => (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      style={{
                        padding: '20px', borderRadius: '12px',
                        border: booking.services.includes(s.id) ? \`2px solid \${COLORS.primary}\` : '2px solid #E5E7EB',
                        backgroundColor: booking.services.includes(s.id) ? \`\${COLORS.primary}08\` : 'white',
                        cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{s.name}</div>
                        <div style={{ fontSize: '14px', color: '#6B7280' }}>
                          {formatDuration(s.duration)}
                          {s.description && <span> • {s.description}</span>}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: COLORS.primary }}>{formatPrice(s.price)}</div>
                    </div>
                  ))}
                </div>
              )}

              {booking.services.length > 0 && (
                <div style={{ padding: '16px', backgroundColor: COLORS.background, borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span>Selected ({booking.services.length})</span>
                    <span style={{ color: COLORS.primary }}>${getSelectedServicesTotal()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={booking.services.length === 0}
                style={{
                  width: '100%', padding: '16px',
                  backgroundColor: booking.services.length > 0 ? COLORS.primary : '#E5E7EB',
                  color: booking.services.length > 0 ? 'white' : '#9CA3AF',
                  borderRadius: '12px', border: 'none', fontSize: '18px', fontWeight: '600',
                  cursor: booking.services.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '32px' }}>Select Date & Time</h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date</label>
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value, time: '' })}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }}
                />
              </div>

              {booking.date && (
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Available Times {timeSlots.length > 0 && <span style={{ color: '#6B7280', fontWeight: '400' }}>({timeSlots.length} slots)</span>}
                  </label>
                  {timeSlots.length === 0 ? (
                    <p style={{ color: '#6B7280', padding: '20px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      No available slots for this date. Please select another date.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {timeSlots.map(slot => (
                        <button
                          key={slot.time}
                          onClick={() => setBooking({ ...booking, time: slot.time })}
                          style={{
                            padding: '12px', borderRadius: '8px',
                            border: booking.time === slot.time ? \`2px solid \${COLORS.primary}\` : '1px solid #E5E7EB',
                            backgroundColor: booking.time === slot.time ? \`\${COLORS.primary}10\` : 'white',
                            fontWeight: '500', cursor: 'pointer',
                            color: booking.time === slot.time ? COLORS.primary : '#374151',
                            fontSize: '14px'
                          }}
                        >
                          {slot.displayTime || slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: COLORS.text, borderRadius: '12px', border: '1px solid #E5E7EB', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!booking.date || !booking.time}
                  style={{
                    flex: 2, padding: '16px',
                    backgroundColor: booking.date && booking.time ? COLORS.primary : '#E5E7EB',
                    color: booking.date && booking.time ? 'white' : '#9CA3AF',
                    borderRadius: '12px', border: 'none', fontWeight: '600',
                    cursor: booking.date && booking.time ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '32px' }}>Your Information</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <input type="text" placeholder="Full Name" required value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="email" placeholder="Email" required value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="tel" placeholder="Phone" required value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <textarea placeholder="Special requests or notes (optional)" rows={3} value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', resize: 'vertical' }} />
              </div>

              <div style={{ padding: '16px', backgroundColor: COLORS.background, borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontWeight: '600' }}>Booking Summary</h4>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div><span style={{ color: '#6B7280' }}>Date:</span> {booking.date}</div>
                  <div><span style={{ color: '#6B7280' }}>Time:</span> {booking.time}</div>
                  <div><span style={{ color: '#6B7280' }}>Services:</span> {services.filter(s => booking.services.includes(s.id)).map(s => s.name).join(', ')}</div>
                  <div style={{ fontWeight: '600', color: COLORS.primary }}>Total: ${getSelectedServicesTotal()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: COLORS.text, borderRadius: '12px', border: '1px solid #E5E7EB', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '16px',
                    backgroundColor: COLORS.primary, color: 'white',
                    borderRadius: '12px', border: 'none', fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {submitting && <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />}
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}

          {step === 5 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} color="#059669" />
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Booking Confirmed!</h2>
              <p style={{ color: '#6B7280', marginBottom: '8px' }}>Confirmation #{confirmation?.id || 'BK-' + Date.now()}</p>
              <p style={{ color: '#6B7280', marginBottom: '32px' }}>A confirmation email has been sent to {booking.email}</p>

              <div style={{ backgroundColor: COLORS.background, borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><span style={{ color: '#6B7280' }}>Date:</span><br /><strong>{booking.date}</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Time:</span><br /><strong>{booking.time}</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Services:</span><br /><strong>{booking.services.length} selected</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Total:</span><br /><strong style={{ color: COLORS.primary }}>${getSelectedServicesTotal()}</strong></div>
                </div>
              </div>

              <button
                onClick={() => { setStep(1); setBooking({ services: [], date: '', time: '', name: '', email: '', phone: '', notes: '' }); }}
                style={{ marginTop: '24px', padding: '14px 32px', backgroundColor: 'white', color: COLORS.primary, borderRadius: '8px', border: \`1px solid \${COLORS.primary}\`, fontWeight: '600', cursor: 'pointer' }}
              >
                Book Another Appointment
              </button>
            </div>
          )}
        </div>
      </section>
      <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
    </div>
  );
}`;
}

module.exports = { generateBookingPage };
