import { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertCircle, Zap, Crown, Sparkles } from 'lucide-react';
import { cardsAPI } from '../../api/cards';

export default function UsageWidget() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const data = await cardsAPI.getUsage();
      if (data.success) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/pricing';
  };

  if (loading || !usage) return null;

  const getStatusColor = () => {
    if (usage.percentage >= 90) return 'text-red-400';
    if (usage.percentage >= 70) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getBarColor = () => {
    if (usage.percentage >= 90) return 'from-red-500 to-orange-500';
    if (usage.percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-emerald-500 to-teal-500';
  };

  const getBorderColor = () => {
    if (usage.percentage >= 90) return 'border-red-500/50 hover:border-red-500/70';
    if (usage.percentage >= 70) return 'border-yellow-500/50 hover:border-yellow-500/70';
    return 'border-emerald-500/50 hover:border-emerald-500/70';
  };

  return (
    <div className={`relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 mb-6 border-2 ${getBorderColor()} transition-all shadow-xl`}>
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5'></div>
      
      <div className='relative'>
        <div className='flex items-center justify-between mb-5 flex-wrap gap-4'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='absolute inset-0 bg-indigo-500 blur-xl opacity-30'></div>
              <div className='relative p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg shadow-indigo-500/50'>
                <Activity size={24} className='text-white' />
              </div>
            </div>
            <div>
              <h3 className='font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400'>
                API Usage Today
              </h3>
              <p className='text-sm text-slate-400 font-medium'>
                {usage.remaining} of {usage.dailyLimit} calls remaining
              </p>
            </div>
          </div>
          
          <div className='text-right'>
            <p className={`text-4xl font-black ${getStatusColor()}`}>
              {usage.today}
            </p>
            <p className='text-xs text-slate-400 font-medium'>calls used</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='relative w-full bg-slate-900/70 rounded-full h-4 mb-4 overflow-hidden border border-slate-700/50'>
          <div
            className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-500 relative`}
            style={{ width: `${Math.min(100, usage.percentage)}%` }}
          >
            <div className='absolute inset-0 bg-white/20 animate-pulse'></div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className='flex items-center justify-between text-sm flex-wrap gap-2'>
          <div className='flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50'>
            <TrendingUp size={16} className='text-cyan-400' />
            <span className='font-medium'>This week: <span className='text-white font-bold'>{usage.week}</span> calls</span>
          </div>

          {usage.percentage >= 90 && (
            <div className='flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30 animate-pulse'>
              <AlertCircle size={16} />
              <span className='font-bold'>Near limit!</span>
            </div>
          )}
        </div>

        {/* Upgrade prompt for free users */}
        {usage.dailyLimit === 20 && (
          <div 
            className='mt-5 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 hover:border-indigo-500/50 rounded-xl cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-indigo-500/20 group'
            onClick={handleUpgradeClick}
          >
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg'>
                <Crown size={20} className='text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2'>
                  Upgrade to Pro
                  <Sparkles size={14} className='text-indigo-400 animate-pulse' />
                </p>
                <p className='text-xs text-slate-400 mt-0.5'>
                  Get 100 daily calls + unlimited cards!
                </p>
              </div>
              <Zap size={20} className='text-indigo-400 group-hover:text-indigo-300 transition-colors' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}