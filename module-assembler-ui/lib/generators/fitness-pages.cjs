/**
 * Fitness & Wellness Page Generators
 *
 * Generates pages for gyms, fitness centers, yoga studios, and wellness facilities
 * Archetypes: energetic-bold, zen-peaceful, community-social
 */

const IMAGES = {
  gym: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920',
    equipment: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
    class: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    trainer: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    weights: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800'
  },
  yoga: {
    hero: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1920',
    class: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800',
    pose: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    studio: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
    meditation: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800'
  },
  wellness: {
    hero: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920',
    spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    healthy: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'
  }
};

const FITNESS_ARCHETYPES = {
  'energetic-bold': {
    id: 'energetic-bold',
    name: 'Energetic & Bold',
    description: 'High energy, motivating, intense. Perfect for gyms and fitness centers.',
    bestFor: ['gym', 'crossfit', 'bootcamp', 'fitness center', 'boxing'],
    style: {
      colors: { primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24' },
      typography: { headingFont: "'Oswald', sans-serif", headingWeight: '700', headingStyle: 'uppercase' },
      borderRadius: '8px'
    }
  },
  'zen-peaceful': {
    id: 'zen-peaceful',
    name: 'Zen & Peaceful',
    description: 'Calm, serene, mindful. Ideal for yoga and meditation studios.',
    bestFor: ['yoga', 'pilates', 'meditation', 'wellness', 'spa'],
    style: {
      colors: { primary: '#059669', secondary: '#10b981', accent: '#d4a574' },
      typography: { headingFont: "'Cormorant Garamond', serif", headingWeight: '500' },
      borderRadius: '24px'
    }
  },
  'community-social': {
    id: 'community-social',
    name: 'Community & Social',
    description: 'Friendly, inclusive, community-focused. Great for group fitness.',
    bestFor: ['community gym', 'group fitness', 'dance studio', 'martial arts'],
    style: {
      colors: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#f472b6' },
      typography: { headingFont: "'Poppins', sans-serif", headingWeight: '600' },
      borderRadius: '16px'
    }
  }
};

const FITNESS_INDUSTRIES = ['gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'boxing', 'martial arts',
  'dance', 'studio', 'wellness', 'health club', 'bootcamp', 'personal training', 'spin', 'cycling'];

function isFitnessIndustry(industry) {
  if (!industry) return false;
  const lower = industry.toLowerCase();
  return FITNESS_INDUSTRIES.some(ind => lower.includes(ind));
}

function detectFitnessArchetype(businessData) {
  const combined = `${businessData.name || ''} ${businessData.description || ''} ${businessData.industry || ''}`.toLowerCase();

  if (combined.includes('yoga') || combined.includes('pilates') || combined.includes('meditation') ||
      combined.includes('zen') || combined.includes('wellness') || combined.includes('mindful')) {
    return FITNESS_ARCHETYPES['zen-peaceful'];
  }

  if (combined.includes('crossfit') || combined.includes('bootcamp') || combined.includes('boxing') ||
      combined.includes('intense') || combined.includes('power') || combined.includes('strength')) {
    return FITNESS_ARCHETYPES['energetic-bold'];
  }

  return FITNESS_ARCHETYPES['community-social'];
}

function getFitnessArchetype(id) {
  return FITNESS_ARCHETYPES[id] || FITNESS_ARCHETYPES['community-social'];
}

function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getFitnessArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Studio';
  const phone = businessData.phone || '(555) 123-4567';
  const industry = (businessData.industry || 'fitness').toLowerCase();

  const images = industry.includes('yoga') || industry.includes('pilates') || industry.includes('meditation') ? IMAGES.yoga :
                 industry.includes('wellness') || industry.includes('spa') ? IMAGES.wellness : IMAGES.gym;

  let c = { ...style.colors, ...colors };
  if (styleOverrides.isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    headlineStyle: styleOverrides.headlineStyle || style.typography?.headingStyle || 'none',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px'
  };

  if (arch.id === 'zen-peaceful') {
    return generateZenHomePage(businessName, phone, images, c, themeStyle);
  } else if (arch.id === 'energetic-bold') {
    return generateEnergeticHomePage(businessName, phone, images, c, themeStyle);
  } else {
    return generateCommunityHomePage(businessName, phone, images, c, themeStyle);
  }
}

