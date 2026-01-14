import { Package, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export default function DashboardStats({ stats, cards = [], filteredCards = [], showMyPriceTotal = false, onToggleMyPrice }) {
  console.log('🎯 DashboardStats rendering:', { 
    stats, 
    allCardsLength: cards.length,
    filteredCardsLength: filteredCards.length 
  });
  
  // Use filtered cards for calculations
  const cardsToCalculate = filteredCards.length > 0 ? filteredCards : cards;
  
  // Calculate market value from filtered cards
  const cardsWithMarketValue = cardsToCalculate.filter(c => c.ebay_low && parseFloat(c.ebay_low) > 0);
  const totalMarketValue = cardsWithMarketValue.reduce((sum, c) => sum + parseFloat(c.ebay_low), 0);
  
  // Calculate asking price stats from filtered cards
  const cardsWithAskingPrice = cardsToCalculate.filter(c => c.asking_price && parseFloat(c.asking_price) > 0);
  const totalAskingPrice = cardsWithAskingPrice.reduce((sum, c) => sum + parseFloat(c.asking_price), 0);
  
  console.log('💰 Stats:', { 
    totalCards: cardsToCalculate.length,
    cardsWithMarketValue: cardsWithMarketValue.length,
    totalMarketValue,
    cardsWithAskingPrice: cardsWithAskingPrice.length, 
    totalAskingPrice,
    showMyPriceTotal
  });
  
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
      {/* Total Cards - DYNAMIC */}
      <div className='bg-slate-800/50 rounded-2xl p-6 border-2 border-indigo-500/30'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-slate-400 text-sm font-bold mb-2'>Total Cards</p>
            <p className='text-4xl font-black text-indigo-400'>{cardsToCalculate.length}</p>
          </div>
          <Package className='text-indigo-400' size={32} />
        </div>
      </div>

      {/* Priced Cards - DYNAMIC */}
      <div className='bg-slate-800/50 rounded-2xl p-6 border-2 border-emerald-500/30'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-slate-400 text-sm font-bold mb-2'>Priced Cards</p>
            <p className='text-4xl font-black text-emerald-400'>{cardsWithMarketValue.length}</p>
          </div>
          <TrendingUp className='text-emerald-400' size={32} />
        </div>
      </div>

      {/* Market Value / My Price Total - TOGGLEABLE + DYNAMIC */}
      <div 
        onClick={onToggleMyPrice}
        className='bg-slate-800/50 rounded-2xl p-6 border-2 border-yellow-500/30 cursor-pointer hover:border-yellow-500/60 transition-all group'
      >
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-slate-400 text-sm font-bold'>
                {showMyPriceTotal ? 'My Price Total' : 'Market Value'}
              </p>
              <span className='text-xs text-slate-500 group-hover:text-slate-400 transition-colors'>
                {showMyPriceTotal ? '💰' : '📊'} tap to switch
              </span>
            </div>
            <p className='text-3xl font-black text-yellow-400'>
              ${showMyPriceTotal ? totalAskingPrice.toFixed(0) : totalMarketValue.toFixed(0)}
            </p>
            <p className='text-xs text-slate-500 mt-1'>
              {showMyPriceTotal 
                ? `${cardsWithAskingPrice.length} cards with asking price`
                : `${cardsWithMarketValue.length} cards with market data`
              }
            </p>
          </div>
          <DollarSign className='text-yellow-400' size={32} />
        </div>
      </div>

      {/* With Asking Price - DYNAMIC */} 
      <div className='bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border-2 border-purple-500/30'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-slate-400 text-sm font-bold mb-2'>With Asking Price</p>
            <p className='text-4xl font-black text-purple-400'>{cardsWithAskingPrice.length}</p>
            {cardsWithAskingPrice.length > 0 && (
              <p className='text-xs text-purple-400 mt-2 font-bold'>
                ${totalAskingPrice.toFixed(0)} total
              </p>
            )}
          </div>
          <svg width='32' height='32' className='text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
          </svg>
        </div>
      </div>
    </div>
  );
}