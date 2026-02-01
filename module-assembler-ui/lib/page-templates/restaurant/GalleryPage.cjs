/**
 * Restaurant GalleryPage Generator
 */

function generateGalleryPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `/**
 * GalleryPage - ${business.name}
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Utensils, Users, Calendar, X } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const GALLERY_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'food', name: 'Our Dishes' },
  { id: 'ambiance', name: 'Ambiance' },
  { id: 'events', name: 'Events' }
];

const GALLERY_ITEMS = [
  { id: 1, category: 'food', title: 'Signature Steak', description: 'Our award-winning ribeye' },
  { id: 2, category: 'food', title: 'Fresh Seafood', description: 'Daily catch from local waters' },
  { id: 3, category: 'ambiance', title: 'Main Dining Room', description: 'Elegant and inviting' },
  { id: 4, category: 'food', title: 'Artisan Desserts', description: 'House-made daily' },
  { id: 5, category: 'ambiance', title: 'Private Dining', description: 'Perfect for special occasions' },
  { id: 6, category: 'events', title: 'Wedding Reception', description: 'Celebrating love' },
  { id: 7, category: 'food', title: 'Appetizer Selection', description: 'Start your meal right' },
  { id: 8, category: 'ambiance', title: 'Bar Area', description: 'Craft cocktails await' },
  { id: 9, category: 'events', title: 'Corporate Event', description: 'Professional gatherings' },
  { id: 10, category: 'food', title: 'Seasonal Special', description: 'Farm-fresh ingredients' },
  { id: 11, category: 'ambiance', title: 'Outdoor Patio', description: 'Al fresco dining' },
  { id: 12, category: 'events', title: 'Birthday Celebration', description: 'Making memories' }
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredItems = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: COLORS.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Gallery</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>A visual taste of what awaits</p>
      </section>

      {/* Category Filter */}
      <section style={{
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: '72px',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '16px 20px',
          justifyContent: 'center'
        }}>
          {GALLERY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: activeCategory === cat.id ? COLORS.primary : 'transparent',
                color: activeCategory === cat.id ? 'white' : COLORS.text,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              style={{
                aspectRatio: '4/3',
                backgroundColor: \`\${COLORS.primary}15\`,
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
            >
              {/* Placeholder icon */}
              <div style={{ textAlign: 'center' }}>
                {item.category === 'food' && <Utensils size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
                {item.category === 'ambiance' && <Camera size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
                {item.category === 'events' && <Users size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              </div>

              {/* Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                padding: '60px 20px 20px',
                color: 'white'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={24} color="white" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div style={{
              aspectRatio: '16/10',
              backgroundColor: \`\${COLORS.primary}20\`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedImage.category === 'food' && <Utensils size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {selectedImage.category === 'ambiance' && <Camera size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {selectedImage.category === 'events' && <Users size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>{selectedImage.title}</h3>
              <p style={{ opacity: 0.7 }}>{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Experience It?
        </h2>
        <p style={{ opacity: 0.7, marginBottom: '32px', fontSize: '18px' }}>
          Book your table and see it all in person
        </p>
        <Link to="/reservations" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: COLORS.primary,
          color: 'white',
          padding: '16px 32px',
          borderRadius: '50px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          <Calendar size={20} />
          Make a Reservation
        </Link>
      </section>
    </div>
  );
}
`;
}

module.exports = { generateGalleryPage };
