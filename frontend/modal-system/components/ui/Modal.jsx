import { X, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4'>
      <div className='fixed inset-0 bg-black/90 backdrop-blur-sm' onClick={onClose} />
      
      <div className={cn(
        'relative bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full border-2 border-indigo-500/50 shadow-2xl flex flex-col max-h-[90vh]',
        sizes[size]
      )}>
        {/* Fixed Header */}
        <div className='p-4 sm:p-8 pb-0 flex-shrink-0'>
          <button
            onClick={onClose}
            className='absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-slate-700 rounded-xl transition-all hover:scale-110 z-10 bg-slate-800/50 backdrop-blur-sm'
          >
            <X size={20} className='sm:hidden' />
            <X size={24} className='hidden sm:block' />
          </button>

          <div className='relative mb-6 sm:mb-8 pr-12'>
            <h2 className='text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400'>
              {title}
            </h2>
            <div className='absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full'></div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='overflow-y-auto flex-1 px-4 sm:px-8 pb-4 sm:pb-8'>
          {children}
        </div>
      </div>
    </div>
  );
}