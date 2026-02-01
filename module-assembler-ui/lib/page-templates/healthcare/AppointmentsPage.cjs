/**
 * Healthcare Appointments Page Template
 */

function generateAppointmentsPage(fixture, options = {}) {
  const { business, theme, pages } = fixture;
  const colors = theme.colors;
  const team = pages?.about?.team || [];

  return `/**
 * AppointmentsPage - Healthcare Business
 * Business: ${business.name}
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, User, Phone, Mail, CheckCircle, ChevronRight,
  ChevronLeft, MapPin, AlertCircle
} from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const VISIT_TYPES = [
  { id: 'new-patient', label: 'New Patient Visit', duration: '60 min', description: 'First time visit with comprehensive evaluation' },
  { id: 'follow-up', label: 'Follow-Up Visit', duration: '30 min', description: 'Return visit for ongoing care' },
  { id: 'annual-physical', label: 'Annual Physical', duration: '45 min', description: 'Yearly comprehensive health exam' },
  { id: 'urgent', label: 'Urgent Care Visit', duration: '30 min', description: 'Same-day care for acute issues' },
  { id: 'telehealth', label: 'Telehealth Visit', duration: '20 min', description: 'Video visit from home' }
];

const PROVIDERS = ${JSON.stringify(team.length > 0 ? team : [
  { name: 'Dr. Priya Patel, MD', role: 'Internal Medicine' },
  { name: 'Dr. Michael Chen, MD', role: 'Pediatrics' },
  { name: 'Dr. Sarah Williams, MD', role: 'OB/GYN' }
], null, 2)};

export default function AppointmentsPage() {
  const [step, setStep] = useState(1);
  const [visitType, setVisitType] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];

  const nextWeekDates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 0 40px',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
            Book an Appointment
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Schedule your visit in just a few steps
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section style={{ padding: '40px 0', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px' }}>
            {['Visit Type', 'Provider', 'Date & Time', 'Your Info'].map((label, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: step > idx + 1 ? '#059669' : step === idx + 1 ? '${colors.primary}' : 'rgba(0,0,0,0.1)',
                  color: step >= idx + 1 ? 'white' : COLORS.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  {step > idx + 1 ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span style={{ fontWeight: step === idx + 1 ? '600' : '400', opacity: step >= idx + 1 ? 1 : 0.5 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section style={{ padding: '60px 0' }}>
        <div style={{ ...styles.container, maxWidth: '800px' }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Select Visit Type</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {VISIT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setVisitType(type); setStep(2); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '24px',
                      backgroundColor: visitType?.id === type.id ? '${colors.primary}10' : 'white',
                      border: visitType?.id === type.id ? '2px solid ${colors.primary}' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{type.label}</h3>
                      <p style={{ opacity: 0.7, fontSize: '14px' }}>{type.description}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '${colors.primary}' }}>
                      <Clock size={16} />
                      <span style={{ fontWeight: '500' }}>{type.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                border: 'none', cursor: 'pointer', marginBottom: '24px', color: '${colors.primary}'
              }}>
                <ChevronLeft size={18} /> Back
              </button>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Select Provider</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {PROVIDERS.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setProvider(doc); setStep(3); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: provider?.name === doc.name ? '${colors.primary}10' : 'white',
                      border: provider?.name === doc.name ? '2px solid ${colors.primary}' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      backgroundColor: '${colors.primary}20', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '${colors.primary}', fontWeight: '600', fontSize: '20px'
                    }}>
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600' }}>{doc.name}</h3>
                      <p style={{ opacity: 0.7, fontSize: '14px' }}>{doc.role}</p>
                    </div>
                    <ChevronRight size={20} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                border: 'none', cursor: 'pointer', marginBottom: '24px', color: '${colors.primary}'
              }}>
                <ChevronLeft size={18} /> Back
              </button>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Select Date & Time</h2>

              {/* Date Selection */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Available Dates</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
                  {nextWeekDates.map((date, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        padding: '16px 24px',
                        backgroundColor: selectedDate?.toDateString() === date.toDateString() ? '${colors.primary}' : 'white',
                        color: selectedDate?.toDateString() === date.toDateString() ? 'white' : COLORS.text,
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        minWidth: '100px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '600' }}>
                        {date.getDate()}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 style={{ fontWeight: '500', marginBottom: '16px' }}>Available Times</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {timeSlots.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedTime(time); setStep(4); }}
                        style={{
                          padding: '14px',
                          backgroundColor: selectedTime === time ? '${colors.primary}' : 'white',
                          color: selectedTime === time ? 'white' : COLORS.text,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <button onClick={() => setStep(3)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                border: 'none', cursor: 'pointer', marginBottom: '24px', color: '${colors.primary}'
              }}>
                <ChevronLeft size={18} /> Back
              </button>

              {/* Summary */}
              <div style={{
                backgroundColor: '${colors.primary}10',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Appointment Summary</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <p><strong>Visit:</strong> {visitType?.label}</p>
                  <p><strong>Provider:</strong> {provider?.name}</p>
                  <p><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                </div>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Your Information</h2>
              <form onSubmit={e => { e.preventDefault(); alert('Appointment booked!'); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name *</label>
                    <input required type="text" style={styles.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name *</label>
                    <input required type="text" style={styles.input} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
                  <input required type="email" style={styles.input} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone *</label>
                  <input required type="tel" style={styles.input} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date of Birth *</label>
                  <input required type="date" style={styles.input} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Reason for Visit</label>
                  <textarea rows={3} style={{ ...styles.input, resize: 'vertical' }} placeholder="Briefly describe your symptoms or reason for visit" />
                </div>
                <button type="submit" style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '${colors.primary}',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={20} />
                  Confirm Appointment
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section style={{ padding: '60px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={24} color="${colors.primary}" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Call Us</p>
                <p style={{ fontWeight: '600' }}>${business.phone || '(555) 789-CARE'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={24} color="${colors.primary}" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Visit Us</p>
                <p style={{ fontWeight: '600' }}>${business.address || '200 Health Plaza'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={24} color="${colors.primary}" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Hours</p>
                <p style={{ fontWeight: '600' }}>Mon-Fri: 8am-6pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid rgba(0,0,0,0.1)',
    borderRadius: '8px',
    fontSize: '16px'
  }
};
`;
}

module.exports = { generateAppointmentsPage };
