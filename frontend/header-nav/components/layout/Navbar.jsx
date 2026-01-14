import { LogOut, Settings as SettingsIcon, Crown, Mail, Package, TrendingUp, Home, Gavel } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from './Button';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className='glass sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4' style={{ overflow: 'visible' }}>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        {/* Logo */}
        <div 
          className='flex items-center gap-2 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity'
          onClick={() => navigate('/home')}
        >
          <img src='/logo1.png' alt='SlabTrack Logo' className='h-10 sm:h-16 w-auto object-contain drop-shadow-2xl' />
          <div className='flex flex-col'>
            <h1 className='text-xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent tracking-tight leading-tight'>
              SlabTrack
            </h1>
            <p className='text-[10px] sm:text-sm text-slate-400 font-light text-right leading-tight -mt-0.5'>
              by BE<span className='text-blue-400 font-bold'>1</span>st
            </p>
          </div>
        </div>

        {/* Nav Buttons */}
        <div className='flex items-center gap-1 sm:gap-2'>
          {/* User Info - Desktop only */}
          <div 
            className='text-right hidden lg:block cursor-pointer hover:opacity-80 transition-opacity mr-2'
            onClick={() => navigate('/settings')}
          >
            <p className='text-sm font-semibold'>{user?.fullName}</p>
            <p className='text-xs text-slate-400 capitalize'>{user?.subscriptionTier} Plan</p>
          </div>

          {user?.isAdmin && (
            <Button variant='danger' size='sm' onClick={() => navigate('/admin')} className='flex items-center gap-1 px-2 py-1.5 text-xs'>
              <Crown size={14} />
              <span className='hidden sm:inline'>Admin</span>
            </Button>
          )}

          <Button variant='secondary' size='sm' onClick={() => navigate('/home')} className='flex items-center gap-1 px-2 py-1.5 text-xs'>
            <Home size={14} />
            <span className='hidden sm:inline'>Dashboard</span>
          </Button>

          <Button variant='secondary' size='sm' onClick={() => navigate('/dashboard')} className='flex items-center gap-1 px-2 py-1.5 text-xs bg-cyan-500/20 border-cyan-500/50'>
            <Package size={14} />
            <span className='hidden sm:inline'>Collection</span>
          </Button>

          <Button variant='secondary' size='sm' onClick={() => navigate('/sales')} className='flex items-center gap-1 px-2 py-1.5 text-xs bg-green-500/20 border-green-500/50'>
            <TrendingUp size={14} />
            <span className='hidden sm:inline'>Sales</span>
          </Button>

          <Button variant='secondary' size='sm' onClick={() => navigate('/marketplace')} className='flex items-center gap-1 px-2 py-1.5 text-xs bg-orange-500/20 border-orange-500/50'>
            <Gavel size={14} />
            <span className='hidden sm:inline'>Auctions</span>
          </Button>

          <Button variant='secondary' size='sm' onClick={() => navigate('/contact')} className='hidden md:flex items-center gap-1 px-2 py-1.5 text-xs'>
            <Mail size={14} />
            <span className='hidden sm:inline'>Contact</span>
          </Button>

          <Button variant='secondary' size='sm' onClick={() => navigate('/settings')} className='flex items-center gap-1 px-2 py-1.5 text-xs'>
            <SettingsIcon size={14} />
            <span className='hidden lg:inline'>Settings</span>
          </Button>

          <NotificationBell />

          <Button variant='secondary' size='sm' onClick={logout} className='flex items-center gap-1 px-2 py-1.5 text-xs'>
            <LogOut size={14} />
            <span className='hidden lg:inline'>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}