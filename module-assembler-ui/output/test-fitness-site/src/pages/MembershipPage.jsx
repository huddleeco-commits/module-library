import React, { useState } from 'react';
import { Check, X, Star } from 'lucide-react';

const COLORS = {
  "primary": "#DC2626",
  "secondary": "#EF4444",
  "accent": "#FCA5A5",
  "background": "#FEF2F2",
  "text": "#1F2937"
};

const PLANS = [
  { id: 'basic', name: 'Basic', price: 29, period: 'month', features: ['Gym access 6am-10pm', 'Locker room access', 'Free weights & machines', 'Cardio equipment'], notIncluded: ['Group classes', 'Personal training', '24/7 access'] },
  { id: 'premium', name: 'Premium', price: 59, period: 'month', popular: true, features: ['24/7 gym access', 'All group classes', 'Locker room & towel service', 'Free weights & machines', 'Cardio equipment', '1 PT session/month'], notIncluded: ['Unlimited PT'] },
  { id: 'elite', name: 'Elite', price: 99, period: 'month', features: ['Everything in Premium', 'Unlimited group classes', '4 PT sessions/month', 'Nutrition consultation', 'InBody analysis', 'Guest passes (2/month)'], notIncluded: [] }
];

export default function MembershipPage() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Membership Plans</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Choose the plan that fits your fitness goals</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', backgroundColor: 'white', borderRadius: '50px', padding: '4px' }}>
              <button onClick={() => setBilling('monthly')} style={{ padding: '12px 24px', borderRadius: '50px', border: 'none', backgroundColor: billing === 'monthly' ? COLORS.primary : 'transparent', color: billing === 'monthly' ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>Monthly</button>
              <button onClick={() => setBilling('annual')} style={{ padding: '12px 24px', borderRadius: '50px', border: 'none', backgroundColor: billing === 'annual' ? COLORS.primary : 'transparent', color: billing === 'annual' ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>Annual (Save 20%)</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{ padding: '40px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: plan.popular ? `2px solid ${COLORS.primary}` : 'none', position: 'relative' }}>
                {plan.popular && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.primary, color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Most Popular</span>}
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>${billing === 'annual' ? Math.round(plan.price * 0.8) : plan.price}</span>
                  <span style={{ opacity: 0.6 }}>/{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <Check size={20} color="#059669" /> {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', opacity: 0.4 }}>
                      <X size={20} /> {f}
                    </li>
                  ))}
                </ul>
                <button style={{ width: '100%', padding: '16px', backgroundColor: plan.popular ? COLORS.primary : 'transparent', color: plan.popular ? 'white' : COLORS.primary, border: plan.popular ? 'none' : `2px solid ${COLORS.primary}`, borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>All Plans Include</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {['No contracts', 'Cancel anytime', 'Free fitness assessment', 'Mobile app access'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={20} color={COLORS.primary} /> {f}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}