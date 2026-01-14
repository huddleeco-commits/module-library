import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Sparkles, ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col relative overflow-hidden'>
      <Helmet>
        <title>Login - SlabTrack</title>
        <meta name="description" content="Sign in to your SlabTrack account to manage your sports card collection with AI-powered scanning and real-time pricing." />
        <link rel="canonical" href="https://www.slabtrack.io/login" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full blur-sm"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 15)}%`,
              animation: `float ${15 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className='flex-1 flex items-center justify-center p-4 relative z-10'>
        <div className='w-full max-w-md'>
          {/* Card with enhanced styling */}
          <div className='bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border-2 border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/20 hover:scale-[1.02]'>
            
            {/* Header Section */}
            <div className='text-center mb-8'>
              {/* Logo/Icon with gradient and glow */}
              <div className='relative inline-block mb-6'>
                <div className='absolute inset-0 bg-indigo-500 blur-2xl opacity-50 animate-pulse'></div>
                <div className='relative inline-flex p-4 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 rounded-2xl shadow-xl'>
                  <Sparkles size={48} className='text-white' />
                </div>
              </div>

              {/* Title with gradient text */}
              <h1 className='text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-size-200 animate-gradient'>
                Welcome Back
              </h1>
              <p className='text-slate-300 text-lg'>Sign in to your SlabTrack account</p>
              
              {/* Decorative line */}
              <div className='mt-4 mx-auto w-20 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full'></div>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Sign up link */}
            <div className='mt-8 text-center'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-700'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-slate-800/50 text-slate-400'>or</span>
                </div>
              </div>
              
              <p className='text-slate-300 mt-6'>
                Don't have an account?{' '}
                <Link 
                  to='/register' 
                  className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 font-bold transition-all inline-flex items-center gap-1 group'
                >
                  Sign up
                  <ArrowRight size={16} className='group-hover:translate-x-1 transition-transform' />
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className='mt-6 flex items-center justify-center gap-6 text-sm text-slate-400'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
              <span>Secure Login</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse' style={{ animationDelay: '0.5s' }}></div>
              <span>Protected Data</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}