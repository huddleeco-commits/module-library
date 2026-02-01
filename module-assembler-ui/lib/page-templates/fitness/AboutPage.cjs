/**
 * Fitness AboutPage Generator
 */
function generateAboutPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, Users, Trophy, Award, Dumbbell, Star, ChevronRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>About ${business.name}</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Where transformation begins</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Our Story</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.8, marginBottom: '16px' }}>
              Founded with a simple mission: to create a fitness community where everyone feels welcome and empowered to achieve their goals. We believe that fitness is not just about physical transformation—it's about building confidence, resilience, and a healthier lifestyle.
            </p>
            <p style={{ opacity: 0.7, lineHeight: 1.8 }}>
              What started as a small gym has grown into a thriving fitness family. Our members don't just work out here—they become part of a supportive community that celebrates every milestone, big or small.
            </p>
          </div>
          <div style={{ height: '400px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={80} color={COLORS.primary} style={{ opacity: 0.4 }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { icon: Target, title: 'Results-Driven', desc: 'Every program is designed to deliver measurable results. We track progress and adjust to ensure you reach your goals.' },
              { icon: Heart, title: 'Community First', desc: 'We foster a supportive environment where members motivate each other and celebrate victories together.' },
              { icon: Award, title: 'Expert Guidance', desc: 'Our certified trainers bring years of experience and continuous education to every session.' },
              { icon: Trophy, title: 'Excellence', desc: 'From our equipment to our programming, we maintain the highest standards in everything we do.' }
            ].map((value, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <value.icon size={36} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { num: '10+', label: 'Years of Excellence' },
            { num: '5000+', label: 'Active Members' },
            { num: '50+', label: 'Classes Weekly' },
            { num: '20+', label: 'Expert Trainers' }
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>{stat.num}</div>
              <div style={{ opacity: 0.7, fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Our Facilities</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Cardio Zone', desc: '40+ machines including treadmills, bikes, ellipticals, and rowers' },
              { title: 'Free Weights', desc: 'Dumbbells up to 150lbs, Olympic platforms, and specialized bars' },
              { title: 'Functional Training', desc: 'TRX, kettlebells, battle ropes, and plyometric equipment' },
              { title: 'Group Fitness Studios', desc: '3 dedicated studios for classes ranging from yoga to HIIT' },
              { title: 'Recovery Area', desc: 'Stretching zone, foam rollers, and massage guns' },
              { title: 'Locker Rooms', desc: 'Private showers, towel service, and secure lockers' }
            ].map((facility, i) => (
              <div key={i} style={{ padding: '24px', backgroundColor: COLORS.background, borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{facility.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: 1.6 }}>{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Star size={48} color={COLORS.primary} style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Ready to Join the Family?</h2>
          <p style={{ opacity: 0.7, fontSize: '18px', marginBottom: '32px' }}>Start your transformation journey with a free 7-day trial</p>
          <Link to="/membership" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
            Get Started <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateAboutPage };
