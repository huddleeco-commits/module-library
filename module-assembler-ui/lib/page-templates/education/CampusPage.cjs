/**
 * Education CampusPage Generator
 */
function generateCampusPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Coffee, BookOpen, Dumbbell, Music, Calendar, Users, ChevronRight, Play } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const FACILITIES = [
  { icon: 'BookOpen', name: 'Library', desc: 'State-of-the-art library with 2 million volumes and 24/7 study spaces' },
  { icon: 'Home', name: 'Residence Halls', desc: '12 residence halls housing 4,000+ students with modern amenities' },
  { icon: 'Dumbbell', name: 'Recreation Center', desc: 'Olympic pool, fitness center, climbing wall, and sports courts' },
  { icon: 'Coffee', name: 'Student Center', desc: 'Dining halls, cafes, student organizations, and event spaces' },
  { icon: 'Music', name: 'Performing Arts', desc: 'Concert hall, theater, and practice rooms for the arts' },
  { icon: 'MapPin', name: 'Research Labs', desc: 'Cutting-edge research facilities across all disciplines' }
];

const EVENTS = [
  { name: 'Fall Open House', date: 'October 15', type: 'Admissions' },
  { name: 'Homecoming Weekend', date: 'October 22-24', type: 'Alumni' },
  { name: 'Career Fair', date: 'November 3', type: 'Career' },
  { name: 'Spring Preview Day', date: 'March 18', type: 'Admissions' }
];

export default function CampusPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Campus Life</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Discover your home away from home</p>
      </section>

      {/* Virtual Tour CTA */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          <div style={{ height: '300px', backgroundColor: \`\${COLORS.primary}15\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <Play size={32} color={COLORS.primary} style={{ marginLeft: '4px' }} />
            </div>
          </div>
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Take a Virtual Tour</h2>
            <p style={{ opacity: 0.6, lineHeight: 1.6, marginBottom: '24px' }}>
              Cannot visit in person? Explore our beautiful 200-acre campus from anywhere in the world with our interactive virtual tour.
            </p>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', width: 'fit-content' }}>
              Start Virtual Tour <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Campus Facilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {FACILITIES.map((facility, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', padding: '24px', backgroundColor: COLORS.background, borderRadius: '16px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {facility.icon === 'BookOpen' && <BookOpen size={28} color={COLORS.primary} />}
                  {facility.icon === 'Home' && <Home size={28} color={COLORS.primary} />}
                  {facility.icon === 'Dumbbell' && <Dumbbell size={28} color={COLORS.primary} />}
                  {facility.icon === 'Coffee' && <Coffee size={28} color={COLORS.primary} />}
                  {facility.icon === 'Music' && <Music size={28} color={COLORS.primary} />}
                  {facility.icon === 'MapPin' && <MapPin size={28} color={COLORS.primary} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{facility.name}</h3>
                  <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: 1.6 }}>{facility.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Life Stats */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { num: '200+', label: 'Student Clubs' },
            { num: '20', label: 'Division I Sports' },
            { num: '500+', label: 'Events Per Year' },
            { num: '85%', label: 'Live On Campus' }
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', fontWeight: '800', color: COLORS.primary }}>{stat.num}</div>
              <div style={{ opacity: 0.6 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Upcoming Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {EVENTS.map((event, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: COLORS.background, borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={24} color={COLORS.primary} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{event.name}</h3>
                    <span style={{ fontSize: '14px', opacity: 0.6 }}>{event.date}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ padding: '4px 12px', backgroundColor: \`\${COLORS.primary}15\`, color: COLORS.primary, borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{event.type}</span>
                  <a href="#" style={{ color: COLORS.primary, fontWeight: '500', textDecoration: 'none' }}>Details →</a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href="#" style={{ color: COLORS.primary, fontWeight: '600', textDecoration: 'none' }}>View All Events →</a>
          </div>
        </div>
      </section>

      {/* Schedule Visit CTA */}
      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <MapPin size={48} color="white" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Visit Us in Person</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>
            Experience our campus firsthand. Schedule a tour and information session with our admissions team.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Schedule a Visit <ChevronRight size={20} />
            </Link>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateCampusPage };
