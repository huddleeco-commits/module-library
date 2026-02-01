/**
 * Healthcare Providers Page Template
 *
 * Sections:
 * 1. Hero - Our Providers headline
 * 2. Provider Grid - Doctor cards with photos, credentials
 * 3. Credentials/Certifications
 * 4. CTA - Book with a provider
 */

function generateProvidersPage(fixture, options = {}) {
  const { business, theme, pages } = fixture;
  const aboutData = pages?.about || {};
  const colors = theme.colors;

  const team = aboutData?.team || getDefaultTeam();

  return `/**
 * ProvidersPage - Healthcare Business
 * Business: ${business.name}
 * Generated: ${new Date().toISOString()}
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, GraduationCap, Calendar, Star, MapPin, Phone,
  ChevronRight, Mail, Clock
} from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const PROVIDERS = ${JSON.stringify(team, null, 2)};

export default function ProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState(null);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 0 60px',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            Our Providers
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Meet our team of experienced, compassionate healthcare professionals
          </p>
        </div>
      </section>

      {/* Provider Grid */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {PROVIDERS.map((provider, idx) => (
              <ProviderCard key={idx} provider={provider} onSelect={() => setSelectedProvider(provider)} />
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Our Credentials</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'center'
          }}>
            {[
              { icon: Award, label: 'Board Certified', desc: 'All physicians' },
              { icon: GraduationCap, label: 'Top Medical Schools', desc: 'Harvard, Johns Hopkins, Stanford' },
              { icon: Star, label: '4.9 Rating', desc: 'Patient satisfaction' },
              { icon: Clock, label: '100+ Years', desc: 'Combined experience' }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '${colors.primary}15',
                  color: '${colors.primary}',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <item.icon size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{item.label}</h3>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accepting New Patients */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
            Accepting New Patients
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            Schedule your first appointment with one of our providers today
          </p>
          <Link to="/appointments" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={20} />
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Provider Modal */}
      {selectedProvider && (
        <ProviderModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
      )}
    </div>
  );
}

function ProviderCard({ provider, onSelect }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }} onClick={onSelect}>
      {/* Photo */}
      <div style={{
        height: '240px',
        backgroundColor: '${colors.primary}20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: provider.image ? \`url(\${provider.image})\` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!provider.image && (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '${colors.primary}',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: '600'
          }}>
            {provider.name?.charAt(0) || 'D'}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          {provider.name}
        </h3>
        <p style={{ color: '${colors.primary}', fontWeight: '500', marginBottom: '12px' }}>
          {provider.role}
        </p>
        <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: 1.5, marginBottom: '16px' }}>
          {provider.bio}
        </p>

        {provider.specialties && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {provider.specialties.map((spec, idx) => (
              <span key={idx} style={{
                padding: '4px 12px',
                backgroundColor: '${colors.primary}10',
                color: '${colors.primary}',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {spec}
              </span>
            ))}
          </div>
        )}

        <Link to="/appointments" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: '${colors.primary}',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '14px',
          marginTop: '16px'
        }} onClick={e => e.stopPropagation()}>
          Book with {provider.name?.split(' ')[0]} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function ProviderModal({ provider, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '32px'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '${colors.primary}20',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '48px', color: '${colors.primary}' }}>
              {provider.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{provider.name}</h2>
            <p style={{ color: '${colors.primary}', fontWeight: '600', marginBottom: '8px' }}>{provider.role}</p>
            <p style={{ opacity: 0.7 }}>{provider.bio}</p>
          </div>
        </div>

        {provider.specialties && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Specialties</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {provider.specialties.map((spec, idx) => (
                <span key={idx} style={{
                  padding: '6px 16px',
                  backgroundColor: '${colors.primary}10',
                  color: '${colors.primary}',
                  borderRadius: '50px',
                  fontSize: '14px'
                }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/appointments" style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '${colors.primary}',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={18} />
            Book Appointment
          </Link>
          <button onClick={onClose} style={{
            padding: '14px 24px',
            backgroundColor: 'transparent',
            border: '2px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text
  }
};
`;
}

function getDefaultTeam() {
  return [
    { name: 'Dr. Priya Patel, MD', role: 'Medical Director, Internal Medicine', bio: 'Harvard Medical School, 20 years experience', specialties: ['Internal Medicine', 'Preventive Care'] },
    { name: 'Dr. Michael Chen, MD', role: 'Pediatrics', bio: 'Boston Childrens Hospital trained', specialties: ['Pediatrics', 'Adolescent Medicine'] },
    { name: 'Dr. Sarah Williams, MD', role: 'OB/GYN', bio: 'Specializing in high-risk pregnancy', specialties: ['Obstetrics', 'Gynecology'] },
    { name: 'Dr. James Thompson, MD', role: 'Family Medicine', bio: 'Caring for families across generations', specialties: ['Family Medicine', 'Geriatrics'] }
  ];
}

module.exports = { generateProvidersPage };
