import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Check, Zap, Crown, Sparkles, Star, Shield, Rocket } from 'lucide-react';
import Button from '../components/shared/Button';
import { apiFetch } from '../config/api';
import Footer from '../components/layout/Footer';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [processingPlan, setProcessingPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadPlans();
    if (token) {
      loadCurrentPlan();
    }
  }, [token]);

  const loadPlans = async () => {
    try {
      const response = await apiFetch('/stripe/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const response = await apiFetch('/stripe/subscription');
      const data = await response.json();
      if (data.success) {
        setCurrentPlan(data.plan);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (plan.id === 'free') {
      alert('You are already on the free plan!');
      return;
    }

    setProcessingPlan(plan.id);

    try {
      const response = await apiFetch('/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId: plan.stripePriceId })
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlansByTier = () => {
    const tiers = {
      power: [],
      dealer: []
    };
    
    plans.forEach(plan => {
      if (plan.id.includes('power')) {
        tiers.power.push(plan);
      } else if (plan.id.includes('dealer')) {
        tiers.dealer.push(plan);
      }
    });
    
    return tiers;
  };

  const tiers = getPlansByTier();
  
  const getCurrentPlanForTier = (tierPlans) => {
    return tierPlans.find(p => 
      billingPeriod === 'monthly' ? p.interval === 'month' : p.interval === 'year'
    );
  };

  // Check if user is on a legacy plan
  const isLegacyPlan = ['starter', 'pro', 'premium'].includes(currentPlan);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30 border-t-indigo-500'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Rocket className='text-indigo-400 animate-pulse' size={24} />
            </div>
          </div>
          <p className='mt-6 text-slate-300 text-lg font-medium'>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col relative overflow-hidden'>
      <Helmet>
        <title>Pricing - SlabTrack</title>
        <meta name="description" content="Choose the perfect SlabTrack plan for your card collection. From free starter plans to premium features with unlimited scans and advanced analytics." />
        <link rel="canonical" href="https://www.slabtrack.io/pricing" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Animated background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className='flex-1 py-12 sm:py-20 px-4 relative z-10'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-full mb-8'>
              <Star size={18} className='text-indigo-400 animate-pulse' />
              <span className='text-sm font-bold text-indigo-300'>Simple Pricing</span>
            </div>
            
            <h1 className='text-5xl sm:text-7xl font-black mb-6 leading-tight'>
              Choose Your <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400'>Plan</span>
            </h1>
            <p className='text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto'>
              Start free, upgrade when you need more power. Cancel anytime.
            </p>
            <div className='mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full'></div>
          </div>

          {/* Legacy Plan Notice */}
          {isLegacyPlan && (
            <div className='mb-8 p-4 bg-green-500/20 border border-green-500/40 rounded-xl max-w-2xl mx-auto text-center'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Crown className='text-green-400' size={20} />
                <span className='text-green-300 font-bold'>Legacy Plan - Grandfathered!</span>
              </div>
              <p className='text-green-400 text-sm'>You're on a legacy plan with unlimited access. Your benefits will continue as long as you stay subscribed.</p>
            </div>
          )}

          {/* Billing Toggle */}
          <div className='flex justify-center mb-16'>
            <div className='bg-slate-800/50 backdrop-blur-xl rounded-full p-1.5 inline-flex border-2 border-slate-700/50 shadow-xl'>
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className='ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full'>Save 17%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid - 3 columns */}
          <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12'>
            
            {/* FREE Plan */}
            <div className='bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-slate-700/50 hover:border-slate-600 transition-all hover:scale-105 shadow-xl'>
              <div className='flex justify-center mb-6'>
                <div className='w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-700/50 border-2 border-slate-600'>
                  <Sparkles className='text-slate-400' size={32} />
                </div>
              </div>

              <h3 className='text-2xl font-black text-center mb-2'>Free</h3>
              <p className='text-slate-400 text-center text-sm mb-6'>Perfect for getting started</p>

              <div className='text-center mb-6'>
                <div className='text-5xl font-black text-white mb-2'>$0</div>
                <p className='text-slate-500 text-sm font-medium'>forever free</p>
              </div>

              <ul className='space-y-3 mb-8'>
                {[
                  '100 AI scans/month',
                  '50 eBay listings/month',
                  '1 public showcase',
                  'Bulk scan: 10 cards',
                  'All features included'
                ].map((feature, i) => (
                  <li key={i} className='flex items-center gap-2 text-sm'>
                    <Check size={18} className='text-emerald-400 flex-shrink-0' />
                    <span className='text-slate-300'>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate('/register')}
                variant='secondary'
                className='w-full bg-slate-700/50 hover:bg-slate-700'
                size='lg'
              >
                Get Started Free
              </Button>
            </div>

            {/* POWER Plan */}
            {(() => {
              const plan = getCurrentPlanForTier(tiers.power);
              if (!plan) return null;
              
              return (
                <div className='bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border-4 border-indigo-500/50 shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-all relative'>
                  {/* Popular Badge */}
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                    <div className='px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full text-white text-xs font-bold shadow-lg'>
                      MOST POPULAR
                    </div>
                  </div>

                  <div className='flex justify-center mb-6 mt-2'>
                    <div className='w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl'>
                      <Zap className='text-white' size={36} />
                    </div>
                  </div>

                  <h3 className='text-3xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400'>Power</h3>
                  <p className='text-slate-400 text-center text-sm mb-6'>For serious collectors</p>

                  <div className='text-center mb-6'>
                    <div className='text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2'>
                      ${plan.price}
                    </div>
                    <p className='text-slate-500 text-sm font-medium'>per {plan.interval}</p>
                  </div>

                  <ul className='space-y-3 mb-8'>
                    {[
                      '500 AI scans/month',
                      '150 eBay listings/month',
                      '3 public showcases',
                      'Bulk scan: 25 cards',
                      'Priority support'
                    ].map((feature, idx) => (
                      <li key={idx} className='flex items-center gap-2 text-sm'>
                        <Check size={20} className='text-emerald-400 flex-shrink-0' />
                        <span className='text-slate-200 font-medium'>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentPlan === 'power' || processingPlan === plan.id}
                    className='w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl'
                    size='lg'
                  >
                    {processingPlan === plan.id ? 'Processing...' : currentPlan === 'power' ? '✓ Current Plan' : 'Choose Power'}
                  </Button>
                </div>
              );
            })()}

            {/* DEALER Plan */}
            {(() => {
              const plan = getCurrentPlanForTier(tiers.dealer);
              if (!plan) return null;
              
              return (
                <div className='bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/40 hover:border-yellow-500/60 transition-all hover:scale-105 shadow-xl shadow-yellow-500/20'>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg'>
                      <Crown className='text-white' size={32} />
                    </div>
                  </div>

                  <h3 className='text-2xl font-black text-center mb-2'>Dealer</h3>
                  <p className='text-slate-400 text-center text-sm mb-6'>For power sellers</p>

                  <div className='text-center mb-6'>
                    <div className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2'>
                      ${plan.price}
                    </div>
                    <p className='text-slate-500 text-sm font-medium'>per {plan.interval}</p>
                  </div>

                  <ul className='space-y-3 mb-8'>
                    {[
                      '1,500 AI scans/month',
                      '♾️ Unlimited eBay listings',
                      '♾️ Unlimited showcases',
                      'Bulk scan: 100 cards',
                      'Priority support'
                    ].map((feature, idx) => (
                      <li key={idx} className='flex items-center gap-2 text-sm'>
                        <Check size={18} className='text-emerald-400 flex-shrink-0' />
                        <span className='text-slate-300'>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentPlan === 'dealer' || processingPlan === plan.id}
                    className='w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-lg'
                    size='lg'
                  >
                    {processingPlan === plan.id ? 'Processing...' : currentPlan === 'dealer' ? '✓ Current Plan' : 'Choose Dealer'}
                  </Button>
                </div>
              );
            })()}
          </div>

          {/* Footer Info */}
          <div className='text-center bg-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 max-w-3xl mx-auto'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <Shield size={24} className='text-indigo-400' />
              <p className='text-slate-300 text-lg font-bold'>All plans include core features</p>
            </div>
            <p className='text-slate-400 mb-3'>Upgrade or downgrade anytime. No contracts.</p>
            <div className='flex items-center justify-center gap-2'>
              <Shield size={16} className='text-green-400' />
              <p className='text-slate-500 text-sm'>Secure payments powered by Stripe 🔒</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}