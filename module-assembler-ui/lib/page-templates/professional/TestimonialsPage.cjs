/**
 * Professional Services TestimonialsPage Generator
 */
function generateTestimonialsPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getTestimonialsContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ChevronRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TESTIMONIALS = ${JSON.stringify(content.testimonials, null, 2)};

export default function TestimonialsPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Client Reviews</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { num: '${content.rating}', label: 'Average Rating' },
            { num: '${content.reviewCount}', label: 'Total Reviews' },
            { num: '${content.recommend}', label: 'Would Recommend' }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', color: COLORS.primary }}>{s.num}</div>
              <div style={{ opacity: 0.6, fontSize: '14px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative' }}>
                <Quote size={40} color={COLORS.primary} style={{ opacity: 0.15, position: 'absolute', top: '20px', right: '20px' }} />
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.8, opacity: 0.8, fontSize: '16px' }}>
                  "{t.text}"
                </p>
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{t.name}</div>
                  {t.service && <div style={{ fontSize: '14px', opacity: 0.6 }}>{t.service}</div>}
                  {t.location && <div style={{ fontSize: '13px', opacity: 0.5 }}>{t.location}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Leave a Review</h2>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>We appreciate your feedback! Leave us a review on your preferred platform.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Google', 'Yelp', 'Facebook'].map((platform, i) => (
              <a key={i} href="#" style={{ padding: '12px 24px', backgroundColor: COLORS.background, borderRadius: '8px', fontWeight: '600', textDecoration: 'none', color: COLORS.text }}>
                Review on {platform}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>${content.ctaHeadline}</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>${content.ctaText}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            ${content.ctaButton} <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getTestimonialsContent(industry) {
  const content = {
    'law-firm': {
      subtitle: 'Hear from our satisfied clients',
      rating: '4.9',
      reviewCount: '200+',
      recommend: '98%',
      ctaHeadline: 'Ready to Get Started?',
      ctaText: 'Join our satisfied clients and let us fight for you',
      ctaButton: 'Free Consultation',
      testimonials: [
        { name: 'John Martinez', rating: 5, text: 'After my accident, I was overwhelmed and scared. The team took over, handled everything, and got me a settlement far beyond what I expected. I cannot thank them enough.', service: 'Personal Injury', location: 'Los Angeles, CA' },
        { name: 'Sarah Thompson', rating: 5, text: 'Going through my divorce was the hardest thing I have ever done, but having Sarah as my attorney made it bearable. She was compassionate, professional, and fought for my kids.', service: 'Family Law', location: 'Orange County, CA' },
        { name: 'Michael Chen', rating: 5, text: 'When I was charged with a DUI, I thought my life was over. They got the charges reduced and kept my record clean. Worth every penny.', service: 'Criminal Defense', location: 'San Diego, CA' },
        { name: 'Lisa Rodriguez', rating: 5, text: 'Professional, responsive, and they actually care about their clients. Best legal representation I have ever had.', service: 'Business Law', location: 'Irvine, CA' },
        { name: 'Robert Williams', rating: 5, text: 'Five stars is not enough. They won my case when other lawyers said it was hopeless. True advocates.', service: 'Personal Injury', location: 'Pasadena, CA' },
        { name: 'Jennifer Adams', rating: 5, text: 'Clear communication throughout my entire case. Always knew what was happening and what to expect.', service: 'Family Law', location: 'Santa Monica, CA' }
      ]
    },
    'real-estate': {
      subtitle: 'What our clients are saying',
      rating: '4.9',
      reviewCount: '500+',
      recommend: '99%',
      ctaHeadline: 'Ready to Make Your Move?',
      ctaText: 'Experience the difference of working with a top-rated team',
      ctaButton: 'Contact Us',
      testimonials: [
        { name: 'Mike & Sarah T.', rating: 5, text: 'Found our dream home in just 2 weeks! Our agent knew exactly what we wanted and made the whole process stress-free. Could not be happier!', service: 'Home Buyer', location: 'Westside' },
        { name: 'David P.', rating: 5, text: 'Sold my house for $50K over asking in just one week. Their marketing and staging advice was incredible. Best decision I made.', service: 'Home Seller', location: 'Downtown' },
        { name: 'Lisa R.', rating: 5, text: 'As a first-time buyer, I had so many questions. My agent was patient, knowledgeable, and never made me feel rushed. Highly recommend!', service: 'First-Time Buyer', location: 'Eastside' },
        { name: 'James & Maria L.', rating: 5, text: 'We have used them for 3 transactions now. Buying, selling, they handle it all with professionalism. Would not trust anyone else.', service: 'Repeat Client', location: 'Suburbs' },
        { name: 'Amanda K.', rating: 5, text: 'They helped me find the perfect investment property. Great returns and I barely had to lift a finger.', service: 'Investor', location: 'Multiple Locations' },
        { name: 'Chris M.', rating: 5, text: 'Relocated from out of state and they made it seamless. Found us a home before we even arrived. Amazing service!', service: 'Relocation', location: 'New to Area' }
      ]
    },
    'plumber': {
      subtitle: 'See why customers trust us',
      rating: '4.9',
      reviewCount: '1000+',
      recommend: '100%',
      ctaHeadline: 'Need a Plumber?',
      ctaText: 'Join thousands of satisfied customers',
      ctaButton: 'Call Now',
      testimonials: [
        { name: 'Tom H.', rating: 5, text: 'Burst pipe at 2 AM and they were here within 30 minutes. Fixed it fast and the price was fair. Lifesaver!', service: 'Emergency Service', location: 'Residential' },
        { name: 'Nancy W.', rating: 5, text: 'Finally found a plumber I can trust. Fair prices, quality work, and they clean up after themselves. My go-to from now on.', service: 'General Plumbing', location: 'Residential' },
        { name: 'Jim K.', rating: 5, text: 'Replaced my water heater same day. Showed me options, explained everything, no pressure. Great experience.', service: 'Water Heater', location: 'Residential' },
        { name: 'Maria S.', rating: 5, text: 'Used them for my restaurant. Professional, fast, and they worked around our business hours. Highly recommend for commercial.', service: 'Commercial', location: 'Restaurant' },
        { name: 'Steve B.', rating: 5, text: 'Been using them for 10 years. Always honest, always reliable. The only plumber I call.', service: 'Repeat Customer', location: 'Residential' },
        { name: 'Karen L.', rating: 5, text: 'They found a leak other plumbers missed for years. Fixed it right and now my water bill is back to normal.', service: 'Leak Detection', location: 'Residential' }
      ]
    },
    'cleaning': {
      subtitle: 'What our clients say about us',
      rating: '4.9',
      reviewCount: '2000+',
      recommend: '99%',
      ctaHeadline: 'Ready for a Cleaner Space?',
      ctaText: 'See why thousands choose us for their cleaning needs',
      ctaButton: 'Get Your Quote',
      testimonials: [
        { name: 'Emily S.', rating: 5, text: 'My house has never been cleaner! They pay attention to details I never even thought of. Worth every penny.', service: 'Regular Cleaning', location: 'Weekly Service' },
        { name: 'Mark R.', rating: 5, text: 'Reliable and thorough. Same team every time, they know my home and my preferences. Highly recommend.', service: 'Bi-Weekly', location: 'Residential' },
        { name: 'Karen L.', rating: 5, text: 'Best cleaning service we have ever used. Eco-friendly products and my allergies have improved since switching to them.', service: 'Green Cleaning', location: 'Weekly' },
        { name: 'David M.', rating: 5, text: 'They did our move-out clean and we got our full deposit back. Landlord was impressed!', service: 'Move Out', location: 'Apartment' },
        { name: 'Jennifer T.', rating: 5, text: 'Our office has never looked better. Professional service that works around our schedule.', service: 'Office Cleaning', location: 'Commercial' },
        { name: 'Robert P.', rating: 5, text: 'Trustworthy and consistent. I have never had to re-clean anything after they leave. Five stars!', service: 'Regular Cleaning', location: 'Monthly' }
      ]
    },
    'auto-shop': {
      subtitle: 'Reviews from real customers',
      rating: '4.9',
      reviewCount: '3000+',
      recommend: '98%',
      ctaHeadline: 'Time for Service?',
      ctaText: 'Experience honest auto repair that thousands trust',
      ctaButton: 'Book Appointment',
      testimonials: [
        { name: 'Chris M.', rating: 5, text: 'Finally found honest mechanics! They only recommended what I actually needed and saved me hundreds. My new go-to shop.', service: 'General Repair', location: 'Honda Civic' },
        { name: 'Amanda P.', rating: 5, text: 'Check engine light came on and they diagnosed and fixed it same day. Fair price and great service.', service: 'Diagnostics', location: 'Toyota Camry' },
        { name: 'Steve B.', rating: 5, text: 'Been bringing my cars here for 10 years. They have worked on everything from my daily driver to my classic truck. The best!', service: 'Repeat Customer', location: 'Multiple Vehicles' },
        { name: 'Maria G.', rating: 5, text: 'They sent me pictures of what was wrong with my brakes. No pressure, just honest information. Did the work for less than the dealer quoted.', service: 'Brake Service', location: 'Ford F-150' },
        { name: 'Kevin L.', rating: 5, text: 'Quick oil change, friendly service, and they caught a potential problem during inspection. Saved me a breakdown!', service: 'Oil Change', location: 'Chevrolet Silverado' },
        { name: 'Jennifer R.', rating: 5, text: 'AC stopped working in summer. They had me cool again by the end of the day. Reasonable price too.', service: 'AC Repair', location: 'BMW 3 Series' }
      ]
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateTestimonialsPage };
