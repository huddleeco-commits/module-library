import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className='bg-slate-900 border-t border-slate-800 mt-auto'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div>
            <h3 className='text-xl font-bold mb-4 gradient-text'>SlabTrack</h3>
            <p className='text-slate-400 text-sm'>
              AI-powered sports card collection management and pricing platform.
            </p>
            <p className='text-slate-500 text-xs mt-3'>
              © 2025 Gilani Enterprises USA LLC
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className='font-bold text-white mb-4'>Product</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link to='/pricing' className='text-slate-400 hover:text-primary transition-colors'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to='/dashboard' className='text-slate-400 hover:text-primary transition-colors'>
                  Dashboard
                </Link>
              </li>
              <li>
                <a href='/#features' className='text-slate-400 hover:text-primary transition-colors'>
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className='font-bold text-white mb-4'>Legal</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link to='/privacy' className='text-slate-400 hover:text-primary transition-colors'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='/terms' className='text-slate-400 hover:text-primary transition-colors'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className='font-bold text-white mb-4'>Support</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link to='/contact' className='text-slate-400 hover:text-primary transition-colors'>
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href='mailto:huddleeco@gmail.com' 
                  className='text-slate-400 hover:text-primary transition-colors'
                >
                  huddleeco@gmail.com
                </a>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className='mt-6'>
              <h4 className='font-bold text-white mb-3 text-sm'>Follow Us</h4>
              <div className='flex gap-3'>
                <a
                  href='https://www.instagram.com/slabtrack.io/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 flex items-center justify-center transition-all group'
                  aria-label='Follow us on Instagram'
                >
                  <svg className='w-5 h-5 text-slate-400 group-hover:text-white transition-colors' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                  </svg>
                </a>
                <a
                  href='https://x.com/Slabtrack_io'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-lg bg-slate-800 hover:bg-black flex items-center justify-center transition-all group'
                  aria-label='Follow us on X (Twitter)'
                >
                  <svg className='w-4 h-4 text-slate-400 group-hover:text-white transition-colors' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm'>
          <p>
            Made with ❤️ in Texas | SlabTrack - Track, Price, Profit
          </p>
          <p className='mt-2 text-xs text-primary'>
            Powered by BE1st
          </p>
          <p className='mt-2 text-xs text-slate-600'>
            All pricing data is for informational purposes only. Always verify independently before buying or selling.
          </p>
        </div>
      </div>
    </footer>
  );
}