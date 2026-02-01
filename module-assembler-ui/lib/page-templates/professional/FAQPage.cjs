/**
 * Professional Services FAQPage Generator
 */
function generateFAQPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getFAQContent(business.industry);

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Phone, HelpCircle } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const FAQS = ${JSON.stringify(content.faqs, null, 2)};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: '18px', fontWeight: '600', paddingRight: '20px' }}>{q}</span>
        {open ? <ChevronUp size={24} color={COLORS.primary} /> : <ChevronDown size={24} opacity={0.5} />}
      </button>
      {open && (
        <div style={{ paddingBottom: '24px', opacity: 0.7, lineHeight: 1.7, fontSize: '16px' }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', padding: '20px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {FAQS.map((faq, idx) => (
            <FAQItem key={idx} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={36} color={COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Still Have Questions?</h3>
            <p style={{ opacity: 0.7 }}>${content.stillQuestionsText}</p>
          </div>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <Phone size={18} /> Contact Us
          </Link>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>${content.ctaHeadline}</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>${content.ctaText}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            ${content.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getFAQContent(industry) {
  const content = {
    'law-firm': {
      subtitle: 'Common questions about our legal services',
      stillQuestionsText: 'Our team is happy to answer any questions you may have about your case.',
      ctaHeadline: 'Ready to Discuss Your Case?',
      ctaText: 'Schedule your free consultation today',
      ctaButton: 'Free Consultation',
      faqs: [
        { q: 'How much does a consultation cost?', a: 'We offer free initial consultations for most cases. You can discuss your situation with an attorney at no cost or obligation.' },
        { q: 'How long will my case take?', a: 'Every case is different. Simple matters may resolve in weeks, while complex litigation can take months or years. We will give you a realistic timeline during your consultation.' },
        { q: 'Do I have to go to court?', a: 'Many cases settle without ever going to court. However, we prepare every case as if it will go to trial to ensure the best possible outcome.' },
        { q: 'How are your fees structured?', a: 'Fee structures vary by case type. Personal injury cases are typically handled on contingency (you pay nothing unless we win). Other cases may be hourly or flat fee.' },
        { q: 'Will I work directly with an attorney?', a: 'Yes. While our support staff handles administrative matters, you will have direct access to your attorney throughout your case.' },
        { q: 'What should I bring to my consultation?', a: 'Bring any relevant documents such as police reports, medical records, contracts, or correspondence related to your case.' }
      ]
    },
    'real-estate': {
      subtitle: 'Answers to common real estate questions',
      stillQuestionsText: 'Our agents are ready to help with any questions about buying or selling.',
      ctaHeadline: 'Ready to Get Started?',
      ctaText: 'Let us help you with your real estate needs',
      ctaButton: 'Contact Us',
      faqs: [
        { q: 'How much does it cost to work with a buyer\'s agent?', a: 'As a buyer, our services are typically free to you. The seller usually pays the commission for both agents.' },
        { q: 'How long does it take to buy a home?', a: 'From starting your search to closing, expect 2-4 months on average. This can vary based on market conditions and your specific situation.' },
        { q: 'What is the commission rate?', a: 'Our commission rates are competitive and negotiable. We will discuss this during our initial consultation and put everything in writing.' },
        { q: 'Should I sell my home before buying a new one?', a: 'It depends on your financial situation and market conditions. We can help you evaluate your options, including contingent offers and bridge loans.' },
        { q: 'How do you market listings?', a: 'We use professional photography, virtual tours, social media, MLS listings, and our network of buyers to get maximum exposure for your property.' },
        { q: 'Can you help with investment properties?', a: 'Absolutely! We work with investors of all levels, from first-time to experienced, and can help analyze deals for rental or flip potential.' }
      ]
    },
    'plumber': {
      subtitle: 'Common questions about our plumbing services',
      stillQuestionsText: 'Call us anytime - we are happy to answer your plumbing questions.',
      ctaHeadline: 'Need a Plumber?',
      ctaText: 'We are available 24/7 for all your plumbing needs',
      ctaButton: 'Call Now',
      faqs: [
        { q: 'Do you offer 24/7 emergency service?', a: 'Yes! We are available 24 hours a day, 7 days a week for plumbing emergencies. Call anytime and a plumber will be dispatched.' },
        { q: 'How much do you charge?', a: 'We provide upfront pricing before starting any work. You will know exactly what to expect - no surprise charges.' },
        { q: 'Are you licensed and insured?', a: 'Yes, we are fully licensed, bonded, and insured. All our plumbers are trained professionals.' },
        { q: 'Do you guarantee your work?', a: 'Absolutely. We stand behind our work with a satisfaction guarantee. If something is not right, we will make it right.' },
        { q: 'How fast can you get here?', a: 'For emergencies, we typically arrive within 30-60 minutes. For scheduled appointments, we offer convenient time windows.' },
        { q: 'Do you work on all types of plumbing?', a: 'Yes, we handle everything from small repairs to major installations, both residential and commercial.' }
      ]
    },
    'cleaning': {
      subtitle: 'Questions about our cleaning services',
      stillQuestionsText: 'We are happy to answer any questions about our services.',
      ctaHeadline: 'Ready for a Clean Home?',
      ctaText: 'Get your free quote today - no obligation',
      ctaButton: 'Get Your Quote',
      faqs: [
        { q: 'What is included in a standard cleaning?', a: 'Our standard cleaning includes all living spaces: dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning, and more. We provide a detailed checklist.' },
        { q: 'Do I need to be home during cleaning?', a: 'No, many clients give us access while they are at work. We are bonded and insured, and your security is our priority.' },
        { q: 'Do you bring your own supplies?', a: 'Yes, we bring all cleaning supplies and equipment. We use eco-friendly products, or can use your preferred products if requested.' },
        { q: 'How do you vet your cleaners?', a: 'All our cleaners undergo thorough background checks, interviews, and training before joining our team.' },
        { q: 'What if I am not satisfied?', a: 'We offer a satisfaction guarantee. If you are not happy with any aspect of your cleaning, let us know within 24 hours and we will make it right.' },
        { q: 'Can I request the same cleaner each time?', a: 'Yes! We try to send the same team to regular clients so they learn your home and preferences.' }
      ]
    },
    'auto-shop': {
      subtitle: 'Common questions about our auto services',
      stillQuestionsText: 'Our service advisors are ready to answer any questions.',
      ctaHeadline: 'Time for Service?',
      ctaText: 'Schedule your appointment online or give us a call',
      ctaButton: 'Book Appointment',
      faqs: [
        { q: 'Do you work on all makes and models?', a: 'Yes, we service all domestic and import vehicles. Our ASE certified technicians are trained on everything from basic maintenance to complex repairs.' },
        { q: 'Do you offer warranties?', a: 'Yes, we offer a 12-month/12,000-mile warranty on parts and labor for most repairs.' },
        { q: 'How long will my repair take?', a: 'It depends on the repair. Many services like oil changes and brake work are same-day. We will give you an accurate estimate when you bring your car in.' },
        { q: 'Do you offer loaner cars?', a: 'Yes, we have loaner vehicles available for longer repairs. Let us know when you schedule and we will reserve one for you.' },
        { q: 'Can I see what is wrong with my car?', a: 'Absolutely! We use digital inspections with photos so you can see exactly what we see. No surprises.' },
        { q: 'Are your prices competitive?', a: 'We offer fair, competitive pricing - typically 20-40% less than dealerships for the same quality work.' }
      ]
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateFAQPage };
