import { useState, useEffect, useRef } from 'react';
import CardItem from './CardItem';

export default function CardGrid({ 
  cards, 
  onUpdate, 
  onQuickUpdate, 
  editMode = false,
  selectMode = false,
  selectedCards = [],
  onSelectCard = () => {},
  onCropCard = () => {},
  showStatusToggle = false,
  showBadges = true,
  dataPreferences = { showEbay: true, showSportsCardsPro: true, showPSA: true, showPopReport: true },
  onStatusChange = () => {},
  onRemoveListing = () => {},
  getStatusBadge = () => ({ label: 'Unlisted', color: 'bg-slate-600' }),
  onCardModalOpen = () => {}
}) {
  // Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Mobile: Show 20 cards initially, load more on scroll
  // Desktop: Show all cards
  const [visibleCount, setVisibleCount] = useState(isMobile ? 20 : cards.length);
  const gridRef = useRef(null);
  const observerRef = useRef(null);

  // Expose remove listing handler globally so CardItem can access it
  if (typeof window !== 'undefined') {
    window.handleRemoveListing = onRemoveListing;
  }

  // Reset visible count when cards change
  useEffect(() => {
    if (!isMobile) {
      setVisibleCount(cards.length);
    } else {
      setVisibleCount(Math.min(20, cards.length));
    }
  }, [cards.length, isMobile]);

  // Infinite scroll for mobile - load more cards as user scrolls
  useEffect(() => {
    if (!isMobile || visibleCount >= cards.length) return;

    const loadMoreCards = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 20, cards.length));
      }
    };

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(loadMoreCards, options);

    // Observe the last card in the grid
    const lastCard = gridRef.current?.lastElementChild;
    if (lastCard) {
      observerRef.current.observe(lastCard);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleCount, cards.length, isMobile]);

  // Get visible cards (mobile: paginated, desktop: all)
  const visibleCards = isMobile ? cards.slice(0, visibleCount) : cards;

  return (
    <div 
      ref={gridRef}
      className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 card-grid'
    >
      {visibleCards.map(card => (
        <div
          key={`${card.id}-${card.ebay_avg || 0}-${card.updated_at || Date.now()}`}
          className={`relative ${selectMode ? 'cursor-pointer' : ''}`}
        >
          {selectMode && (
            <div 
              className='absolute inset-0 z-10 bg-black/0 hover:bg-black/20 transition-all rounded-xl'
              onClick={() => onSelectCard(card.id)}
            >
              <div className={`absolute top-2 left-2 w-10 h-10 rounded-xl border-3 ${
                selectedCards.includes(card.id) 
                  ? 'bg-blue-500 border-blue-400 ring-2 ring-blue-300' 
                  : 'bg-slate-700/90 border-white hover:border-blue-400'
              } flex items-center justify-center shadow-xl transition-all hover:scale-110`}>
                {selectedCards.includes(card.id) && (
                  <span className='text-white text-lg font-bold'>✓</span>
                )}
              </div>
            </div>
          )}
          <CardItem 
  card={card} 
  onUpdate={onUpdate}
  onQuickUpdate={onQuickUpdate}
  editMode={editMode && !selectMode}
  onCrop={onCropCard}
  showStatusToggle={showStatusToggle && !selectMode}
  showBadges={showBadges}
  dataPreferences={dataPreferences}
  onStatusChange={onStatusChange}
  getStatusBadge={getStatusBadge}
  onCardModalOpen={onCardModalOpen}
/>
        </div>
      ))}
    </div>
  );
}