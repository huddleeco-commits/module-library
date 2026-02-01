import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import { apiFetch } from '../config/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [referralInfo, setReferralInfo] = useState(null);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  // Capture referral code from URL or sessionStorage
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const refFromStorage = sessionStorage.getItem('slabtrack_referral');
    const code = refFromUrl || refFromStorage;
    
    if (code) {
      setReferralCode(code);
      // Store in session so it persists if user navigates away
      sessionStorage.setItem('slabtrack_referral', code);
      
      // Validate and get referral info
      apiFetch(`/referral/validate/${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.valid) {
            setReferralInfo(data);
            console.log(`📊 Referral code validated: ${code} (${data.owner_name})`);
          }
        })
        .catch(err => console.log('Referral validation failed:', err));
      
      // Track the click
      apiFetch('/referral/track-click', {
        method: 'POST',
        body: JSON.stringify({ 
          code, 
          landing_page: window.location.pathname,
          referrer_url: document.referrer 
        })
      }).catch(() => {});
    }
  }, [searchParams]);

  // Handle manual referral code submission
  const handleApplyReferralCode = () => {
    const code = manualCode.trim().toLowerCase();
    if (!code) return;
    
    setError('');
    apiFetch(`/referral/validate/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.valid) {
          setReferralCode(code);
          setReferralInfo(data);
          sessionStorage.setItem('slabtrack_referral', code);
          setShowReferralInput(false);
          // Track the click
          apiFetch('/referral/track-click', {
            method: 'POST',
            body: JSON.stringify({ 
              code, 
              landing_page: window.location.pathname,
              referrer_url: document.referrer 
            })
          }).catch(() => {});
        } else {
          setError('Invalid referral code');
        }
      })
      .catch(() => setError('Could not validate referral code'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.fullName, referralCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12'>
      <Helmet>
        <title>Sign Up - SlabTrack</title>
        <meta name="description" content="Create your free SlabTrack account to start managing your sports card collection with AI-powered scanning, real-time pricing, and advanced analytics." />
        <link rel="canonical" href="https://www.slabtrack.io/register" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 mb-2'>
            SlabTrack
          </h1>
          <p className='text-slate-400'>Create your account</p>
        </div>

        {/* Referral Banner - Show when code is validated */}
        {referralInfo && (
          <div className='bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-xl p-4 mb-6'>
            <p className='text-emerald-400 text-sm font-medium text-center'>
              🎉 Referred by <span className='font-bold'>{referralInfo.owner_name}</span>
            </p>
          </div>
        )}

        {/* Manual Referral Code Input - Show when no code is set */}
        {!referralInfo && (
          <div className='mb-6'>
            <button
              type='button'
              onClick={() => setShowReferralInput(!showReferralInput)}
              className='text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors w-full text-center'
            >
              Have a referral code? <span className='text-indigo-400'>{showReferralInput ? 'Hide' : 'Click here'}</span>
            </button>
            {showReferralInput && (
              <div className='mt-3'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder='Enter referral code'
                    className='flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyReferralCode();
                      }
                    }}
                  />
                  <button
                    type='button'
                    onClick={handleApplyReferralCode}
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors'
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Register Form */}
        <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Error Message */}
            {error && (
              <div className='bg-red-500/10 border border-red-500/50 rounded-lg p-4'>
                <p className='text-red-400 text-sm font-medium'>{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor='fullName' className='block text-sm font-medium text-slate-300 mb-2'>
                Full Name
              </label>
              <input
                id='fullName'
                name='fullName'
                type='text'
                required
                value={formData.fullName}
                onChange={handleChange}
                className='w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                placeholder='John Doe'
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-slate-300 mb-2'>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                className='w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                placeholder='you@example.com'
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-slate-300 mb-2'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-4 py-3 pr-20 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                  placeholder='At least 6 characters'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-slate-700/50'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-slate-300 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full px-4 py-3 pr-20 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                  placeholder='Re-enter your password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-slate-700/50'
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className='flex items-center gap-2'>
                <div className='flex-1 h-1 rounded-full bg-slate-700 overflow-hidden'>
                  <div 
                    className={`h-full transition-all ${
                      formData.password.length < 6 
                        ? 'w-1/3 bg-red-500' 
                        : formData.password.length < 10
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className='text-xs text-slate-400'>
                  {formData.password.length < 6 
                    ? 'Weak' 
                    : formData.password.length < 10
                    ? 'Good'
                    : 'Strong'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className='mt-6 text-center'>
            <p className='text-slate-400 text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='text-indigo-400 hover:text-indigo-300 font-medium transition-colors'>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className='text-center text-slate-500 text-xs mt-6'>
          By creating an account, you agree to our{' '}
          <a href='#' className='text-slate-400 hover:text-slate-300 transition-colors'>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href='#' className='text-slate-400 hover:text-slate-300 transition-colors'>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}