function generateEnergeticHomePage(businessName, phone, images, colors, style) {
  const c = colors;
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Dumbbell, Users, Clock, Trophy, Zap, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '100vh', background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url("${images.hero}") center/cover fixed', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '${style.sectionPadding}' },
    heroContent: { maxWidth: '900px' },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: '700', color: '#fff', marginBottom: '24px', textTransform: '${style.headlineStyle}', letterSpacing: '0.05em', lineHeight: 1 },
    heroAccent: { color: '${c.primary}' },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.5rem', color: '#fff', marginBottom: '40px', opacity: 0.9 },
    heroButtons: { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '${c.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '3px solid #fff', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionDark: { padding: '${style.sectionPadding}', background: '#0a0a0a' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '${c.text || "#fff"}', textAlign: 'center', marginBottom: '16px', textTransform: '${style.headlineStyle}' },
    sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${c.textMuted || "#999"}', textAlign: 'center', marginBottom: '48px', fontSize: '1.1rem' },
    programsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${style.gap}', maxWidth: '1200px', margin: '0 auto' },
    programCard: { background: '${c.backgroundAlt || "#111"}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', border: '2px solid transparent', transition: 'border-color 0.3s' },
    programIcon: { width: '60px', height: '60px', background: '${c.primary}', borderRadius: '${style.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#fff' },
    programTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '12px', textTransform: 'uppercase' },
    programDesc: { fontFamily: "${style.fontBody}", color: '#999', lineHeight: 1.6 },
    statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' },
    statValue: { fontFamily: "${style.fontHeading}", fontSize: '3.5rem', fontWeight: '700', color: '${c.primary}', marginBottom: '8px' },
    statLabel: { fontFamily: "${style.fontBody}", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' },
    cta: { padding: '${style.sectionPadding}', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px', textTransform: 'uppercase' }
  };

  const programs = [
    { icon: Flame, title: 'HIIT Training', description: 'High-intensity intervals that torch calories and build endurance' },
    { icon: Dumbbell, title: 'Strength Training', description: 'Build muscle and increase power with expert coaching' },
    { icon: Users, title: 'Group Classes', description: 'Energizing group workouts led by certified instructors' },
    { icon: Trophy, title: 'Personal Training', description: 'One-on-one sessions tailored to your goals' }
  ];

  const stats = [
    { value: '50+', label: 'Classes Weekly' },
    { value: '20+', label: 'Expert Trainers' },
    { value: '10K+', label: 'Members Strong' },
    { value: '24/7', label: 'Access' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>PUSH YOUR <span style={styles.heroAccent}>LIMITS</span></h1>
          <p style={styles.heroSubtitle}>Transform your body. Transform your life. Join the most intense fitness community.</p>
          <div style={styles.heroButtons}>
            <Link to="/contact" style={styles.btnPrimary}>Start Free Trial <ChevronRight size={20} /></Link>
            <Link to="/services" style={styles.btnSecondary}>View Classes</Link>
          </div>
        </div>
      </section>

      <section style={styles.sectionDark}>
        <div style={styles.statsBar}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{...styles.sectionDark, paddingTop: '40px'}}>
        <h2 style={styles.sectionTitle}>Programs</h2>
        <p style={styles.sectionSubtitle}>Find the workout that fits your goals</p>
        <div style={styles.programsGrid}>
          {programs.map((program, i) => (
            <div key={i} style={styles.programCard}>
              <div style={styles.programIcon}><program.icon size={28} /></div>
              <h3 style={styles.programTitle}>{program.title}</h3>
              <p style={styles.programDesc}>{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <Link to="/contact" style={{...styles.btnPrimary, background: '#fff', color: '${c.primary}'}}>Claim Free Week <ChevronRight size={20} /></Link>
      </section>
    </div>
  );
}
`;
}

function generateZenHomePage(businessName, phone, images, colors, style) {
  const c = colors;
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Heart, Feather, Calendar, Users, Clock, Leaf } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '90vh', background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("${images.hero}") center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '${style.sectionPadding}' },
    heroContent: { maxWidth: '700px' },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '500', color: '#fff', marginBottom: '24px', lineHeight: 1.2 },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', color: '#fff', marginBottom: '40px', opacity: 0.95, lineHeight: 1.7 },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '${c.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '500', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '500', textDecoration: 'none' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${style.sectionPadding}', background: '${c.backgroundAlt || "#f0fdf4"}' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '500', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.7 },
    classesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${style.gap}', maxWidth: '1100px', margin: '0 auto' },
    classCard: { background: '#fff', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    classIcon: { width: '72px', height: '72px', background: '${c.primary}15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '${c.primary}' },
    classTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '500', color: '${c.text}', marginBottom: '12px' },
    classDesc: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', lineHeight: 1.6 },
    features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' },
    featureItem: { textAlign: 'center' },
    featureIcon: { width: '56px', height: '56px', background: '${c.primary}', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff' },
    featureTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.1rem', fontWeight: '500', color: '${c.text}', marginBottom: '8px' },
    featureText: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', fontSize: '0.9rem' },
    cta: { padding: '${style.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '500', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${style.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }
  };

  const classes = [
    { icon: Sun, title: 'Vinyasa Flow', description: 'Dynamic, breath-synchronized movement for strength and flexibility' },
    { icon: Moon, title: 'Restorative', description: 'Gentle, supported poses for deep relaxation and recovery' },
    { icon: Heart, title: 'Meditation', description: 'Guided sessions to cultivate mindfulness and inner peace' },
    { icon: Feather, title: 'Yin Yoga', description: 'Long-held poses for deep tissue release and flexibility' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Find Your Balance</h1>
          <p style={styles.heroSubtitle}>A sanctuary for mind, body, and spirit. Join our community and discover the transformative power of yoga.</p>
          <div style={styles.heroButtons}>
            <Link to="/contact" style={styles.btnPrimary}><Calendar size={18} /> Book a Class</Link>
            <Link to="/services" style={styles.btnSecondary}>View Schedule</Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Classes</h2>
        <p style={styles.sectionSubtitle}>Whether you're seeking strength, flexibility, or peace of mind, we have a practice for you</p>
        <div style={styles.classesGrid}>
          {classes.map((cls, i) => (
            <div key={i} style={styles.classCard}>
              <div style={styles.classIcon}><cls.icon size={32} /></div>
              <h3 style={styles.classTitle}>{cls.title}</h3>
              <p style={styles.classDesc}>{cls.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>The Experience</h2>
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Users size={24} /></div>
            <h3 style={styles.featureTitle}>Small Classes</h3>
            <p style={styles.featureText}>Intimate settings for personalized attention</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Leaf size={24} /></div>
            <h3 style={styles.featureTitle}>All Levels Welcome</h3>
            <p style={styles.featureText}>Beginners to advanced practitioners</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Clock size={24} /></div>
            <h3 style={styles.featureTitle}>Flexible Schedule</h3>
            <p style={styles.featureText}>Morning, afternoon, and evening classes</p>
          </div>
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Begin Your Journey</h2>
        <p style={styles.ctaText}>First class is free for new students</p>
        <Link to="/contact" style={{...styles.btnPrimary, background: '#fff', color: '${c.primary}'}}>Start Today</Link>
      </section>
    </div>
  );
}
`;
}

function generateCommunityHomePage(businessName, phone, images, colors, style) {
  const c = colors;
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Zap, Calendar, Star, Trophy, Clock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '85vh', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)', display: 'flex', alignItems: 'center', padding: '${style.sectionPadding}' },
    heroInner: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
    heroContent: { },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '600', color: '#fff', marginBottom: '24px', lineHeight: 1.2 },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.2rem', color: 'rgba(255,255,255,0.95)', marginBottom: '32px', lineHeight: 1.7 },
    heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    btnPrimary: { background: '#fff', color: '${c.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    heroImage: { borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' },
    heroImg: { width: '100%', height: '450px', objectFit: 'cover' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.25rem', fontWeight: '600', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' },
    classesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${style.gap}', maxWidth: '1100px', margin: '0 auto' },
    classCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    classIcon: { width: '56px', height: '56px', background: '${c.primary}15', borderRadius: '${style.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '${c.primary}' },
    classTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    classDesc: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', marginBottom: '16px' },
    classTime: { fontFamily: "${style.fontBody}", color: '${c.primary}', fontSize: '0.9rem', fontWeight: '500' },
    cta: { padding: '${style.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${style.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }
  };

  const classes = [
    { icon: Zap, title: 'HIIT Circuit', description: 'High-energy interval training for all levels', time: 'Mon, Wed, Fri - 6AM & 6PM' },
    { icon: Users, title: 'Group Strength', description: 'Build strength together with guided workouts', time: 'Tue, Thu - 5:30PM' },
    { icon: Heart, title: 'Cardio Dance', description: 'Fun, energizing dance-based cardio', time: 'Sat - 10AM' },
    { icon: Trophy, title: 'Boot Camp', description: 'Challenge yourself with varied workouts', time: 'Mon, Wed - 7:30AM' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Fitness is Better Together</h1>
            <p style={styles.heroSubtitle}>Join our welcoming community and discover the motivation that comes from working out with friends. Every body is welcome here.</p>
            <div style={styles.heroButtons}>
              <Link to="/contact" style={styles.btnPrimary}><Calendar size={18} /> Try Free Class</Link>
              <Link to="/services" style={styles.btnSecondary}>View Schedule</Link>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${images.hero}" alt="${businessName}" style={styles.heroImg} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Group Classes</h2>
        <p style={styles.sectionSubtitle}>Something for everyone, from beginners to fitness enthusiasts</p>
        <div style={styles.classesGrid}>
          {classes.map((cls, i) => (
            <div key={i} style={styles.classCard}>
              <div style={styles.classIcon}><cls.icon size={26} /></div>
              <h3 style={styles.classTitle}>{cls.title}</h3>
              <p style={styles.classDesc}>{cls.description}</p>
              <p style={styles.classTime}><Clock size={14} style={{marginRight: '6px', verticalAlign: 'middle'}} />{cls.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Join Our Community</h2>
        <p style={styles.ctaText}>First class is always free - come see what we're all about!</p>
        <Link to="/contact" style={styles.btnPrimary}>Get Started <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
`;
}

function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getFitnessArchetype(archetype) : archetype;
  const style = arch.style;
  let c = { ...style.colors, ...colors };
  if (styleOverrides.isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }
  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '24px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '14px 28px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const styles = {
    hero: { padding: '120px 24px 60px', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary}88 100%)', textAlign: 'center' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    membershipGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1000px', margin: '0 auto' },
    membershipCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
    membershipTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    membershipPrice: { fontFamily: "${themeStyle.fontBody}", fontSize: '2.5rem', fontWeight: '700', color: '${c.primary}', marginBottom: '8px' },
    membershipPeriod: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '24px' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontFamily: "${themeStyle.fontBody}", color: '${c.text}' },
    membershipBtn: { display: 'block', background: '${c.primary}', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none', textAlign: 'center' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
  };

  const memberships = [
    { title: 'Basic', price: '$29', period: '/month', features: ['Gym access', 'Locker room', 'Free WiFi', '2 guest passes/month'] },
    { title: 'Premium', price: '$59', period: '/month', features: ['Everything in Basic', 'All group classes', 'Personal training intro', 'Unlimited guests'] },
    { title: 'VIP', price: '$99', period: '/month', features: ['Everything in Premium', '4 PT sessions/month', 'Nutrition coaching', 'Recovery services'] }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Membership Plans</h1>
        <p style={styles.heroSubtitle}>Find the perfect plan for your fitness journey</p>
      </section>

      <section style={styles.section}>
        <div style={styles.membershipGrid}>
          {memberships.map((plan, i) => (
            <div key={i} style={styles.membershipCard}>
              <h2 style={styles.membershipTitle}>{plan.title}</h2>
              <div style={styles.membershipPrice}>{plan.price}</div>
              <div style={styles.membershipPeriod}>{plan.period}</div>
              <ul style={styles.featureList}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={styles.featureItem}>
                    <CheckCircle size={18} color="${c.primary}" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/contact" style={styles.membershipBtn}>Get Started</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Not Sure? Try Us Free</h2>
        <Link to="/contact" style={styles.ctaBtn}>Start Free Trial <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
`;
}

module.exports = {
  generateHomePage,
  generateServicesPage,
  generateEnergeticHomePage,
  generateZenHomePage,
  generateCommunityHomePage,
  IMAGES,
  FITNESS_ARCHETYPES,
  FITNESS_INDUSTRIES,
  isFitnessIndustry,
  detectFitnessArchetype,
  getFitnessArchetype
};
