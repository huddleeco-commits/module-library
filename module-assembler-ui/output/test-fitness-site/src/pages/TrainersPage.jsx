import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Instagram, Mail, ChevronRight } from 'lucide-react';

const COLORS = {
  "primary": "#DC2626",
  "secondary": "#EF4444",
  "accent": "#FCA5A5",
  "background": "#FEF2F2",
  "text": "#1F2937"
};

const TRAINERS = [
  { id: 1, name: 'Mike Johnson', role: 'Head Trainer', specialty: 'Strength & Conditioning', certifications: ['NASM-CPT', 'CSCS'], bio: '10+ years helping clients achieve their fitness goals.', rating: 4.9, reviews: 127 },
  { id: 2, name: 'Sarah Chen', role: 'Yoga Instructor', specialty: 'Yoga & Mindfulness', certifications: ['RYT-500', 'Meditation Coach'], bio: 'Dedicated to helping you find balance in body and mind.', rating: 5.0, reviews: 98 },
  { id: 3, name: 'Marcus Williams', role: 'Boxing Coach', specialty: 'Boxing & HIIT', certifications: ['USA Boxing Coach', 'ACE-CPT'], bio: 'Former amateur boxer, passionate about functional fitness.', rating: 4.8, reviews: 85 },
  { id: 4, name: 'Emily Rodriguez', role: 'Spin Instructor', specialty: 'Cycling & Cardio', certifications: ['Schwinn Certified', 'ACE-GFI'], bio: 'Bringing high energy to every class.', rating: 4.9, reviews: 112 },
  { id: 5, name: 'David Park', role: 'CrossFit Coach', specialty: 'CrossFit & Olympic Lifting', certifications: ['CF-L3', 'USAW-L2'], bio: 'Helping athletes perform at their peak.', rating: 4.7, reviews: 76 },
  { id: 6, name: 'Lisa Thompson', role: 'Pilates Instructor', specialty: 'Pilates & Core', certifications: ['Balanced Body', 'PMA-CPT'], bio: 'Building strong foundations through mindful movement.', rating: 4.9, reviews: 91 }
];

export default function TrainersPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Trainers</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Expert coaches dedicated to your success</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          {TRAINERS.map(trainer => (
            <div key={trainer.id} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '200px', backgroundColor: `${COLORS.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: `${COLORS.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '700', color: COLORS.primary }}>
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{trainer.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontWeight: '600' }}>{trainer.rating}</span>
                    <span style={{ opacity: 0.5, fontSize: '14px' }}>({trainer.reviews})</span>
                  </div>
                </div>
                <p style={{ color: COLORS.primary, fontWeight: '600', marginBottom: '12px' }}>{trainer.role}</p>
                <p style={{ opacity: 0.7, marginBottom: '16px', lineHeight: 1.6 }}>{trainer.bio}</p>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.6 }}>Specialty: </span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{trainer.specialty}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {trainer.certifications.map((cert, i) => (
                    <span key={i} style={{ padding: '4px 12px', backgroundColor: `${COLORS.primary}10`, color: COLORS.primary, borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {cert}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{ flex: 1, padding: '12px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Book Session
                  </button>
                  <button style={{ padding: '12px', backgroundColor: 'transparent', border: `1px solid ${COLORS.primary}`, borderRadius: '8px', cursor: 'pointer' }}>
                    <Instagram size={20} color={COLORS.primary} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Award size={48} color={COLORS.primary} style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Certified Excellence</h2>
          <p style={{ opacity: 0.7, fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>
            All our trainers hold nationally recognized certifications and undergo continuous education to bring you the latest in fitness science and training techniques.
          </p>
          <Link to="/membership" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Start Training Today <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}