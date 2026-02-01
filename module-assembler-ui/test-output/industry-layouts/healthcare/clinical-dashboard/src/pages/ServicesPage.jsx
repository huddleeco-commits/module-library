/**
 * ServicesPage - Clinical Dashboard Layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check, ArrowRight } from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

export default function ServicesPage() {
  const services = [];

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#0284C7',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>Our Services</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Discover what we can do for you</p>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {services.map((service, idx) => (
              <div key={idx} style={{
                padding: '32px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{service.name}</h3>
                <p style={{ opacity: 0.7, marginBottom: '24px', lineHeight: 1.7 }}>{service.description}</p>
                {service.features && (
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                    {service.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Check size={16} color="#0284C7" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {service.price && (
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0284C7' }}>{service.price}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#0284C7',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
          Ready to get started?
        </h2>
        <Link to="/contact" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: '#0284C7',
          padding: '16px 32px',
          borderRadius: '4px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          Contact Us <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
