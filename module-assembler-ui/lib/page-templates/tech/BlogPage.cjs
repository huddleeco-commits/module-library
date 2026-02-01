/**
 * Tech BlogPage Generator
 */
function generateBlogPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight, Tag, Search } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const POSTS = ${JSON.stringify(content.posts, null, 2)};

const CATEGORIES = ${JSON.stringify(content.categories, null, 2)};

export default function BlogPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? POSTS : POSTS.filter(p => p.category === filter);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>${content.headline}</h1>
        <p style={{ fontSize: '20px', opacity: 0.7 }}>${content.subheadline}</p>
      </section>

      <section style={{ padding: '0 20px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '10px 20px', borderRadius: '20px', border: filter === 'all' ? 'none' : '1px solid rgba(0,0,0,0.1)', backgroundColor: filter === 'all' ? COLORS.primary : 'white', color: filter === 'all' ? 'white' : COLORS.text, fontWeight: '500', cursor: 'pointer' }}>
              All Posts
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ padding: '10px 20px', borderRadius: '20px', border: filter === cat.id ? 'none' : '1px solid rgba(0,0,0,0.1)', backgroundColor: filter === cat.id ? COLORS.primary : 'white', color: filter === cat.id ? 'white' : COLORS.text, fontWeight: '500', cursor: 'pointer' }}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          {filter === 'all' && (
            <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '300px', background: \`linear-gradient(135deg, \${COLORS.primary}20, \${COLORS.secondary}20)\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={60} color={COLORS.primary} style={{ opacity: 0.4 }} />
              </div>
              <div style={{ padding: '40px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ padding: '4px 12px', backgroundColor: \`\${COLORS.primary}15\`, color: COLORS.primary, borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>Featured</span>
                  <span style={{ padding: '4px 12px', backgroundColor: '#F3F4F6', borderRadius: '20px', fontSize: '13px' }}>{POSTS[0].category}</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>{POSTS[0].title}</h2>
                <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '24px' }}>{POSTS[0].excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.6, fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={16} /> {POSTS[0].author}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {POSTS[0].readTime}</span>
                  </div>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.primary, fontWeight: '600', textDecoration: 'none' }}>
                    Read More <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {(filter === 'all' ? filtered.slice(1) : filtered).map((post, idx) => (
              <article key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height: '180px', background: \`linear-gradient(135deg, \${COLORS.primary}15, \${COLORS.secondary}15)\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={40} color={COLORS.primary} style={{ opacity: 0.3 }} />
                </div>
                <div style={{ padding: '24px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#F3F4F6', borderRadius: '20px', fontSize: '12px' }}>{post.category}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '12px 0', lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', opacity: 0.6 }}>
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <a href="#" style={{ color: COLORS.primary, fontWeight: '500', textDecoration: 'none', fontSize: '14px' }}>
                      Read →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Subscribe to Our Newsletter</h2>
          <p style={{ opacity: 0.6, marginBottom: '24px' }}>Get the latest posts delivered straight to your inbox.</p>
          <form style={{ display: 'flex', gap: '12px' }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '14px 20px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
            <button type="submit" style={{ padding: '14px 28px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}`;
}

function getContent(industry) {
  const content = {
    'saas': {
      headline: 'Blog',
      subheadline: 'Insights, tips, and best practices for modern teams',
      categories: [
        { id: 'product', name: 'Product Updates' },
        { id: 'tips', name: 'Tips & Tricks' },
        { id: 'engineering', name: 'Engineering' },
        { id: 'company', name: 'Company News' }
      ],
      posts: [
        { title: 'Introducing Our New AI-Powered Features', category: 'product', author: 'Product Team', readTime: '5 min read', excerpt: 'We are excited to announce our latest AI features that will transform how you work.' },
        { title: '10 Productivity Hacks Using Our Platform', category: 'tips', author: 'Sarah Chen', readTime: '8 min read', excerpt: 'Discover hidden features and workflows that will supercharge your productivity.' },
        { title: 'How We Scaled to 1 Million Users', category: 'engineering', author: 'Marcus Lee', readTime: '12 min read', excerpt: 'A deep dive into the technical challenges we faced and how we overcame them.' },
        { title: 'Our Series B Funding Announcement', category: 'company', author: 'CEO', readTime: '4 min read', excerpt: 'We are thrilled to announce our $50M Series B funding round.' },
        { title: 'Best Practices for Team Collaboration', category: 'tips', author: 'Emily Wang', readTime: '7 min read', excerpt: 'Learn how top teams use our platform to collaborate effectively.' },
        { title: 'New Integrations: Slack, Notion, and More', category: 'product', author: 'Product Team', readTime: '4 min read', excerpt: 'Connect with your favorite tools seamlessly with our new integrations.' }
      ]
    },
    'ecommerce': {
      headline: 'Blog',
      subheadline: 'Style guides, product news, and shopping tips',
      categories: [
        { id: 'style', name: 'Style Guide' },
        { id: 'new', name: 'New Arrivals' },
        { id: 'tips', name: 'Shopping Tips' },
        { id: 'sustainability', name: 'Sustainability' }
      ],
      posts: [
        { title: 'Spring 2024 Style Guide: Top Trends', category: 'style', author: 'Style Team', readTime: '6 min read', excerpt: 'Discover the hottest trends this season and how to style them.' },
        { title: 'New Collection Drop: Designer Collaboration', category: 'new', author: 'Product Team', readTime: '4 min read', excerpt: 'Introducing our exclusive collaboration with top designers.' },
        { title: 'How to Find Your Perfect Size Online', category: 'tips', author: 'Lisa Park', readTime: '5 min read', excerpt: 'Never miss with sizing again using our comprehensive guide.' },
        { title: 'Our Commitment to Sustainable Fashion', category: 'sustainability', author: 'CEO', readTime: '7 min read', excerpt: 'Learn about our initiatives to reduce our environmental footprint.' },
        { title: 'Building a Capsule Wardrobe: Essentials', category: 'style', author: 'Style Team', readTime: '8 min read', excerpt: 'Curate a versatile wardrobe with these must-have pieces.' },
        { title: 'Maximize Your Rewards: Insider Tips', category: 'tips', author: 'Customer Team', readTime: '4 min read', excerpt: 'Get the most out of our rewards program with these strategies.' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateBlogPage };
