import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Award, Heart, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const specials = [
    { name: 'Butter Croissant', description: 'Flaky, golden, fresh from the oven', price: '$4.50', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
    { name: 'Red Velvet Cupcake', description: 'Cream cheese frosting, moist cake', price: '$5.00', image: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=400' },
    { name: 'Sourdough Loaf', description: '24-hour fermented, crusty perfection', price: '$8.00', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' }
  ];

  const reviews = [
    { text: "Best bakery in town! The croissants are out of this world.", author: "Sarah M.", stars: 5 },
    { text: "My family has been coming here for years. Always fresh, always delicious.", author: "Mike R.", stars: 5 },
    { text: "The birthday cake they made for my daughter was perfect!", author: "Lisa T.", stars: 5 }
  ];

  return (
    <div style={{ background: '#FFF8F0' }}>
      {/* Hero - Warm, Inviting */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.badge}><Heart size={14} /> Family Owned Since 2020</div>
          <h1 style={styles.heroTitle}>AI Test Bakery</h1>
          <p style={styles.heroSubtitle}>Handcrafted Baked Goods, Made Fresh Daily</p>
          <div style={styles.heroCtas}>
            <Link to="/menu" style={styles.primaryBtn}>View Our Menu</Link>
            <a href="tel:(415) 555-9876" style={styles.secondaryBtn}><Phone size={18} /> Call Us</a>
          </div>
          <div style={styles.heroInfo}>
            <span><MapPin size={16} /> 789 Tech Lane, San Francisco, CA 94102</span>
            <span><Clock size={16} /> Open 7am - 6pm Daily</span>
          </div>
        </div>
      </section>

      {/* Daily Specials */}
      <section style={styles.specials}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Today\'s Fresh Picks</h2>
            <p style={styles.sectionSubtitle}>Baked fresh this morning, just for you</p>
          </div>
          <div style={styles.specialsGrid}>
            {specials.map((item, i) => (
              <div key={i} style={styles.specialCard}>
                <img src={item.image} alt={item.name} style={styles.specialImage} />
                <div style={styles.specialInfo}>
                  <h3 style={styles.specialName}>{item.name}</h3>
                  <p style={styles.specialDesc}>{item.description}</p>
                  <p style={styles.specialPrice}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.centerCta}>
            <Link to="/menu" style={styles.outlineBtn}>See Full Menu <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={styles.story}>
        <div style={styles.storyContainer}>
          <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920" alt="Our story" style={styles.storyImage} />
          <div style={styles.storyContent}>
            <h2 style={styles.storyTitle}>Our Story</h2>
            <p style={styles.storyText}>
              For over 6 years, we've been waking up before dawn to bring you
              the freshest baked goods in the neighborhood. What started as a family recipe
              has grown into a community tradition.
            </p>
            <p style={styles.storyText}>
              We believe in simple ingredients, time-honored techniques, and treating
              every customer like family. Thank you for being part of our journey.
            </p>
            <Link to="/about" style={styles.storyLink}>Learn More About Us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={styles.reviews}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>What Our Neighbors Say</h2>
          <div style={styles.reviewsGrid}>
            {reviews.map((review, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.stars}>
                  {[...Array(review.stars)].map((_, j) => <Star key={j} size={16} fill="#8B4513" color="#8B4513" />)}
                </div>
                <p style={styles.reviewText}>"{review.text}"</p>
                <p style={styles.reviewAuthor}>— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section style={styles.contactBar}>
        <div style={styles.contactContent}>
          <div>
            <h3 style={styles.contactTitle}>Come Visit Us!</h3>
            <p style={styles.contactText}>789 Tech Lane, San Francisco, CA 94102</p>
          </div>
          <a href="tel:(415) 555-9876" style={styles.contactBtn}><Phone size={20} /> (415) 555-9876</a>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' },
  heroContent: { position: 'relative', textAlign: 'center', padding: '40px 24px', color: '#fff', maxWidth: '700px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '30px', marginBottom: '24px', fontSize: '0.9rem' },
  heroTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '700', marginBottom: '16px', textShadow: '0 2px 20px rgba(0,0,0,0.3)' },
  heroSubtitle: { fontSize: '1.25rem', marginBottom: '32px', opacity: 0.95 },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' },
  primaryBtn: { background: '#8B4513', color: '#fff', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' },
  secondaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' },
  heroInfo: { display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.95rem', opacity: 0.9 },
  specials: { padding: '80px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  sectionHeader: { textAlign: 'center', marginBottom: '48px' },
  sectionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', marginBottom: '12px' },
  sectionTitleCenter: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', textAlign: 'center', marginBottom: '48px' },
  sectionSubtitle: { color: '#64748b', fontSize: '1.1rem' },
  specialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' },
  specialCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  specialImage: { width: '100%', height: '200px', objectFit: 'cover', filter: 'none' },
  specialInfo: { padding: '20px' },
  specialName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '600', color: '#3E2723', marginBottom: '8px' },
  specialDesc: { color: '#64748b', marginBottom: '12px', lineHeight: 1.5 },
  specialPrice: { color: '#8B4513', fontWeight: '700', fontSize: '1.2rem' },
  centerCta: { textAlign: 'center', marginTop: '40px' },
  outlineBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B4513', border: '2px solid #8B4513', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' },
  story: { padding: '80px 20px', background: '#FFF8F0' },
  storyContainer: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center', padding: '0 24px' },
  storyImage: { width: '100%', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', filter: 'none' },
  storyContent: {},
  storyTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', marginBottom: '20px' },
  storyText: { color: '#64748b', lineHeight: 1.8, marginBottom: '16px', fontSize: '1.05rem' },
  storyLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B4513', textDecoration: 'none', fontWeight: '600', marginTop: '8px' },
  reviews: { padding: '80px 20px' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  reviewCard: { background: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  stars: { display: 'flex', gap: '4px', marginBottom: '16px' },
  reviewText: { color: '#3E2723', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' },
  reviewAuthor: { color: '#64748b', fontWeight: '500' },
  contactBar: { background: '#8B4513', padding: '32px 24px' },
  contactContent: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' },
  contactTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' },
  contactText: { color: 'rgba(255,255,255,0.9)' },
  contactBtn: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', color: '#8B4513', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem' }
};
