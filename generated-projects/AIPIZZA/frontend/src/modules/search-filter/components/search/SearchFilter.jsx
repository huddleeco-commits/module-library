import { useState } from 'react';
import { Search, Package, Image as ImageIcon, DollarSign, TrendingUp, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Button from '../components/shared/Button';
import { apiFetch } from '../config/api';

export default function MasterCardSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [parallels, setParallels] = useState([]);
  const [selectedParallel, setSelectedParallel] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loadingParallels, setLoadingParallels] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAllParallels, setShowAllParallels] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      alert('Enter at least 2 characters to search');
      return;
    }

    setLoading(true);
    setResults(null);
    setSelectedSet(null);
    setParallels([]);
    setSelectedParallel(null);
    setSelectedCard(null);

    try {
      const response = await apiFetch('/master-search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        console.log('✅ Search results:', data);
      } else {
        alert('Search failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetClick = async (set) => {
    setSelectedSet(set);
    setLoadingParallels(true);
    setParallels([]);
    setSelectedParallel(null);
    setSelectedCard(null);
    setShowAllParallels(false);

    try {
      const response = await apiFetch('/master-search/parallels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: set.sport,
          year: set.year,
          setShortName: set.set_short_name
        })
      });

      const data = await response.json();

      if (data.success) {
        setParallels(data.parallels || []);
        console.log('✅ Parallels loaded:', data.parallels);
      }
    } catch (error) {
      console.error('Failed to load parallels:', error);
    } finally {
      setLoadingParallels(false);
    }
  };

  const handleParallelClick = async (parallel, card) => {
  setSelectedParallel(parallel.parallel);
  setLoadingCard(true);
  setSelectedCard(null);
  setShowPricingModal(true);

  try {
    // Fetch card details
    const response = await apiFetch('/master-search/card-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport: card.sport,
        year: card.year,
        setShortName: card.set_short_name,
        cardNumber: card.card_number,
        parallel: parallel.parallel,
        player: card.player
      })
    });

    const data = await response.json();

    if (data.success && data.card) {
      setSelectedCard(data.card);
      console.log('✅ Card loaded:', data.card);
    } else {
      alert('Card details not found in database');
    }
  } catch (error) {
    console.error('Failed to load card:', error);
    alert('Failed to load card details');
  } finally {
    setLoadingCard(false);
  }
};

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <button
            onClick={() => navigate('/quick-actions')}
            className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
          >
            <ArrowLeft className='text-slate-400' size={24} />
          </button>
          <div>
            <h1 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 flex items-center gap-2'>
              <Sparkles size={32} />
              Master Card Search
            </h1>
            <p className='text-slate-400 text-sm mt-1'>Search 3 million+ cards • Instant pricing data</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className='mb-8'>
          <div className='flex gap-3'>
            <div className='flex-1 relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400' size={20} />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Try: "luka doncic 24" or "2024 prizm" or "mahomes"'
                className='w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none'
              />
            </div>
            <Button
              type='submit'
              disabled={loading}
              className='px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <p className='text-slate-500 text-xs mt-2 ml-1'>
            💡 Tip: Search by player + card# ("luka 24"), set name ("prizm"), or year + set ("2024 select")
          </p>
        </form>

        {/* Loading State */}
        {loading && (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4'></div>
            <p className='text-slate-400'>Searching database...</p>
          </div>
        )}

        {/* Results Summary */}
        {results && !loading && (
          <div className='bg-slate-800/50 border-2 border-purple-500/30 rounded-xl p-4 mb-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-white font-bold text-lg'>
                  Found {results.totalCards} cards across {results.totalSets} sets
                </p>
                <p className='text-slate-400 text-sm'>Query: "{results.query}"</p>
              </div>
              <Package className='text-purple-400' size={32} />
            </div>
          </div>
        )}

        {/* No Results */}
        {results && results.totalCards === 0 && (
          <div className='bg-slate-800/50 border-2 border-slate-700 rounded-xl p-8 text-center'>
            <Search className='text-slate-600 mx-auto mb-4' size={48} />
            <p className='text-white font-bold text-xl mb-2'>No results found</p>
            <p className='text-slate-400 mb-4'>"{results.query}" is not in our database yet</p>
            <div className='text-left max-w-md mx-auto bg-slate-900/50 rounded-lg p-4'>
              <p className='text-slate-300 text-sm mb-2 font-bold'>Try searching by:</p>
              <ul className='text-slate-400 text-sm space-y-1'>
                <li>• Set name (e.g., "2024 Prizm")</li>
                <li>• Player only (e.g., "Luka Doncic")</li>
                <li>• Different card number</li>
                <li>• Year + Set (e.g., "2023 Select")</li>
              </ul>
            </div>
          </div>
        )}

        {/* Results - Sets List */}
        {results && results.sets && results.sets.length > 0 && (
          <div className='space-y-4'>
            {results.sets.map((set, idx) => (
              <div
                key={idx}
                className={`bg-slate-800/50 border-2 rounded-xl overflow-hidden transition-all ${
                  selectedSet?.set_short_name === set.set_short_name && selectedSet?.year === set.year
                    ? 'border-purple-500'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Set Header */}
                <button
                  onClick={() => handleSetClick(set)}
                  className='w-full p-6 text-left hover:bg-slate-800/30 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-xl font-bold text-white mb-1 flex items-center gap-2'>
                        {set.sport === 'Basketball' ? '🏀' : set.sport === 'Football' ? '🏈' : set.sport === 'Baseball' ? '⚾' : set.sport === 'Hockey' ? '🏒' : '🎴'}
                        {set.set_name}
                      </h3>
                      <p className='text-slate-400 text-sm'>
                        {set.cards.length} cards found • #{[...new Set(set.cards.map(c => c.card_number))].sort((a, b) => parseInt(a) - parseInt(b)).join(', #')}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {selectedSet?.set_short_name === set.set_short_name && selectedSet?.year === set.year ? (
                        <span className='text-purple-400 text-sm font-bold'>EXPANDED ▼</span>
                      ) : (
                        <span className='text-slate-500 text-sm'>Click to expand ▶</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Set Details */}
                {selectedSet?.set_short_name === set.set_short_name && selectedSet?.year === set.year && (
                  <div className='border-t-2 border-slate-700 p-6 bg-slate-900/30'>
                    {/* Cards in this set */}
                    <div className='mb-6'>
                      <h4 className='text-white font-bold mb-3 flex items-center gap-2'>
                        <Package size={18} />
                        Cards Found:
                      </h4>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                        {set.cards.slice(0, 8).map((card, cardIdx) => (
                          <div
                            key={cardIdx}
                            className='bg-slate-800/50 rounded-lg p-3 border border-slate-700'
                          >
                            <p className='text-white font-bold text-sm truncate'>{card.player}</p>
                            <p className='text-slate-400 text-xs'>#{card.card_number}</p>
                            <p className='text-purple-400 text-xs'>{card.parallel}</p>
                          </div>
                        ))}
                      </div>
                      {set.cards.length > 8 && (
                        <p className='text-slate-500 text-xs mt-2'>+ {set.cards.length - 8} more cards</p>
                      )}
                    </div>

                    {/* Parallels */}
                    <div>
                      <h4 className='text-white font-bold mb-3 flex items-center gap-2'>
                        <ImageIcon size={18} />
                        Parallel Variants:
                      </h4>

                      {loadingParallels && (
                        <div className='text-center py-8'>
                          <div className='animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500 mx-auto mb-2'></div>
                          <p className='text-slate-400 text-sm'>Loading parallels...</p>
                        </div>
                      )}

                      {!loadingParallels && parallels.length === 0 && (
                        <p className='text-slate-500 text-sm'>No parallel reference images available</p>
                      )}

                      {!loadingParallels && parallels.length > 0 && (
                        <>
                          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                            {parallels
                              .filter(parallel => 
                                showAllParallels || set.cards.some(card => card.parallel === parallel.parallel)
                              )
                              .map((parallel, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleParallelClick(parallel, set.cards[0])}
                              className={`group relative bg-slate-800/50 rounded-lg p-3 border-2 transition-all ${
                                selectedParallel === parallel.parallel
                                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
                                  : 'border-slate-700 hover:border-slate-600'
                              } ${isMobile ? 'active:scale-95' : 'hover:scale-105'}`}
                            >
                              {/* Reference Image */}
                              {parallel.reference_image_url ? (
                                <img
                                  src={parallel.reference_image_url}
                                  alt={parallel.parallel}
                                  className='w-full h-40 object-contain rounded mb-2 bg-slate-900'
                                />
                              ) : (
                                <div className='w-full h-32 bg-slate-900 rounded mb-2 flex items-center justify-center'>
                                  <ImageIcon className='text-slate-600' size={32} />
                                </div>
                              )}

                              {/* Parallel Info */}
                              <p className='text-white font-bold text-xs truncate'>{parallel.parallel}</p>
                              <p className='text-slate-400 text-xs'>{parallel.card_count} cards</p>
                              {parallel.avg_psa10 && parallel.avg_psa10 > 0 && (
                                <p className='text-emerald-400 text-xs font-bold mt-1'>
                                  ~${Number(parallel.avg_psa10).toFixed(0)} PSA 10
                                </p>
                              )}
                            </button>
                          ))}
                          </div>

                          {/* Show All Parallels Button */}
                          {!showAllParallels && parallels.filter(p => set.cards.some(c => c.parallel === p.parallel)).length < parallels.length && (
                            <div className='mt-4 text-center'>
                              <button
                                onClick={() => setShowAllParallels(true)}
                                className='px-6 py-3 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-purple-500 rounded-xl text-white font-bold transition-all'
                              >
                                📦 Show All {parallels.length} Parallels (Not just search matches)
                              </button>
                            </div>
                          )}

                          {showAllParallels && (
                            <div className='mt-4 text-center'>
                              <button
                                onClick={() => setShowAllParallels(false)}
                                className='px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition-all'
                              >
                                ✓ Showing All {parallels.length} • Click to hide
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pricing Modal */}
        {showPricingModal && (
          <>
            <div 
              className='fixed inset-0 bg-black/70 z-50 backdrop-blur-sm'
              onClick={() => setShowPricingModal(false)}
            />
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                    <DollarSign size={28} />
                    {selectedParallel}
                  </h2>
                  <button
                    onClick={() => setShowPricingModal(false)}
                    className='p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400'
                  >
                    ✕
                  </button>
                </div>

                {loadingCard && (
                  <div className='text-center py-12'>
                    <div className='animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4'></div>
                    <p className='text-slate-400'>Loading pricing...</p>
                  </div>
                )}

                {!loadingCard && selectedCard && (
  <div>
    {/* 🎨 TWO IMAGES: Reference + Card-Specific */}
    <div className='mb-6 space-y-4'>
      {/* Parallel Reference Image (Generic) */}
      {parallels.find(p => p.parallel === selectedParallel)?.reference_image_url && (
        <div className='relative'>
          <img
            src={parallels.find(p => p.parallel === selectedParallel).reference_image_url}
            alt={`${selectedParallel} reference`}
            className='w-full max-h-96 object-contain rounded-xl border-2 border-purple-500/30'
          />
          {/* Label overlay */}
          <div className='absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm border border-purple-400/50 rounded-lg px-3 py-2 shadow-lg'>
            <p className='text-white text-xs font-bold flex items-center gap-1'>
              <ImageIcon size={14} />
              PARALLEL REFERENCE IMAGE
            </p>
            <p className='text-purple-200 text-xs mt-0.5'>Example of what this parallel looks like</p>
          </div>
        </div>
      )}

      {/* Card-Specific Image (Player + Parallel) */}
      {selectedCard.card_specific_image_url && (
        <div className='relative'>
          <img
            src={selectedCard.card_specific_image_url}
            alt={`${selectedCard.player} ${selectedParallel}`}
            className='w-full max-h-96 object-contain rounded-xl border-2 border-cyan-500/30'
          />
          {/* Label overlay */}
          <div className='absolute top-3 left-3 bg-cyan-600/90 backdrop-blur-sm border border-cyan-400/50 rounded-lg px-3 py-2 shadow-lg'>
            <p className='text-white text-xs font-bold flex items-center gap-1'>
              <ImageIcon size={14} />
              ACTUAL CARD IMAGE
            </p>
            <p className='text-cyan-200 text-xs mt-0.5'>{selectedCard.player} #{selectedCard.card_number}</p>
          </div>
        </div>
      )}

      {/* Show loading if scraping image */}
      {!selectedCard.card_specific_image_url && !parallels.find(p => p.parallel === selectedParallel)?.reference_image_url && (
        <div className='text-center py-8 bg-slate-800/30 rounded-xl border-2 border-slate-700'>
          <ImageIcon className='text-slate-600 mx-auto mb-2' size={48} />
          <p className='text-slate-400 text-sm'>No images available for this card</p>
        </div>
      )}
    </div>

                    {/* Card Info */}
                    <div className='bg-slate-800/50 rounded-xl p-4 mb-6'>
                      <h3 className='text-white font-bold text-xl mb-2'>{selectedCard.player}</h3>
                      <p className='text-slate-400'>
                        {selectedCard.year} {selectedCard.set_name} #{selectedCard.card_number}
                      </p>
                      <div className='flex items-center gap-3 mt-3 flex-wrap'>
                        <div className='bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-2'>
                          <p className='text-purple-400 font-bold text-sm'>{selectedCard.parallel}</p>
                        </div>
                        
                        {/* SportsCardsPro Link */}
                        <a
                          href={`https://www.sportscardspro.com/game/${
    selectedCard.sport.toLowerCase()
  }-cards-${selectedCard.year}-${
    selectedCard.set_short_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }/${
    selectedCard.player.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/\./g, '')
  }${selectedCard.parallel && selectedCard.parallel.toLowerCase() !== 'base' ? `-${selectedCard.parallel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : ''}-${selectedCard.card_number}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 rounded-lg px-3 py-2 hover:bg-blue-600/30 transition-colors'
                        >
                          <TrendingUp size={14} className='text-blue-400' />
                          <span className='text-blue-400 font-bold text-sm'>View on SportsCardsPro</span>
                          <span className='text-blue-400'>↗</span>
                        </a>
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className='space-y-3'>
                      <p className='text-slate-400 text-sm font-bold mb-4'>💰 PRICING:</p>

                      {selectedCard.price_raw && selectedCard.price_raw > 0 && (
                        <div className='flex items-center justify-between bg-slate-800/50 rounded-lg p-4'>
                          <span className='text-slate-300 font-medium'>Raw:</span>
                          <span className='text-white font-bold text-lg'>${Number(selectedCard.price_raw).toFixed(2)}</span>
                        </div>
                      )}

                      {selectedCard.price_psa_9 && selectedCard.price_psa_9 > 0 && (
                        <div className='flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-4'>
                          <span className='text-blue-300 font-medium'>PSA 9:</span>
                          <span className='text-blue-400 font-bold text-lg'>${Number(selectedCard.price_psa_9).toFixed(2)}</span>
                        </div>
                      )}

                      {selectedCard.price_psa_10 && selectedCard.price_psa_10 > 0 && (
                        <div className='flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4'>
                          <span className='text-yellow-300 font-medium'>PSA 10:</span>
                          <span className='text-yellow-400 font-bold text-lg'>${Number(selectedCard.price_psa_10).toFixed(2)}</span>
                        </div>
                      )}

                      {selectedCard.price_bgs_10 && selectedCard.price_bgs_10 > 0 && (
                        <div className='flex items-center justify-between bg-purple-500/10 border border-purple-500/30 rounded-lg p-4'>
                          <span className='text-purple-300 font-medium'>BGS 10:</span>
                          <span className='text-purple-400 font-bold text-lg'>${Number(selectedCard.price_bgs_10).toFixed(2)}</span>
                        </div>
                      )}

                      {selectedCard.sales_volume && (
                        <div className='flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4'>
                          <span className='text-emerald-300 font-medium flex items-center gap-2'>
                            <TrendingUp size={18} />
                            Sales Volume:
                          </span>
                          <span className='text-emerald-400 font-bold text-lg'>{selectedCard.sales_volume}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!loadingCard && !selectedCard && (
                  <div className='text-center py-12'>
                    <p className='text-slate-500'>Card details not found in database</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}