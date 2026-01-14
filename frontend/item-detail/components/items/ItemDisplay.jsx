import { X, TrendingUp, DollarSign, ExternalLink, BarChart3, Loader, AlertTriangle, ArrowUp, ArrowDown, Minus, Zap, Edit2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import EditCardModal from './EditCardModal';
import Button from '../shared/Button';
import { ebayAPI } from '../../api/ebay';
import { cardsAPI } from '../../api/cards';
import ListingModal from './ListingModal';
import MarketInsights from './MarketInsights';
import StatsTabs from './StatsTabs';
import SmartLink from '../shared/SmartLink';
import { apiFetch } from '../../config/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CardDisplay({ card, onClose, onUpdate, isDemo = false }) {
  const [showBack, setShowBack] = useState(false);
  const [displayCard, setDisplayCard] = useState(card);
  const [isHorizontal, setIsHorizontal] = useState(false);

  // Load edited image and detect orientation
  useEffect(() => {
    const loadEditedImages = async () => {
      let frontUrl = card.front_image_url;
      let backUrl = card.back_image_url;
      
      if (window.getEditedImage && !isDemo) {
        const editedFront = await window.getEditedImage(card.id, 'front');
        const editedBack = await window.getEditedImage(card.id, 'back');
        
        frontUrl = editedFront || card.front_image_url;
        backUrl = editedBack || card.back_image_url;
      }
      
      // Detect if image is horizontal
      if (frontUrl) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          setIsHorizontal(aspectRatio > 1.2); // Consistent 1.2 threshold across all components
          console.log(`📐 Card display aspect: ${aspectRatio.toFixed(2)}, horizontal: ${aspectRatio > 1.2}`);
        };
        img.src = frontUrl;
      }
      
      setDisplayCard({
        ...card,
        front_image_url: frontUrl,
        back_image_url: backUrl
      });
    };
    loadEditedImages();
  }, [card, isDemo]);

  const [pricing, setPricing] = useState(false);
  const [localCard, setLocalCard] = useState(card);
  const [showListing, setShowListing] = useState(false);
  const [showRecentSales, setShowRecentSales] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [showSmartLink, setShowSmartLink] = useState(false);
  const [smartLinkData, setSmartLinkData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const setName = card.set_name.replace(/^\d{4}\s+/, '');

  const buildEbaySearchQuery = (card) => {
    const cleanSetName = card.set_name?.replace(/^\d{4}\s+/, '') || card.set_name || '';
    let query = `${card.year} ${cleanSetName} ${card.player}`;
    if (card.card_number) query += ` ${card.card_number}`;
    if (card.parallel && card.parallel !== 'Base') query += ` ${card.parallel}`;
    if (card.grading_company) query += ` ${card.grading_company} ${card.grade}`;
    if (card.serial_number) query += ` ${card.serial_number}`;
    return query.trim();
  };

  const handleRecentSales = async () => {
    if (isDemo) {
      if (confirm('Sign up free to unlock full market insights and recently sold data! 🚀\n\nWould you like to sign up now?')) {
        window.location.href = '/register';
      }
      return;
    }
    
    setLoadingSales(true);
    setShowRecentSales(true);
    
    try {
      const response = await apiFetch(`/card-details/details`, {
        method: 'POST',
        body: JSON.stringify({
          player: card.player,
          year: card.year,
          set_name: card.set_name,
          card_number: card.card_number,
          parallel: card.parallel,
          grading_company: card.grading_company,
          grade: card.grade,
          sport: card.sport
        })
      });
      
      const data = await response.json();
      
      if (data.analytics) {
        setAnalyticsData(data.analytics);
        
        if (data.analytics.periods.days30.count > 0) {
          setLocalCard({
            ...localCard,
            ebay_low: data.analytics.periods.days30.low,
            ebay_avg: data.analytics.periods.days30.avg,
            ebay_high: data.analytics.periods.days30.high,
            ebay_sample_size: data.analytics.periods.days30.count
          });
          if (onUpdate) onUpdate();
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleFetchPrice = async () => {
    if (isDemo) {
      alert('Sign up free for unlimited real-time pricing updates! 🎯');
      return;
    }
    
    setPricing(true);
    try {
      const result = await ebayAPI.priceCard(card);
      
      if (result.success) {
        const priceData = {
          ebay_low: parseFloat(result.data.prices.low),
          ebay_avg: parseFloat(result.data.prices.average),
          ebay_high: parseFloat(result.data.prices.high),
          ebay_sample_size: result.data.count
        };
        
        const updated = await cardsAPI.updatePrice(card.id, priceData);
        
        if (updated.success) {
          setLocalCard(updated.card);
          if (onUpdate) onUpdate();
          alert('Price updated: $' + result.data.prices.average);
        }
      } else {
        alert('No prices found on eBay');
      }
    } catch (error) {
      alert('Failed to fetch prices');
    } finally {
      setPricing(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4' onClick={onClose}>
      <div className='fixed inset-0 bg-black/90 backdrop-blur-sm' />
      
      <div className='relative bg-slate-900/95 backdrop-blur-xl rounded-3xl p-4 sm:p-8 w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-2 border-slate-700/50 shadow-2xl' onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button
            onClick={onClose}
            className='absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-slate-700 rounded-xl transition-all hover:scale-110 z-10 bg-slate-800/50 backdrop-blur-sm'
          >
            <X size={20} className='sm:hidden' />
            <X size={24} className='hidden sm:block' />
          </button>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8'>
          <div className='space-y-4 sm:space-y-6'>
            <div 
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer relative border-2 border-slate-700/50 hover:border-indigo-500/50 transition-all shadow-xl group ${isHorizontal ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}
              onMouseEnter={() => setShowBack(true)}
              onMouseLeave={() => setShowBack(false)}
              onTouchStart={() => setShowBack(true)}
              onTouchEnd={() => setShowBack(false)}
            >
              {displayCard.front_image_url && (
                <>
                  <img
                    src={displayCard.front_image_url}
                    alt='Front'
                    className='w-full h-full object-contain p-4 transition-opacity duration-300'
                    style={{ opacity: showBack ? 0 : 1 }}
                  />
                  {displayCard.back_image_url && (
                    <img
                      src={displayCard.back_image_url}
                      alt='Back'
                      className='w-full h-full object-contain p-4 absolute inset-0 transition-opacity duration-300'
                      style={{ opacity: showBack ? 1 : 0 }}
                    />
                  )}
                </>
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
            </div>
            <div className='flex items-center justify-center gap-2'>
              <Sparkles size={14} className='text-indigo-400 animate-pulse' />
              <p className='text-xs sm:text-sm text-slate-400 text-center'>Tap/hover to see back</p>
              <Sparkles size={14} className='text-indigo-400 animate-pulse' style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          <div className='space-y-4 sm:space-y-6'>
            <div className='relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-20 blur-xl'></div>
              <div className='relative'>
                <h2 className='text-3xl sm:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400'>{card.player}</h2>
                <p className='text-sm sm:text-base text-slate-400'>{card.year} {setName}</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:gap-4'>
              <div className='bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border-2 border-slate-700/50 hover:border-indigo-500/30 transition-all hover:scale-105'>
                <p className='text-xs text-slate-400 mb-1 font-medium'>Card Number</p>
                <p className='font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400'>#{card.card_number}</p>
              </div>
              <div className='bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border-2 border-slate-700/50 hover:border-purple-500/30 transition-all hover:scale-105'>
                <p className='text-xs text-slate-400 mb-1 font-medium'>Team</p>
                <p className='font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'>{card.team}</p>
              </div>
              {card.parallel !== 'Base' && (
                <div className='bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl col-span-2 border-2 border-slate-700/50 hover:border-cyan-500/30 transition-all hover:scale-105'>
                  <p className='text-xs text-slate-400 mb-1 font-medium'>Parallel</p>
                  <p className='font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400'>{card.parallel}</p>
                </div>
              )}
            </div>

            {localCard.ebay_avg ? (
              <div className='relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 shadow-xl hover:shadow-emerald-500/30 transition-all'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10'></div>
                <div className='relative p-6'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='p-2 bg-emerald-500/20 rounded-lg'>
                      <DollarSign className='text-emerald-400' size={22} />
                    </div>
                    <h3 className='font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400'>Market Value</h3>
                  </div>
                  <div className='text-center mb-4'>
                    <p className='text-4xl sm:text-5xl font-black text-emerald-400'>${localCard.ebay_avg.toFixed(2)}</p>
                  </div>
                  <div className='flex justify-between text-sm bg-slate-900/50 rounded-xl p-4 backdrop-blur-sm'>
                    <div className='text-center'>
                      <p className='text-slate-400 mb-1'>Low</p>
                      <p className='font-bold text-blue-400'>${localCard.ebay_low?.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-slate-400 mb-1'>High</p>
                      <p className='font-bold text-purple-400'>${localCard.ebay_high?.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-slate-400 mb-1'>Sales</p>
                      <p className='font-bold text-cyan-400'>{localCard.ebay_sample_size}</p>
                    </div>
                  </div>
                  {localCard.ebay_last_checked && (
                    <p className='text-xs text-slate-400 mt-4 text-center'>
                      Last updated: {new Date(localCard.ebay_last_checked).toLocaleDateString()}
                    </p>
                  )}
                  <Button 
                    variant='secondary' 
                    className='w-full mt-4 text-sm sm:text-base bg-slate-800/50 hover:bg-slate-800 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all'
                    onClick={handleFetchPrice}
                    disabled={pricing}
                  >
                    {pricing ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Loader className='animate-spin' size={18} />
                        Fetching...
                      </span>
                    ) : isDemo ? 'Sign Up to Refresh' : 'Refresh Price'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-slate-700/50 hover:border-indigo-500/30 transition-all'>
                <div className='relative inline-block mb-4'>
                  <div className='absolute inset-0 bg-indigo-500 blur-xl opacity-30 animate-pulse'></div>
                  <TrendingUp size={48} className='relative text-slate-600' />
                </div>
                <p className='text-slate-400 mb-4 text-sm sm:text-base'>Not yet priced</p>
                <Button 
                  variant='success' 
                  className='w-full text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-105'
                  onClick={handleFetchPrice}
                  disabled={pricing}
                >
                  {pricing ? (
                    <span className='flex items-center justify-center gap-2'>
                      <Loader className='animate-spin' size={18} />
                      Fetching eBay Prices...
                    </span>
                  ) : (
                    <span className='flex items-center justify-center gap-2'>
                      <Zap size={18} />
                      {isDemo ? 'Sign Up for Pricing' : 'Fetch eBay Prices'}
                    </span>
                  )}
                </Button>
              </div>
            )}

            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                <Button
                  variant='primary'
                  className='flex items-center justify-center gap-2 text-xs sm:text-base py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105'
                  onClick={() => {
                    const query = buildEbaySearchQuery(card);
                    window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`, '_blank');
                  }}
                >
                  <ExternalLink size={16} />
                  <span className='hidden sm:inline'>View on eBay</span>
                  <span className='sm:hidden'>eBay</span>
                </Button>
                <Button
                  variant='secondary'
                  className='flex items-center justify-center gap-2 text-xs sm:text-base py-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border-2 border-orange-500/30 hover:border-orange-500/50 text-orange-400 hover:text-orange-300 transition-all hover:scale-105'
                  onClick={() => {
                    const query = buildEbaySearchQuery(card);
                    window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`, '_blank');
                  }}
                  disabled={loadingSales}
                >
                  <TrendingUp size={16} />
                  <span className='hidden sm:inline'>{loadingSales ? 'Loading...' : 'Recently Sold'}</span>
                  <span className='sm:hidden'>Sold</span>
                </Button>
                {!isDemo && (
                  <Button
                    variant='secondary'
                    className='col-span-2 flex items-center justify-center gap-2 text-sm sm:text-base py-3 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-purple-500/50 transition-all hover:scale-105'
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit2 size={18} />
                    Edit Card Details
                  </Button>
                )}
              </div>
              
              <Button
                variant='success'
                className='w-full text-sm sm:text-base py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!localCard.ebay_avg}
                onClick={() => setShowListing(true)}
              >
                <span className='flex items-center justify-center gap-2'>
                  <ExternalLink size={18} />
                  List on eBay
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats & Social Tabs */}
        {!isDemo && (
          <div className='col-span-1 md:col-span-2 mt-6'>
            <StatsTabs card={card} />
          </div>
        )}
      </div>

      {showListing && (
        <ListingModal 
          card={localCard} 
          onClose={() => setShowListing(false)} 
        />
      )}

      {showSmartLink && smartLinkData && (
        <SmartLink
          url={smartLinkData.url}
          title={smartLinkData.title}
          type={smartLinkData.type}
          preview={smartLinkData.preview}
          onClose={() => setShowSmartLink(false)}
        />
      )}

      {showRecentSales && analyticsData && (
        <MarketInsights 
          card={card}
          analyticsData={analyticsData}
          onClose={() => setShowRecentSales(false)}
        />
      )}

      {showEditModal && !isDemo && (
        <EditCardModal 
          card={localCard} 
          onClose={() => setShowEditModal(false)}
          onSave={(updatedCard) => {
            setLocalCard(updatedCard);
            setShowEditModal(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}