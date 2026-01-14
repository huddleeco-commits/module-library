import { X, TrendingUp, DollarSign, ExternalLink, Loader, Sparkles, Edit2, Download, Package, Tag, MessageSquare, Database } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import EditCardModal from './EditCardModal';
import Button from '../shared/Button';
import { cardsAPI } from '../../api/cards';
import ListingModal from './ListingModal';
import StatsTabs from './StatsTabs';
import { apiFetch } from '../../config/api';
import ImageEditor from './ImageEditor';
import PokemonStatsTabs from './PokemonStatsTabs';
import RecentSalesModal from './RecentSalesModal';
import SoldCompsModal from '../cards/SoldCompsModal';
import CombinedMarketModal from './Combinedmarketmodal';
import MarkAsSoldModal from './MarkAsSoldModal';
import { QRCodeSVG } from 'qrcode.react';
import ParallelPricingModal from './ParallelPricingModal';
import QuickTransferModal from './QuickTransferModal';
import HistoricalCompsModal from './HistoricalCompsModal';
import GradingAssistant from '../grading/GradingAssistant';
import ParallelVariantsSection from './ParallelVariantsSection';
import PokemonHistoricalModal from './PokemonHistoricalModal';
import EbayListingModal from '../ebay/EbayListingModal';
import SocialShareModal from './SocialShareModal';

// Collapsible Grading Review Section Component
function GradingReviewCollapsible({ localCard, card, onUpdate, setLocalCard, navigate, setShowEditModal }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  
  const hasInspectionData = localCard.estimated_grade || localCard.corner_tl_score || localCard.surface_score;
  const hasReviewStatus = localCard.grading_review_status;
  
  // Calculate averages
  const cornerAvg = localCard.corner_tl_score 
    ? ((Number(localCard.corner_tl_score || 0) + Number(localCard.corner_tr_score || 0) + Number(localCard.corner_bl_score || 0) + Number(localCard.corner_br_score || 0)) / 4).toFixed(1)
    : null;
  const edgeAvg = localCard.edge_top_score
    ? ((Number(localCard.edge_top_score || 0) + Number(localCard.edge_bottom_score || 0) + Number(localCard.edge_left_score || 0) + Number(localCard.edge_right_score || 0)) / 4).toFixed(1)
    : null;

  // Parse surface issues
  const getSurfaceIssues = () => {
    if (!localCard.surface_issues_json) return null;
    try {
      const parsed = JSON.parse(localCard.surface_issues_json);
      const issues = Array.isArray(parsed) ? parsed : (parsed.detectedIssues || []);
      return {
        total: issues.length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        issues: issues
      };
    } catch (e) { return null; }
  };
  const surfaceIssues = getSurfaceIssues();

  // Status config
  const statusConfig = {
    pending_review: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '🔍 Review' },
    reviewed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '✅ Reviewed' },
    sending: { bg: 'bg-green-500/20', text: 'text-green-400', label: '📦 Sending' },
    submitted: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '📬 Submitted' },
    returned: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '🎉 Returned' },
    keeping_raw: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '📋 Keep Raw' }
  };
  const statusStyle = statusConfig[localCard.grading_review_status] || statusConfig.pending_review;

  // COLLAPSED VIEW
  if (!isExpanded) {
    return (
      <div 
        className='bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-xl p-3 cursor-pointer hover:border-amber-500/50 transition-all'
        onClick={() => setIsExpanded(true)}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-slate-400'>▶</span>
            <h3 className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'>
              💎 Grading Review
            </h3>
            {hasReviewStatus && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {localCard.estimated_grade && (
              <span className={`text-sm font-black ${
                localCard.estimated_grade >= 9.5 ? 'text-emerald-400' :
                localCard.estimated_grade >= 9 ? 'text-green-400' :
                localCard.estimated_grade >= 8 ? 'text-yellow-400' :
                'text-orange-400'
              }`}>Est: {localCard.estimated_grade}</span>
            )}
            <span className='text-xs text-slate-500'>Click to expand</span>
          </div>
        </div>
      </div>
    );
  }

  // EXPANDED VIEW
  return (
    <div className='bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-xl p-3'>
      {/* Header - Clickable to collapse */}
      <div 
        className='flex items-center justify-between mb-3 cursor-pointer'
        onClick={() => setIsExpanded(false)}
      >
        <div className='flex items-center gap-2'>
          <span className='text-slate-400'>▼</span>
          <h3 className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'>
            💎 Grading Review
          </h3>
          {hasReviewStatus && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          )}
        </div>
        <span className='text-xs text-slate-500 hover:text-slate-300'>Click to collapse</span>
      </div>
      
      {hasReviewStatus ? (
        <div className='space-y-3'>
          {/* ESTIMATED GRADE FROM GRADING LAB */}
          {localCard.estimated_grade && (
            <div className='bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-bold text-emerald-400'>🔬 GradingLab Estimate</span>
                <span className={`text-2xl font-black ${
                  localCard.estimated_grade >= 9.5 ? 'text-emerald-400' :
                  localCard.estimated_grade >= 9 ? 'text-green-400' :
                  localCard.estimated_grade >= 8 ? 'text-yellow-400' :
                  localCard.estimated_grade >= 6 ? 'text-orange-400' :
                  'text-red-400'
                }`}>{localCard.estimated_grade}</span>
              </div>
              
              {/* Quick Score Summary */}
              <div className='grid grid-cols-4 gap-1 text-center mb-2'>
                {cornerAvg && (
                  <div className='bg-slate-900/50 rounded p-1'>
                    <p className='text-[9px] text-slate-500'>Corners</p>
                    <p className='text-xs font-bold text-amber-400'>{cornerAvg}</p>
                  </div>
                )}
                {edgeAvg && (
                  <div className='bg-slate-900/50 rounded p-1'>
                    <p className='text-[9px] text-slate-500'>Edges</p>
                    <p className='text-xs font-bold text-purple-400'>{edgeAvg}</p>
                  </div>
                )}
                {localCard.surface_score && (
                  <div className='bg-slate-900/50 rounded p-1'>
                    <p className='text-[9px] text-slate-500'>Surface</p>
                    <p className='text-xs font-bold text-cyan-400'>{localCard.surface_score}</p>
                  </div>
                )}
                {localCard.centering_lr && (
                  <div className='bg-slate-900/50 rounded p-1'>
                    <p className='text-[9px] text-slate-500'>Center</p>
                    <p className='text-xs font-bold text-pink-400'>{localCard.centering_lr}/{100-Number(localCard.centering_lr)}</p>
                  </div>
                )}
              </div>
              
              {/* Expandable Detailed Breakdown */}
              <details className='group'>
                <summary className='cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 select-none'>
                  <span className='group-open:rotate-90 transition-transform'>▶</span>
                  View Detailed Breakdown
                </summary>
                
                <div className='mt-2 space-y-2 pt-2 border-t border-slate-700/50'>
                  {/* CORNERS */}
                  {localCard.corner_tl_score && (
                    <div className='bg-amber-500/10 border border-amber-500/30 rounded-lg p-2'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[10px] font-bold text-amber-400'>📐 Corners</span>
                        <span className='text-xs font-black text-amber-400'>{cornerAvg}</span>
                      </div>
                      <div className='grid grid-cols-2 gap-1 text-[9px]'>
                        {[
                          { label: 'Top Left', score: localCard.corner_tl_score },
                          { label: 'Top Right', score: localCard.corner_tr_score },
                          { label: 'Bottom Left', score: localCard.corner_bl_score },
                          { label: 'Bottom Right', score: localCard.corner_br_score }
                        ].map(({ label, score }) => (
                          <div key={label} className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                            <span className='text-slate-500'>{label}</span>
                            <span className={`font-bold ${Number(score) >= 9 ? 'text-emerald-400' : Number(score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* EDGES */}
                  {localCard.edge_top_score && (
                    <div className='bg-purple-500/10 border border-purple-500/30 rounded-lg p-2'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[10px] font-bold text-purple-400'>📏 Edges</span>
                        <span className='text-xs font-black text-purple-400'>{edgeAvg}</span>
                      </div>
                      <div className='grid grid-cols-2 gap-1 text-[9px]'>
                        {[
                          { label: 'Top', score: localCard.edge_top_score },
                          { label: 'Bottom', score: localCard.edge_bottom_score },
                          { label: 'Left', score: localCard.edge_left_score },
                          { label: 'Right', score: localCard.edge_right_score }
                        ].map(({ label, score }) => (
                          <div key={label} className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                            <span className='text-slate-500'>{label}</span>
                            <span className={`font-bold ${Number(score) >= 9 ? 'text-emerald-400' : Number(score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* SURFACE */}
                  {localCard.surface_score && (
                    <div className='bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[10px] font-bold text-cyan-400'>✨ Surface</span>
                        <span className={`text-xs font-black ${Number(localCard.surface_score) >= 9.5 ? 'text-emerald-400' : Number(localCard.surface_score) >= 9 ? 'text-green-400' : Number(localCard.surface_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>{localCard.surface_score}</span>
                      </div>
                      {surfaceIssues && (
                        <div className='text-[9px] flex gap-2'>
                          {surfaceIssues.high > 0 && <span className='text-red-400'>🔴 {surfaceIssues.high} critical</span>}
                          {surfaceIssues.medium > 0 && <span className='text-yellow-400'>🟡 {surfaceIssues.medium} moderate</span>}
                          {surfaceIssues.low > 0 && <span className='text-blue-400'>🔵 {surfaceIssues.low} minor</span>}
                          {surfaceIssues.total === 0 && <span className='text-emerald-400'>✓ Clean</span>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* CENTERING */}
                  {localCard.centering_lr && (
                    <div className='bg-pink-500/10 border border-pink-500/30 rounded-lg p-2'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[10px] font-bold text-pink-400'>🎯 Centering</span>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-[9px]'>
                        <div className='bg-slate-900/50 rounded p-1.5'>
                          <p className='text-slate-500 mb-0.5'>L/R</p>
                          <p className={`font-bold text-sm ${Math.abs(Number(localCard.centering_lr) - 50) <= 5 ? 'text-emerald-400' : Math.abs(Number(localCard.centering_lr) - 50) <= 10 ? 'text-yellow-400' : 'text-orange-400'}`}>
                            {localCard.centering_lr}/{100 - Number(localCard.centering_lr)}
                          </p>
                        </div>
                        <div className='bg-slate-900/50 rounded p-1.5'>
                          <p className='text-slate-500 mb-0.5'>T/B</p>
                          <p className={`font-bold text-sm ${Math.abs(Number(localCard.centering_tb || 50) - 50) <= 5 ? 'text-emerald-400' : Math.abs(Number(localCard.centering_tb || 50) - 50) <= 10 ? 'text-yellow-400' : 'text-orange-400'}`}>
                            {localCard.centering_tb || 50}/{100 - Number(localCard.centering_tb || 50)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </details>
              
              {/* Thumbnail with Toggle */}
              {surfaceIssues && surfaceIssues.total > 0 && (
                <div className='mt-3 pt-2 border-t border-slate-700/50'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-[10px] text-slate-400'>Surface Issues Map</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowThumbnail(!showThumbnail); }}
                      className='flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300'
                    >
                      {showThumbnail ? '👁️ Hide' : '👁️ Show'}
                    </button>
                  </div>
                  
                  {showThumbnail && (
                    <div className='flex gap-3'>
                      <div 
                        className='relative w-16 h-22 bg-slate-900 rounded-lg overflow-hidden cursor-pointer border border-slate-600 hover:border-indigo-500 transition-all flex-shrink-0'
                        onClick={() => navigate(`/grading-lab?cardId=${card.id}`)}
                        title='Click to open GradingLab'
                      >
                        <img src={localCard.front_image_url} alt='Inspection' className='w-full h-full object-cover opacity-80' />
                        {surfaceIssues.issues.slice(0, 8).map((issue, idx) => (
                          <div
                            key={idx}
                            className={`absolute w-1.5 h-1.5 rounded-full ${issue.severity === 'high' ? 'bg-red-500' : issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ left: `${issue.x}%`, top: `${issue.y}%`, transform: 'translate(-50%, -50%)' }}
                          />
                        ))}
                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-0.5'>
                          <p className='text-[7px] text-center text-slate-300'>🔬 Lab</p>
                        </div>
                      </div>
                      <div className='flex-1 text-[10px]'>
                        <p className='text-slate-400'>{surfaceIssues.total} issues detected</p>
                        <div className='flex gap-1.5 flex-wrap mt-1'>
                          {surfaceIssues.high > 0 && <span className='px-1 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px]'>{surfaceIssues.high} high</span>}
                          {surfaceIssues.medium > 0 && <span className='px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px]'>{surfaceIssues.medium} med</span>}
                          {surfaceIssues.low > 0 && <span className='px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px]'>{surfaceIssues.low} low</span>}
                        </div>
                        {localCard.grading_inspection_date && (
                          <p className='text-[9px] text-slate-500 mt-1'>
                            {new Date(localCard.grading_inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Inspection date if no issues */}
              {(!surfaceIssues || surfaceIssues.total === 0) && localCard.grading_inspection_date && (
                <p className='text-[10px] text-slate-500 mt-2 text-center border-t border-slate-700/50 pt-2'>
                  Inspected: {new Date(localCard.grading_inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
          
          {/* User Prediction */}
          <div className='bg-slate-900/50 rounded-lg p-3'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs text-slate-400'>🎯 My Prediction</span>
              <button
                onClick={async () => {
                  const grade = prompt('What grade do you think this card will get? (1-10)', localCard.user_predicted_grade || '');
                  if (grade !== null) {
                    const numGrade = parseFloat(grade);
                    if (!isNaN(numGrade) && numGrade >= 1 && numGrade <= 10) {
                      try {
                        const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_predicted_grade: numGrade })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setLocalCard(prev => ({ ...prev, user_predicted_grade: numGrade }));
                          if (typeof onUpdate === 'function') await onUpdate();
                        }
                      } catch (err) { alert('Failed to save prediction'); }
                    } else if (grade !== '') { alert('Please enter a grade between 1 and 10'); }
                  }
                }}
                className='text-xs text-indigo-400 hover:text-indigo-300'
              >
                {localCard.user_predicted_grade ? 'Edit' : '+ Add'}
              </button>
            </div>
            {localCard.user_predicted_grade ? (
              <p className={`text-xl font-black ${localCard.user_predicted_grade >= 9.5 ? 'text-emerald-400' : localCard.user_predicted_grade >= 9 ? 'text-green-400' : localCard.user_predicted_grade >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {localCard.user_predicted_grade}
                {localCard.estimated_grade && (
                  <span className='text-xs text-slate-500 ml-2'>
                    ({localCard.user_predicted_grade > localCard.estimated_grade ? '+' : ''}{(localCard.user_predicted_grade - localCard.estimated_grade).toFixed(1)} vs AI)
                  </span>
                )}
              </p>
            ) : (
              <p className='text-xs text-slate-500'>Tap to add your grade prediction</p>
            )}
          </div>
          
          {/* Target Company & Notes */}
          <div className='bg-slate-900/50 rounded-lg p-3'>
            {localCard.target_grading_company && (
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs text-slate-400'>Target</span>
                <span className='text-xs font-bold text-purple-400'>{localCard.target_grading_company}</span>
              </div>
            )}
            {localCard.grading_review_notes && (
              <div className='pt-2 border-t border-slate-700'>
                <p className='text-xs text-slate-400 mb-1'>Notes:</p>
                <p className='text-xs text-slate-300 whitespace-pre-wrap'>{localCard.grading_review_notes}</p>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className='grid grid-cols-2 gap-2'>
            {(localCard.grading_review_status === 'pending_review' || localCard.grading_review_status === 'reviewed') && (
              <>
                <button
                  onClick={async () => {
                    const company = prompt('Which grading company? (PSA, BGS, SGC, CGC)', localCard.target_grading_company || 'PSA');
                    if (company) {
                      try {
                        const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ grading_review_status: 'sending', grading_decision: 'send', target_grading_company: company })
                        });
                        const data = await response.json();
                        if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert(`✅ Marked for grading with ${company}!`); }
                      } catch (err) { alert('Failed to update'); }
                    }
                  }}
                  className='py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs font-bold text-green-400 transition-all'
                >📦 Send to Grade</button>
                <button
                  onClick={async () => {
                    try {
                      const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ grading_review_status: 'keeping_raw', grading_decision: 'keep_raw' })
                      });
                      const data = await response.json();
                      if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert('📋 Marked as keeping raw'); }
                    } catch (err) { alert('Failed to update'); }
                  }}
                  className='py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 rounded-lg text-xs font-bold text-gray-400 transition-all'
                >📋 Keep Raw</button>
              </>
            )}
            {localCard.grading_review_status === 'sending' && (
              <button
                onClick={async () => {
                  if (confirm(`Mark as submitted to ${localCard.target_grading_company || 'grading company'}?`)) {
                    try {
                      const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grading_review_status: 'submitted' }) });
                      const data = await response.json();
                      if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert(`📬 Submitted!`); }
                    } catch (err) { alert('Failed'); }
                  }
                }}
                className='col-span-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-xs font-bold text-purple-400 transition-all'
              >📬 Mark as Submitted</button>
            )}
            {localCard.grading_review_status === 'submitted' && (
              <button
                onClick={async () => {
                  if (confirm('Card returned from grading?')) {
                    try {
                      const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grading_review_status: 'returned' }) });
                      const data = await response.json();
                      if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert('🎉 Returned!'); }
                    } catch (err) { alert('Failed'); }
                  }
                }}
                className='col-span-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-400 transition-all'
              >🎉 Mark as Returned</button>
            )}
            {localCard.grading_review_status === 'returned' && (
              <button onClick={() => setShowEditModal(true)} className='col-span-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-lg text-sm font-bold text-white transition-all shadow-lg'>✅ Update as Graded</button>
            )}
            {localCard.grading_review_status === 'keeping_raw' && (
              <button
                onClick={async () => {
                  try {
                    const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grading_review_status: 'pending_review', grading_decision: null }) });
                    const data = await response.json();
                    if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert('🔍 Back to review'); }
                  } catch (err) { alert('Failed'); }
                }}
                className='col-span-2 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-xs font-bold text-yellow-400 transition-all'
              >🔄 Reconsider for Grading</button>
            )}
          </div>
          
          {/* Open in GradingLab Button */}
          <button
            onClick={() => navigate(`/grading-lab?cardId=${card.id}`)}
            className='w-full py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 rounded-lg text-sm text-indigo-400 font-medium transition-all flex items-center justify-center gap-2'
          >
            🔬 Open in GradingLab
          </button>
          
          {/* Add/Edit Notes */}
          <button
            onClick={async () => {
              const notes = prompt('Add review notes:', localCard.grading_review_notes || '');
              if (notes !== null) {
                try {
                  const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grading_review_notes: notes }) });
                  const data = await response.json();
                  if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); }
                } catch (err) { alert('Failed'); }
              }
            }}
            className='w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-400 transition-all'
          >✏️ {localCard.grading_review_notes ? 'Edit Notes' : 'Add Notes'}</button>
          
          {/* Remove from Review */}
          <button
            onClick={async () => {
              if (confirm('Remove from grading review?')) {
                try {
                  const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'DELETE' });
                  const data = await response.json();
                  if (data.success) { setLocalCard(prev => ({ ...prev, grading_review_status: null, grading_review_notes: null, target_grading_company: null, grading_decision: null })); if (typeof onUpdate === 'function') await onUpdate(); alert('Removed'); }
                } catch (err) { alert('Failed'); }
              }
            }}
            className='w-full py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-all'
          >🗑️ Remove from Review</button>
        </div>
      ) : (
        /* NOT YET IN REVIEW - Show Flag Button */
        <button
          onClick={async () => {
            try {
              const response = await apiFetch(`/cards/${card.id}/grading-review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grading_review_status: 'pending_review' }) });
              const data = await response.json();
              if (data.success) { setLocalCard(prev => ({ ...prev, ...data.card })); if (typeof onUpdate === 'function') await onUpdate(); alert('🔍 Flagged for review!'); }
            } catch (err) { alert('Failed'); }
          }}
          className='w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border-2 border-dashed border-amber-500/50 rounded-lg transition-all'
        >
          <p className='text-sm font-bold text-amber-400'>🔍 Flag for Grading Review</p>
          <p className='text-xs text-amber-300/70 mt-1'>Add to your review queue</p>
        </button>
      )}
    </div>
  );
}

export default function CardDetailModal({ card, onClose, onUpdate }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showBack, setShowBack] = useState(false);
  const [pricing, setPricing] = useState(false);
  const [localCard, setLocalCard] = useState(() => {
  // Parse psa_auction_data if it's a string
  if (card.psa_auction_data && typeof card.psa_auction_data === 'string') {
    try {
      return {
        ...card,
        psa_auction_data: JSON.parse(card.psa_auction_data)
      };
    } catch (e) {
      console.error('Failed to parse PSA data:', e);
      return card;
    }
  }
  return card;
});
  const [showListing, setShowListing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingSide, setEditingSide] = useState('front');
  const [isSaving, setIsSaving] = useState(false);
  const [ebayConnected, setEbayConnected] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);
  const [replacingSide, setReplacingSide] = useState(null);
  const fileInputRef = useRef(null);
  const [showSoldCompsModal, setShowSoldCompsModal] = useState(false);
  const [soldCompsData, setSoldCompsData] = useState([]);
  const [loadingSoldComps, setLoadingSoldComps] = useState(false);
  
  // Mark as Sold modal
  const [showMarkAsSoldModal, setShowMarkAsSoldModal] = useState(false);
  
  // Parallel Pricing modal
  const [showParallelModal, setShowParallelModal] = useState(false);
  const [cachedParallels, setCachedParallels] = useState(null);
  
  // Expose function globally for HistoricalCompsModal to call
  useEffect(() => {
    window.showParallelPricing = (card) => {
      setShowParallelModal(true);
    };
    
    return () => {
      window.showParallelPricing = null;
    };
  }, []);
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);
  const [showGradingAssistant, setShowGradingAssistant] = useState(false);
  const [showEbayListingModal, setShowEbayListingModal] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  
  // NFC + QR Tab state
  const [shareTab, setShareTab] = useState('nfc');
  const [nfcSupported, setNfcSupported] = useState(null);
  const [nfcError, setNfcError] = useState(null);
  const [writingNFC, setWritingNFC] = useState(false);

  // NFC/Public state
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // Smart pricing state
  const [showSmartPricing, setShowSmartPricing] = useState(false);
  const [activeListings, setActiveListings] = useState([]);
  const [activeMetadata, setActiveMetadata] = useState(null);
  const [sportsCardsProData, setSportsCardsProData] = useState(() => {
  // 🔥 INITIALIZE WITH CARD'S EXISTING SCP DATA
  if (card.sportscardspro_psa10) {
    return {
      psa10: card.sportscardspro_psa10,
      raw: card.sportscardspro_raw,
      psa7: card.sportscardspro_psa7,
      psa8: card.sportscardspro_psa8,
      psa9: card.sportscardspro_psa9,
      bgs10: card.sportscardspro_bgs10,
      cgc10: card.sportscardspro_cgc10,
      sgc10: card.sportscardspro_sgc10,
      salesVolume: card.sportscardspro_sales_volume
    };
  }
  return null;
});

  // 🎴 POKEMON PRICING STATE
  const [showPokemonHistorical, setShowPokemonHistorical] = useState(false);
  const [pokemonPricingData, setPokemonPricingData] = useState(() => {
    // Check if card already has data
    if (card.tcgplayer_market) {
      return {
        market: card.tcgplayer_market,
        low: card.tcgplayer_low,
        mid: card.tcgplayer_mid,
        high: card.tcgplayer_high
      };
    }
    return null;
  });

  // NEW: For Sale editing state
  const [editingForSale, setEditingForSale] = useState(false);
  const [forSaleData, setForSaleData] = useState({
    for_sale: card.for_sale || false,
    asking_price: card.asking_price || '',
    price_type: card.price_type || 'firm',
    owner_notes: card.owner_notes || '',
    trade_interests: card.trade_interests || '',
    contact_preference: card.contact_preference || 'email',
    hide_owner_info: card.hide_owner_info || false
  });
  
  const modalRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Check eBay connection status
  useEffect(() => {
    const checkEbayConnection = async () => {
      try {
        const response = await apiFetch('/ebay/seller-status');
        const data = await response.json();
        if (data.success) {
          setEbayConnected(data.connected);
        }
      } catch (error) {
        console.error('Failed to check eBay connection:', error);
      }
    };
    
    checkEbayConnection();
  }, []);

  // NFC Support Detection
  useEffect(() => {
    const checkNFCSupport = async () => {
      // Check if Web NFC API exists
      if ('NDEFReader' in window) {
        try {
          const ndef = new NDEFReader();
          // Android Chrome has full support
          setNfcSupported(true);
          setShareTab('nfc'); // Auto-select NFC tab
        } catch (error) {
          setNfcSupported(false);
          setNfcError('NFC not available');
          setShareTab('qr'); // Auto-select QR tab
        }
      } else {
        // Check if iOS
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
          setNfcSupported(false);
          setNfcError('iOS Safari doesn\'t support NFC writing via web browser');
        } else {
          setNfcSupported(false);
          setNfcError('Your browser doesn\'t support NFC');
        }
        setShareTab('qr'); // Auto-select QR tab for unsupported devices
      }
    };

    checkNFCSupport();
  }, []);

  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
  const loadEditedImages = async () => {
    let frontUrl = card.front_image_url;
    let backUrl = card.back_image_url;
    
    if (window.getEditedImage) {
      const editedFront = await window.getEditedImage(card.id, 'front');
      const editedBack = await window.getEditedImage(card.id, 'back');
      frontUrl = editedFront || card.front_image_url;
      backUrl = editedBack || card.back_image_url;
    }
    
    // Detect horizontal with consistent threshold
    if (frontUrl) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setIsHorizontal(aspectRatio > 1.2);
        console.log(`📐 Card modal aspect: ${aspectRatio.toFixed(2)}, horizontal: ${aspectRatio > 1.2}`);
      };
      img.src = frontUrl;
    }
    
    // Parse PSA data if it's a string
    let parsedPsaData = card.psa_auction_data;
    if (parsedPsaData && typeof parsedPsaData === 'string') {
      try {
        parsedPsaData = JSON.parse(parsedPsaData);
      } catch (e) {
        console.error('Failed to parse PSA data:', e);
      }
    }
    
    setLocalCard(prev => {
      const preserveLocalUpdates = prev && prev.id === card.id;
      
      return {
        ...card,
        front_image_url: frontUrl,
        back_image_url: backUrl,
        psa_auction_data: parsedPsaData,
        ...(preserveLocalUpdates ? {
          is_public: prev.is_public !== undefined ? prev.is_public : card.is_public,
          public_views: prev.public_views !== undefined ? prev.public_views : card.public_views
        } : {})
      };
    });
  };
  loadEditedImages();
}, [card]);

  const setName = card.set_name.replace(/^\d{4}\s+/, '');

  const buildEbaySearchQuery = (card) => {
  const cleanSetName = card.set_name?.replace(/^\d{4}\s+/, '') || card.set_name || '';
  let query = `${card.year} ${cleanSetName} ${card.player}`;
  if (card.card_number) query += ` ${card.card_number}`;
  if (card.parallel && card.parallel !== 'Base') query += ` ${card.parallel}`;
  if (card.grading_company) query += ` ${card.grading_company} ${card.grade}`;
  
  // 🔥 FIX: Extract numbered_to (99) instead of serial_number (12/99)
  if (card.numbered_to) {
    query += ` /${card.numbered_to}`;
  } else if (card.serial_number && card.serial_number.includes('/')) {
    // Fallback: extract denominator from serial_number if numbered_to is missing
    const denominator = card.serial_number.split('/')[1];
    if (denominator) query += ` /${denominator}`;
  }
  
  return query.trim();
};

  // UNIFIED MARKET COMPS
  const handleViewMarketComps = async () => {
    setPricing(true);
    
    try {
      const searchQuery = localCard.ebay_search_string || buildEbaySearchQuery(localCard);
      
      const cardDetails = {
  cardId: card.id, // 🔥 USE ORIGINAL CARD PROP, NOT LOCAL STATE
  player: localCard.player,
  year: localCard.year,
  setName: localCard.set_name?.replace(/^\d{4}\s+/, ''),
  cardNumber: localCard.card_number,
  parallel: localCard.parallel,
  gradingCompany: localCard.grading_company,
  grade: localCard.grade,
  isGraded: !!localCard.grading_company,
  sport: localCard.sport
};

      const activeResponse = await apiFetch('/cards/quick-price-check', {
        method: 'POST',
        body: JSON.stringify({ searchQuery, cardDetails })
      });

      const activeData = await activeResponse.json();

if (activeData.success && activeData.sales && activeData.sales.length > 0) {
  setActiveListings(activeData.sales);
  setActiveMetadata(activeData.searchMetadata || null);
  
  // 🔥 ACTUALLY STORE THE DATA (you forgot this!)
  if (activeData.sportsCardsPro) {
  setSportsCardsProData(activeData.sportsCardsPro);
  console.log('💎 SportsCardsPro data loaded:', activeData.sportsCardsPro);
  
  // 🔥 UPDATE LOCAL CARD STATE IMMEDIATELY
  setLocalCard(prev => ({
    ...prev,
    sportscardspro_psa10: activeData.sportsCardsPro.psa10,
    sportscardspro_raw: activeData.sportsCardsPro.raw
  }));
}

setShowSmartPricing(true);

// 🔥 REFRESH DASHBOARD IN BACKGROUND
setTimeout(async () => {
  if (typeof onUpdate === 'function') {
  await onUpdate();
}; // This refreshes the dashboard
}, 500);
} else {
        setActiveListings([]);
        setActiveMetadata(null);
        alert('⚠️ No active listings found. Try searching eBay directly.');
      }

    } catch (error) {
      console.error('Error fetching market comps:', error);
      alert('❌ Failed to fetch market data');
    } finally {
      setPricing(false);
    }
  };

  const handleViewSoldHistory = () => {
    const query = buildEbaySearchQuery(localCard);
    window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`, '_blank');
  };

  // 🔥 NEW: Fetch SportsCardsPro data if not already loaded
 const fetchSportsCardsProData = async () => {
    // 🛡️ SAFETY: Wrap in try-catch
    try {
      // If we already have data, just show modal
      if (sportsCardsProData?.psa10) {
        setShowSoldCompsModal(true);
        return;
      }

      // Otherwise, fetch it
      setPricing(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/sportscardspro/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: localCard.player,
          year: localCard.year,
          setName: localCard.set_name?.replace(/^\d{4}\s+/, ''),
          cardNumber: localCard.card_number,
          parallel: localCard.parallel || 'Base',
          sport: localCard.sport
        }),
        signal: AbortSignal.timeout(15000) // 🛡️ 15 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.pricing) {
        // 🛡️ VALIDATE: Make sure we have at least one price
        const hasAnyPrice = Object.values(data.pricing).some(val => 
          val && !isNaN(parseFloat(val)) && parseFloat(val) > 0
        );
        
        if (!hasAnyPrice) {
          alert('⚠️ No pricing data available for this card');
          return;
        }
        
        setSportsCardsProData(data.pricing);
        setShowSoldCompsModal(true);
      } else {
        alert('⚠️ No historical sold data found for this card in SportsCardsPro database');
      }
      
    } catch (error) {
      console.error('❌ SportsCardsPro fetch failed:', error);
      
      // 🛡️ User-friendly error messages
      if (error.name === 'TimeoutError') {
        alert('⏱️ Request timed out. SportsCardsPro API may be slow right now. Try again in a moment.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('🌐 Network error. Check your internet connection.');
      } else {
        alert('❌ Failed to load historical data. This feature is still in beta.');
      }
    } finally {
      setPricing(false);
    }
  };

  // 🎴 NEW: Fetch Pokemon TCGPlayer data
  const fetchPokemonPricingData = async () => {
    try {
      // If we already have data, just show modal
      if (pokemonPricingData?.market) {
        setShowPokemonHistorical(true);
        return;
      }

      // Otherwise, fetch it
      setPricing(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/pokemon/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: localCard.player,
          setName: localCard.set_name?.replace(/^\d{4}\s+/, ''),
          cardNumber: localCard.card_number,
          parallel: localCard.parallel || 'Base'
        }),
        signal: AbortSignal.timeout(30000) // 🛡️ 30 second timeout (Pokemon API is slower)
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.pricing) {
        // 🛡️ VALIDATE: Make sure we have at least one price
        const hasAnyPrice = Object.values(data.pricing).some(val => 
          val && !isNaN(parseFloat(val)) && parseFloat(val) > 0
        );
        
        if (!hasAnyPrice) {
          alert('⚠️ No pricing data available for this Pokemon card');
          return;
        }
        
        setPokemonPricingData(data.pricing);
        setShowPokemonHistorical(true);
      } else {
        alert('⚠️ No pricing data found for this card in TCGPlayer database');
      }
      
    } catch (error) {
      console.error('❌ Pokemon pricing fetch failed:', error);
      
      // 🛡️ User-friendly error messages
      if (error.name === 'TimeoutError') {
        alert('⏱️ Request timed out. TCGPlayer API is taking longer than usual. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('🌐 Network error. Check your internet connection.');
      } else {
        alert('❌ Failed to load Pokemon pricing data.');
      }
    } finally {
      setPricing(false);
    }
  };

  const handleSelectPrice = async (priceData) => {
  try {
    console.log('💾 CardDetailModal: Saving price data:', priceData);
    
    const response = await cardsAPI.updatePrice(card.id, priceData);
    if (response.success && response.card) {
      setLocalCard(response.card);
      
      // 🔥 UPDATE LOCAL SPORTSCARDSPRO DATA
      if (priceData.sportscardspro_psa10 || priceData.sportscardspro_raw) {
        setSportsCardsProData({
          raw: priceData.sportscardspro_raw,
          psa7: priceData.sportscardspro_psa7,
          psa8: priceData.sportscardspro_psa8,
          psa9: priceData.sportscardspro_psa9,
          psa10: priceData.sportscardspro_psa10,
          bgs10: priceData.sportscardspro_bgs10,
          cgc10: priceData.sportscardspro_cgc10,
          sgc10: priceData.sportscardspro_sgc10,
          salesVolume: priceData.sportscardspro_sales_volume
        });
      }
      
      // 🎴 UPDATE LOCAL POKEMON DATA
      if (priceData.tcgplayer_market || priceData.tcgplayer_low) {
        setPokemonPricingData({
          market: priceData.tcgplayer_market,
          low: priceData.tcgplayer_low,
          mid: priceData.tcgplayer_mid,
          high: priceData.tcgplayer_high
        });
      }
    }
    
    if (typeof onUpdate === 'function') {
  await onUpdate();
};
    setShowSmartPricing(false);
    setShowSoldCompsModal(false);
    setShowPokemonHistorical(false); // 🔥 CLOSE POKEMON MODAL
    
    // 🔥 SMART ALERT MESSAGE
    const fromHistorical = priceData.sportscardspro_psa10 || priceData.sportscardspro_raw;
    const fromPokemon = priceData.tcgplayer_market || priceData.tcgplayer_low;
    
    if (fromPokemon) {
      alert(`✅ TCGPlayer price updated!`);
    } else if (fromHistorical) {
      alert(`✅ Historical Sold price updated!`);
    } else if (priceData.ebay_avg) {
      alert(`✅ Lowest BIN price set to $${priceData.ebay_avg.toFixed(2)}`);
    } else {
      alert(`✅ Price data updated!`);
    }
  } catch (error) {
    console.error('Failed to update price:', error);
    alert('❌ Failed to update price');
  }
};

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleDownloadBothImages = async () => {
    if (isMobile) {
      alert('📱 Tap and hold each image to save');
    } else {
      try {
        const base64ToBlob = async (base64) => {
          const response = await fetch(base64);
          return await response.blob();
        };
        
        const frontBlob = await base64ToBlob(localCard.front_image_url);
        const frontLink = document.createElement('a');
        frontLink.href = URL.createObjectURL(frontBlob);
        frontLink.download = `${card.player}_${card.year}_FRONT.jpg`.replace(/\s+/g, '_');
        document.body.appendChild(frontLink);
        frontLink.click();
        document.body.removeChild(frontLink);
        URL.revokeObjectURL(frontLink.href);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (localCard.back_image_url) {
          const backBlob = await base64ToBlob(localCard.back_image_url);
          const backLink = document.createElement('a');
          backLink.href = URL.createObjectURL(backBlob);
          backLink.download = `${card.player}_${card.year}_BACK.jpg`.replace(/\s+/g, '_');
          document.body.appendChild(backLink);
          backLink.click();
          document.body.removeChild(backLink);
          URL.revokeObjectURL(backLink.href);
        }
        
        alert('✅ Downloaded!');
      } catch (error) {
        alert('❌ Failed');
      }
    }
  };

  const handleSavePrice = async (newPrice) => {
    if (newPrice === null || newPrice === undefined) {
      setEditingPrice(false);
      setTempPrice('');
      return;
    }

    const priceValue = parseFloat(newPrice);

    if (isNaN(priceValue) || priceValue < 0) {
      alert('❌ Please enter a valid price (0 or greater)');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    
    try {
      const response = await cardsAPI.updatePrice(card.id, {
        ebay_avg: priceValue,
        ebay_low: priceValue,
        ebay_high: priceValue,
        ebay_sample_size: 1
      });
      
      if (response.success && response.card) {
        setLocalCard(response.card);
      } else {
        setLocalCard({
          ...localCard,
          ebay_avg: priceValue,
          ebay_low: priceValue,
          ebay_high: priceValue,
          ebay_sample_size: 1
        });
      }
      
      if (typeof onUpdate === 'function') {
  await onUpdate();
};
      setEditingPrice(false);
      setTempPrice('');
      alert(`✅ Price set to $${priceValue.toFixed(2)}`);
    } catch (error) {
      console.error('Failed to save price:', error);
      alert('❌ Failed to save price. Please try again.');
      setLocalCard(card);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAskingPrice = async (askingPrice) => {
    setIsSaving(true);
    try {
      const response = await cardsAPI.update(card.id, {
        ...localCard,
        asking_price: askingPrice
      });
      
      if (response.success) {
        setLocalCard({
          ...localCard,
          asking_price: askingPrice
        });
        
        // 🔥 SAFE: Only call onUpdate if it exists
        if (typeof onUpdate === 'function') {
          await onUpdate();
        }
        
        alert(askingPrice ? `✅ Your asking price set to $${parseFloat(askingPrice).toFixed(2)}` : '✅ Asking price cleared');
      }
    } catch (error) {
      console.error('Failed to save asking price:', error);
      alert('❌ Failed to save asking price');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartManualPrice = () => {
    setEditingPrice(true);
    setTempPrice(localCard.ebay_low ? parseFloat(localCard.ebay_low).toFixed(2) : '');
  };

  const handleTogglePublic = async () => {
    setTogglingPublic(true);
    try {
      const response = await apiFetch(`/cards/${card.id}/toggle-public`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedCard = data.card;
        
        setLocalCard(prev => ({
          ...prev,
          is_public: updatedCard.is_public,
          short_id: updatedCard.short_id,
          public_views: updatedCard.public_views || 0
        }));
        
        const wasPublic = updatedCard.is_public === true || updatedCard.is_public === 1;
        
        if (wasPublic) {
          alert(`⭐ Added to Showcase!\n\nPublic URL: ${data.publicUrl}\n\nShare this link or write it to an NFC tag!`);
        } else {
          alert('🔒 Removed from Showcase');
        }
        
        if (typeof onUpdate === 'function') {
  await onUpdate();
};
        
      } else {
        alert('❌ Failed to update showcase status');
      }
    } catch (error) {
      console.error('Toggle showcase error:', error);
      alert('❌ Failed to update showcase status');
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleCopyPublicUrl = () => {
    if (!localCard.short_id) return;
    
    const publicUrl = `https://slabtrack.io/card/${localCard.short_id}`;
    navigator.clipboard.writeText(publicUrl);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  // NEW: Download QR code as PNG
  const handleDownloadQR = () => {
    if (!localCard.short_id) return;
    
    const svg = document.getElementById('showcase-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${card.player}_${card.year}_QR.png`.replace(/\s+/g, '_');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleWriteNFC = async () => {
    if (!localCard.short_id || writingNFC) return;

    setWritingNFC(true);

    try {
      const ndef = new NDEFReader();
      const publicUrl = `https://slabtrack.io/card/${localCard.short_id}`;

      await ndef.write({
        records: [
          { 
            recordType: "url", 
            data: publicUrl 
          }
        ]
      });

      alert(`✅ NFC Tag Written Successfully!\n\n${card.player} - ${card.year}\n\nAnyone who taps this tag will see this card!`);
      
      // Log NFC write for analytics (optional)
      try {
        await apiFetch(`/cards/${card.id}/log-nfc-write`, {
          method: 'POST',
          body: JSON.stringify({ short_id: localCard.short_id })
        });
      } catch (e) {
        console.log('Analytics logging failed (non-critical)');
      }

    } catch (error) {
      console.error('NFC Write Error:', error);
      
      if (error.name === 'NotAllowedError') {
        alert('❌ NFC permission denied. Please allow NFC access and try again.');
      } else if (error.name === 'NotSupportedError') {
        alert('❌ NFC is not supported on this device.');
        setNfcSupported(false);
        setShareTab('qr');
      } else if (error.name === 'NotReadableError') {
        alert('❌ NFC tag is not writable or already locked.');
      } else {
        alert(`❌ NFC Write Failed: ${error.message}`);
      }
    } finally {
      setWritingNFC(false);
    }
  };

  const handleQuickTransfer = async (cardId) => {
  try {
    const response = await apiFetch(`/cards/${cardId}/generate-transfer-code`, {
      method: 'POST'
    });
      
      if (!response.ok) {
        throw new Error('Failed to generate transfer code');
      }
      
      const data = await response.json();
      
      return {
        transferCode: data.transferCode,
        claimUrl: `${window.location.origin}/claim/${data.transferCode}`,
        expiresAt: data.expiresAt
      };
    } catch (error) {
      console.error('Transfer generation failed:', error);
      throw error;
    }
  };

  // NEW: Save For Sale data
  const handleSaveForSale = async () => {
    setIsSaving(true);
    try {
      const response = await cardsAPI.update(card.id, {
        ...localCard,
        for_sale: forSaleData.for_sale,
        asking_price: forSaleData.asking_price ? parseFloat(forSaleData.asking_price) : null,
        price_type: forSaleData.price_type,
        owner_notes: forSaleData.owner_notes,
        trade_interests: forSaleData.trade_interests,
        contact_preference: forSaleData.contact_preference,
        hide_owner_info: forSaleData.hide_owner_info
      });
      
      if (response.success) {
        setLocalCard({
          ...localCard,
          ...forSaleData,
          asking_price: forSaleData.asking_price ? parseFloat(forSaleData.asking_price) : null,
          hide_owner_info: forSaleData.hide_owner_info
        });
        setEditingForSale(false);
        if (typeof onUpdate === 'function') {
  await onUpdate();
};
        alert('✅ For Sale settings saved!');
      }
    } catch (error) {
      console.error('Failed to save for sale settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Replace/Add image handler
  const handleReplaceImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingSide) return;
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        
        const response = await apiFetch(`/cards/${card.id}/replace-image`, {
          method: 'PATCH',
          body: JSON.stringify({ new_image: base64, side: replacingSide })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLocalCard(data.card);
          if (typeof onUpdate === 'function') await onUpdate();
          alert(`✅ ${replacingSide === 'front' ? 'Front' : 'Back'} image updated!`);
        } else {
          alert('❌ Failed to update image');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Replace image error:', error);
      alert('❌ Failed to update image');
    } finally {
      setReplacingSide(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-slate-950 z-[9999]' onClick={onClose} />
      
      <div className='fixed inset-0 z-[10000] overflow-y-auto bg-slate-900' onClick={onClose}>
        <div className='min-h-screen px-2 sm:px-4 py-4 sm:py-8'>
          <div 
            ref={modalRef}
            className={`relative bg-slate-900 rounded-2xl p-3 sm:p-4 w-full mx-auto border-2 border-slate-700/50 shadow-2xl ${isHorizontal ? 'max-w-[1600px]' : 'max-w-7xl'}`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              opacity: (showListing || showSalesModal || showSoldCompsModal || showImageEditor || showEditModal) ? 0.3 : 1,
              pointerEvents: (showListing || showSalesModal || showSoldCompsModal || showImageEditor || showEditModal) ? 'none' : 'auto'
            }}
          >
            <button
              onClick={onClose}
              className='absolute top-2 right-2 sm:top-3 sm:right-3 p-2 hover:bg-slate-700 rounded-lg transition-all z-10 bg-slate-800/50'
            >
              <X size={20} />
            </button>

            {/* 3 COLUMNS LAYOUT */}
            <div className={`grid grid-cols-1 gap-3 sm:gap-4 lg:items-start ${isHorizontal ? 'lg:grid-cols-[2.5fr_1fr_1fr]' : 'lg:grid-cols-3'}`}>
              
              {/* LEFT: Image + Grading Review */}
              <div className='lg:row-span-2 space-y-3'>
                <div 
                  className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden cursor-pointer relative border-2 border-slate-700/50 hover:border-indigo-500/50 transition-all group flex items-center justify-center ${isHorizontal ? 'aspect-[3/2] w-full' : 'aspect-[2/3] lg:min-h-[600px]'}`}
                  onMouseEnter={() => !isMobile && setShowBack(true)}
                  onMouseLeave={() => !isMobile && setShowBack(false)}
                  onClick={() => isMobile && setShowBack(!showBack)}
                >
                  {localCard.front_image_url && (
                    <>
                      <img
                        src={localCard.front_image_url}
                        alt='Front'
                        className='max-w-full max-h-full object-contain p-4 transition-opacity duration-300'
                        style={{ opacity: showBack ? 0 : 1 }}
                      />
                      {localCard.back_image_url && (
                        <img
                          src={localCard.back_image_url}
                          alt='Back'
                          className='max-w-full max-h-full object-contain p-4 absolute transition-opacity duration-300'
                          style={{ opacity: showBack ? 1 : 0 }}
                        />
                      )}
                    </>
                  )}
                  <div className='absolute bottom-3 left-0 right-0 text-center pointer-events-none'>
                    <p className='text-xs text-slate-400 bg-slate-900/80 backdrop-blur-sm py-1 px-3 rounded-full inline-block'>
                      Tap/hover to flip
                    </p>
                  </div>
                </div>

                {/* GRADING REVIEW SECTION - Under Image for RAW cards */}
                {!localCard.is_graded && (
                  <details className='bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-xl group' open>
                    <summary className='p-3 cursor-pointer list-none flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-slate-400 group-open:rotate-90 transition-transform'>▶</span>
                        <h3 className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center gap-2'>
                          💎 Grading Review
                          {localCard.grading_review_status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              localCard.grading_review_status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                              localCard.grading_review_status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                              localCard.grading_review_status === 'sending' ? 'bg-green-500/20 text-green-400' :
                              localCard.grading_review_status === 'submitted' ? 'bg-purple-500/20 text-purple-400' :
                              localCard.grading_review_status === 'returned' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {localCard.grading_review_status === 'pending_review' ? '🔍 Review' :
                               localCard.grading_review_status === 'reviewed' ? '✅ Reviewed' :
                               localCard.grading_review_status === 'sending' ? '📦 Sending' :
                               localCard.grading_review_status === 'submitted' ? '📬 Submitted' :
                               localCard.grading_review_status === 'returned' ? '🎉 Returned' :
                               '📋 Keep Raw'}
                            </span>
                          )}
                        </h3>
                      </div>
                      {/* Show estimated grade in collapsed header */}
                      <div className='flex items-center gap-2'>
                        {localCard.estimated_grade && (
                          <span className={`text-sm font-black ${
                            localCard.estimated_grade >= 9.5 ? 'text-emerald-400' :
                            localCard.estimated_grade >= 9 ? 'text-green-400' :
                            localCard.estimated_grade >= 8 ? 'text-yellow-400' :
                            'text-orange-400'
                          }`}>Est: {localCard.estimated_grade}</span>
                        )}
                        <span className='text-[10px] text-slate-500 group-open:hidden'>Click to expand</span>
                      </div>
                    </summary>
                    <div className='px-3 pb-3'>
                    
                    {localCard.grading_review_status ? (
                      <div className='space-y-3'>
                        {/* ESTIMATED GRADE FROM GRADING LAB */}
                        {localCard.estimated_grade && (
                          <div className='bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-lg p-3'>
                            {/* Overall Grade Header */}
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-xs font-bold text-emerald-400'>🔬 GradingLab Estimate</span>
                              <span className={`text-2xl font-black ${
                                localCard.estimated_grade >= 9.5 ? 'text-emerald-400' :
                                localCard.estimated_grade >= 9 ? 'text-green-400' :
                                localCard.estimated_grade >= 8 ? 'text-yellow-400' :
                                localCard.estimated_grade >= 6 ? 'text-orange-400' :
                                'text-red-400'
                              }`}>{localCard.estimated_grade}</span>
                            </div>
                            
                            {/* Quick Score Summary - Always Visible */}
                            <div className='grid grid-cols-4 gap-1 text-center mb-2'>
                              {localCard.corner_tl_score && (
                                <div className='bg-slate-900/50 rounded p-1'>
                                  <p className='text-[9px] text-slate-500'>Corners</p>
                                  <p className='text-xs font-bold text-amber-400'>
                                    {((Number(localCard.corner_tl_score || 0) + Number(localCard.corner_tr_score || 0) + Number(localCard.corner_bl_score || 0) + Number(localCard.corner_br_score || 0)) / 4).toFixed(1)}
                                  </p>
                                </div>
                              )}
                              {localCard.edge_top_score && (
                                <div className='bg-slate-900/50 rounded p-1'>
                                  <p className='text-[9px] text-slate-500'>Edges</p>
                                  <p className='text-xs font-bold text-purple-400'>
                                    {((Number(localCard.edge_top_score || 0) + Number(localCard.edge_bottom_score || 0) + Number(localCard.edge_left_score || 0) + Number(localCard.edge_right_score || 0)) / 4).toFixed(1)}
                                  </p>
                                </div>
                              )}
                              {localCard.surface_score && (
                                <div className='bg-slate-900/50 rounded p-1'>
                                  <p className='text-[9px] text-slate-500'>Surface</p>
                                  <p className='text-xs font-bold text-cyan-400'>{localCard.surface_score}</p>
                                </div>
                              )}
                              {localCard.centering_lr && (
                                <div className='bg-slate-900/50 rounded p-1'>
                                  <p className='text-[9px] text-slate-500'>Center</p>
                                  <p className='text-xs font-bold text-pink-400'>{localCard.centering_lr}/{100-localCard.centering_lr}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Expandable Detailed Breakdown */}
                            <details className='group'>
                              <summary className='cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 select-none'>
                                <span className='group-open:rotate-90 transition-transform'>▶</span>
                                View Detailed Breakdown
                              </summary>
                              
                              <div className='mt-2 space-y-2 pt-2 border-t border-slate-700/50'>
                                {/* CORNERS DETAIL */}
                                {localCard.corner_tl_score && (
                                  <div className='bg-amber-500/10 border border-amber-500/30 rounded-lg p-2'>
                                    <div className='flex items-center justify-between mb-1'>
                                      <span className='text-[10px] font-bold text-amber-400'>📐 Corners</span>
                                      <span className='text-xs font-black text-amber-400'>
                                        {((Number(localCard.corner_tl_score || 0) + Number(localCard.corner_tr_score || 0) + Number(localCard.corner_bl_score || 0) + Number(localCard.corner_br_score || 0)) / 4).toFixed(1)}
                                      </span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-1 text-[9px]'>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Top Left</span>
                                        <span className={`font-bold ${Number(localCard.corner_tl_score) >= 9 ? 'text-emerald-400' : Number(localCard.corner_tl_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.corner_tl_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Top Right</span>
                                        <span className={`font-bold ${Number(localCard.corner_tr_score) >= 9 ? 'text-emerald-400' : Number(localCard.corner_tr_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.corner_tr_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Bottom Left</span>
                                        <span className={`font-bold ${Number(localCard.corner_bl_score) >= 9 ? 'text-emerald-400' : Number(localCard.corner_bl_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.corner_bl_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Bottom Right</span>
                                        <span className={`font-bold ${Number(localCard.corner_br_score) >= 9 ? 'text-emerald-400' : Number(localCard.corner_br_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.corner_br_score}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Weakest corner indicator */}
                                    {(() => {
                                      const corners = [
                                        { name: 'TL', score: Number(localCard.corner_tl_score) },
                                        { name: 'TR', score: Number(localCard.corner_tr_score) },
                                        { name: 'BL', score: Number(localCard.corner_bl_score) },
                                        { name: 'BR', score: Number(localCard.corner_br_score) }
                                      ];
                                      const weakest = corners.reduce((min, c) => c.score < min.score ? c : min);
                                      if (weakest.score < 9) {
                                        return (
                                          <p className='text-[9px] text-orange-400 mt-1'>
                                            ⚠️ Weakest: {weakest.name === 'TL' ? 'Top Left' : weakest.name === 'TR' ? 'Top Right' : weakest.name === 'BL' ? 'Bottom Left' : 'Bottom Right'} ({weakest.score})
                                          </p>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}
                                
                                {/* EDGES DETAIL */}
                                {localCard.edge_top_score && (
                                  <div className='bg-purple-500/10 border border-purple-500/30 rounded-lg p-2'>
                                    <div className='flex items-center justify-between mb-1'>
                                      <span className='text-[10px] font-bold text-purple-400'>📏 Edges</span>
                                      <span className='text-xs font-black text-purple-400'>
                                        {((Number(localCard.edge_top_score || 0) + Number(localCard.edge_bottom_score || 0) + Number(localCard.edge_left_score || 0) + Number(localCard.edge_right_score || 0)) / 4).toFixed(1)}
                                      </span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-1 text-[9px]'>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Top</span>
                                        <span className={`font-bold ${Number(localCard.edge_top_score) >= 9 ? 'text-emerald-400' : Number(localCard.edge_top_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.edge_top_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Bottom</span>
                                        <span className={`font-bold ${Number(localCard.edge_bottom_score) >= 9 ? 'text-emerald-400' : Number(localCard.edge_bottom_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.edge_bottom_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Left</span>
                                        <span className={`font-bold ${Number(localCard.edge_left_score) >= 9 ? 'text-emerald-400' : Number(localCard.edge_left_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.edge_left_score}
                                        </span>
                                      </div>
                                      <div className='flex justify-between bg-slate-900/50 rounded px-1.5 py-0.5'>
                                        <span className='text-slate-500'>Right</span>
                                        <span className={`font-bold ${Number(localCard.edge_right_score) >= 9 ? 'text-emerald-400' : Number(localCard.edge_right_score) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                          {localCard.edge_right_score}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Weakest edge indicator */}
                                    {(() => {
                                      const edges = [
                                        { name: 'Top', score: Number(localCard.edge_top_score) },
                                        { name: 'Bottom', score: Number(localCard.edge_bottom_score) },
                                        { name: 'Left', score: Number(localCard.edge_left_score) },
                                        { name: 'Right', score: Number(localCard.edge_right_score) }
                                      ];
                                      const weakest = edges.reduce((min, e) => e.score < min.score ? e : min);
                                      if (weakest.score < 9) {
                                        return (
                                          <p className='text-[9px] text-orange-400 mt-1'>
                                            ⚠️ Weakest: {weakest.name} edge ({weakest.score})
                                          </p>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}
                                
                                {/* SURFACE DETAIL */}
                                {localCard.surface_score && (
                                  <div className='bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2'>
                                    <div className='flex items-center justify-between mb-1'>
                                      <span className='text-[10px] font-bold text-cyan-400'>✨ Surface</span>
                                      <span className={`text-xs font-black ${
                                        Number(localCard.surface_score) >= 9.5 ? 'text-emerald-400' :
                                        Number(localCard.surface_score) >= 9 ? 'text-green-400' :
                                        Number(localCard.surface_score) >= 8 ? 'text-yellow-400' :
                                        'text-orange-400'
                                      }`}>{localCard.surface_score}</span>
                                    </div>
                                    {localCard.surface_issues_json && (
                                      <div className='text-[9px]'>
                                        {(() => {
                                          try {
                                            const issues = JSON.parse(localCard.surface_issues_json);
                                            const high = issues.filter(i => i.severity === 'high').length;
                                            const med = issues.filter(i => i.severity === 'medium').length;
                                            const low = issues.filter(i => i.severity === 'low').length;
                                            return (
                                              <div className='space-y-1'>
                                                <div className='flex gap-2'>
                                                  {high > 0 && <span className='text-red-400'>🔴 {high} critical</span>}
                                                  {med > 0 && <span className='text-yellow-400'>🟡 {med} moderate</span>}
                                                  {low > 0 && <span className='text-blue-400'>🔵 {low} minor</span>}
                                                </div>
                                                {issues.length > 0 && (
                                                  <p className='text-slate-500'>
                                                    Types: {[...new Set(issues.map(i => i.type))].slice(0, 3).join(', ')}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          } catch (e) {
                                            return null;
                                          }
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* CENTERING DETAIL */}
                                {localCard.centering_lr && (
                                  <div className='bg-pink-500/10 border border-pink-500/30 rounded-lg p-2'>
                                    <div className='flex items-center justify-between mb-1'>
                                      <span className='text-[10px] font-bold text-pink-400'>🎯 Centering</span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2 text-[9px]'>
                                      <div className='bg-slate-900/50 rounded p-1.5'>
                                        <p className='text-slate-500 mb-0.5'>Left / Right</p>
                                        <p className={`font-bold text-sm ${
                                          Math.abs(localCard.centering_lr - 50) <= 5 ? 'text-emerald-400' :
                                          Math.abs(localCard.centering_lr - 50) <= 10 ? 'text-yellow-400' :
                                          'text-orange-400'
                                        }`}>
                                          {localCard.centering_lr} / {100 - localCard.centering_lr}
                                        </p>
                                      </div>
                                      <div className='bg-slate-900/50 rounded p-1.5'>
                                        <p className='text-slate-500 mb-0.5'>Top / Bottom</p>
                                        <p className={`font-bold text-sm ${
                                          Math.abs((localCard.centering_tb || 50) - 50) <= 5 ? 'text-emerald-400' :
                                          Math.abs((localCard.centering_tb || 50) - 50) <= 10 ? 'text-yellow-400' :
                                          'text-orange-400'
                                        }`}>
                                          {localCard.centering_tb || 50} / {100 - (localCard.centering_tb || 50)}
                                        </p>
                                      </div>
                                    </div>
                                    {/* Centering grade estimate */}
                                    {(() => {
                                      const lrDiff = Math.abs(localCard.centering_lr - 50);
                                      const tbDiff = Math.abs((localCard.centering_tb || 50) - 50);
                                      const maxDiff = Math.max(lrDiff, tbDiff);
                                      let gradeImpact = '';
                                      if (maxDiff <= 5) gradeImpact = '✅ PSA 10 eligible';
                                      else if (maxDiff <= 10) gradeImpact = '⚠️ May affect 10 potential';
                                      else if (maxDiff <= 15) gradeImpact = '🟡 Likely 9 or below';
                                      else gradeImpact = '🔴 Significant off-center';
                                      return <p className='text-[9px] mt-1'>{gradeImpact}</p>;
                                    })()}
                                  </div>
                                )}
                              </div>
                            </details>
                            
                            {/* Inspection Thumbnail with Issue Markers */}
                            {localCard.surface_issues_json && (
                              <div className='mt-3 flex gap-3 pt-2 border-t border-slate-700/50'>
                                <div 
                                  className='relative w-16 h-22 bg-slate-900 rounded-lg overflow-hidden cursor-pointer border border-slate-600 hover:border-indigo-500 transition-all flex-shrink-0'
                                  onClick={() => navigate(`/grading-lab?cardId=${card.id}`)}
                                  title='Click to open GradingLab'
                                >
                                  <img 
                                    src={localCard.front_image_url} 
                                    alt='Inspection' 
                                    className='w-full h-full object-cover opacity-80'
                                  />
                                  {/* Issue Markers Overlay */}
                                  {(() => {
                                    try {
                                      const issues = JSON.parse(localCard.surface_issues_json);
                                      return issues.slice(0, 8).map((issue, idx) => (
                                        <div
                                          key={idx}
                                          className={`absolute w-1.5 h-1.5 rounded-full ${
                                            issue.severity === 'high' ? 'bg-red-500' :
                                            issue.severity === 'medium' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                          }`}
                                          style={{
                                            left: `${issue.x}%`,
                                            top: `${issue.y}%`,
                                            transform: 'translate(-50%, -50%)'
                                          }}
                                        />
                                      ));
                                    } catch (e) {
                                      return null;
                                    }
                                  })()}
                                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-0.5'>
                                    <p className='text-[7px] text-center text-slate-300'>🔬 Lab</p>
                                  </div>
                                </div>
                                <div className='flex-1 text-[10px]'>
                                  <p className='text-slate-300 font-medium mb-1'>Surface Issues</p>
                                  {(() => {
                                    try {
                                      const issues = JSON.parse(localCard.surface_issues_json);
                                      const high = issues.filter(i => i.severity === 'high').length;
                                      const med = issues.filter(i => i.severity === 'medium').length;
                                      const low = issues.filter(i => i.severity === 'low').length;
                                      return (
                                        <div className='space-y-0.5'>
                                          <p className='text-slate-400'>{issues.length} total detected</p>
                                          <div className='flex gap-1.5 flex-wrap'>
                                            {high > 0 && <span className='px-1 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px]'>{high} high</span>}
                                            {med > 0 && <span className='px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px]'>{med} med</span>}
                                            {low > 0 && <span className='px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px]'>{low} low</span>}
                                          </div>
                                        </div>
                                      );
                                    } catch (e) {
                                      return <p className='text-slate-500'>Issues detected</p>;
                                    }
                                  })()}
                                  {localCard.grading_inspection_date && (
                                    <p className='text-[9px] text-slate-500 mt-1'>
                                      {new Date(localCard.grading_inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Inspection Date (if no issues but has date) */}
                            {!localCard.surface_issues_json && localCard.grading_inspection_date && (
                              <p className='text-[10px] text-slate-500 mt-2 text-center border-t border-slate-700/50 pt-2'>
                                Inspected: {new Date(localCard.grading_inspection_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* USER'S PREDICTED GRADE */}
                        <div className='bg-slate-900/50 rounded-lg p-3'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-xs text-slate-400'>🎯 My Prediction</span>
                            <button
                              onClick={async () => {
                                const grade = prompt('What grade do you think this card will get? (1-10)', localCard.user_predicted_grade || '');
                                if (grade !== null) {
                                  const numGrade = parseFloat(grade);
                                  if (!isNaN(numGrade) && numGrade >= 1 && numGrade <= 10) {
                                    try {
                                      const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ user_predicted_grade: numGrade })
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        setLocalCard(prev => ({ ...prev, user_predicted_grade: numGrade }));
                                        if (typeof onUpdate === 'function') await onUpdate();
                                      }
                                    } catch (err) {
                                      alert('Failed to save prediction');
                                    }
                                  } else if (grade !== '') {
                                    alert('Please enter a grade between 1 and 10');
                                  }
                                }
                              }}
                              className='text-xs text-indigo-400 hover:text-indigo-300'
                            >
                              {localCard.user_predicted_grade ? 'Edit' : '+ Add'}
                            </button>
                          </div>
                          {localCard.user_predicted_grade ? (
                            <p className={`text-xl font-black ${
                              localCard.user_predicted_grade >= 9.5 ? 'text-emerald-400' :
                              localCard.user_predicted_grade >= 9 ? 'text-green-400' :
                              localCard.user_predicted_grade >= 8 ? 'text-yellow-400' :
                              'text-orange-400'
                            }`}>
                              {localCard.user_predicted_grade}
                              {localCard.estimated_grade && (
                                <span className='text-xs text-slate-500 ml-2'>
                                  ({localCard.user_predicted_grade > localCard.estimated_grade ? '+' : ''}{(localCard.user_predicted_grade - localCard.estimated_grade).toFixed(1)} vs AI)
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className='text-xs text-slate-500'>Tap to add your grade prediction</p>
                          )}
                        </div>
                        
                        {/* Current Status Details */}
                        <div className='bg-slate-900/50 rounded-lg p-3'>
                          {localCard.target_grading_company && (
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-xs text-slate-400'>Target</span>
                              <span className='text-xs font-bold text-purple-400'>{localCard.target_grading_company}</span>
                            </div>
                          )}
                          
                          {/* Notes Section */}
                        {localCard.grading_review_notes && (
                          <div className='mt-2 pt-2 border-t border-slate-700'>
                            <p className='text-xs text-slate-400 mb-1'>Notes:</p>
                            <p className='text-xs text-slate-300 whitespace-pre-wrap'>{localCard.grading_review_notes}</p>
                          </div>
                        )}
                        </div>
                        
                        {/* Quick Actions - Dynamic based on status */}
                        <div className='grid grid-cols-2 gap-2'>
                          {/* PENDING REVIEW: Show Send to Grade / Keep Raw */}
                          {(localCard.grading_review_status === 'pending_review' || localCard.grading_review_status === 'reviewed') && (
                            <>
                              <button
                                onClick={async () => {
                                  const company = prompt('Which grading company? (PSA, BGS, SGC, CGC)', localCard.target_grading_company || 'PSA');
                                  if (company) {
                                    try {
                                      const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          grading_review_status: 'sending',
                                          grading_decision: 'send',
                                          target_grading_company: company
                                        })
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        setLocalCard(prev => ({ ...prev, ...data.card }));
                                        if (typeof onUpdate === 'function') await onUpdate();
                                        alert(`✅ Marked for grading with ${company}!`);
                                      }
                                    } catch (err) {
                                      alert('Failed to update');
                                    }
                                  }
                                }}
                                className='py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs font-bold text-green-400 transition-all'
                              >
                                📦 Send to Grade
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        grading_review_status: 'keeping_raw',
                                        grading_decision: 'keep_raw'
                                      })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      setLocalCard(prev => ({ ...prev, ...data.card }));
                                      if (typeof onUpdate === 'function') await onUpdate();
                                      alert('📋 Marked as keeping raw');
                                    }
                                  } catch (err) {
                                    alert('Failed to update');
                                  }
                                }}
                                className='py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 rounded-lg text-xs font-bold text-gray-400 transition-all'
                              >
                                📋 Keep Raw
                              </button>
                            </>
                          )}

                          {/* SENDING: Show Mark as Submitted */}
                          {localCard.grading_review_status === 'sending' && (
                            <button
                              onClick={async () => {
                                const confirmSubmit = confirm(`Mark as submitted to ${localCard.target_grading_company || 'grading company'}?`);
                                if (confirmSubmit) {
                                  try {
                                    const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        grading_review_status: 'submitted'
                                      })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      setLocalCard(prev => ({ ...prev, ...data.card }));
                                      if (typeof onUpdate === 'function') await onUpdate();
                                      alert(`📬 Card marked as submitted to ${localCard.target_grading_company || 'grading'}!`);
                                    }
                                  } catch (err) {
                                    alert('Failed to update');
                                  }
                                }
                              }}
                              className='col-span-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-xs font-bold text-purple-400 transition-all'
                            >
                              📬 Mark as Submitted
                            </button>
                          )}

                          {/* SUBMITTED: Show Mark as Returned */}
                          {localCard.grading_review_status === 'submitted' && (
                            <button
                              onClick={async () => {
                                const confirmReturn = confirm('Card returned from grading? This will let you update the grade.');
                                if (confirmReturn) {
                                  try {
                                    const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        grading_review_status: 'returned'
                                      })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      setLocalCard(prev => ({ ...prev, ...data.card }));
                                      if (typeof onUpdate === 'function') await onUpdate();
                                      alert('🎉 Card returned! Click "Update as Graded" to add the grade.');
                                    }
                                  } catch (err) {
                                    alert('Failed to update');
                                  }
                                }
                              }}
                              className='col-span-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-400 transition-all'
                            >
                              🎉 Mark as Returned
                            </button>
                          )}

                          {/* RETURNED: Show Update as Graded */}
                          {localCard.grading_review_status === 'returned' && (
                            <button
                              onClick={() => {
                                setShowEditModal(true);
                                // Could pre-fill grading company if we have target_grading_company
                              }}
                              className='col-span-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-lg text-sm font-bold text-white transition-all shadow-lg'
                            >
                              ✅ Update as Graded
                            </button>
                          )}

                          {/* KEEPING RAW: Show option to reconsider */}
                          {localCard.grading_review_status === 'keeping_raw' && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      grading_review_status: 'pending_review',
                                      grading_decision: null
                                    })
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    setLocalCard(prev => ({ ...prev, ...data.card }));
                                    if (typeof onUpdate === 'function') await onUpdate();
                                    alert('🔍 Moved back to review');
                                  }
                                } catch (err) {
                                  alert('Failed to update');
                                }
                              }}
                              className='col-span-2 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-xs font-bold text-yellow-400 transition-all'
                            >
                              🔄 Reconsider for Grading
                            </button>
                          )}
                        </div>
                        
                        {/* 🔬 START GRADING INSPECTION BUTTON - Coming Soon */}
                        <button
                          onClick={(e) => {
                            if (e.shiftKey) {
                              const password = prompt('Enter admin password:');
                              if (password === 'abc123') {
                                navigate(`/grading-assistant/${card.id}`);
                              } else if (password !== null) {
                                alert('❌ Invalid password');
                              }
                            }
                          }}
                          className='w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg text-sm font-bold text-slate-400 transition-all shadow-lg mb-2 cursor-default'
                        >
                          🔬 Grading Inspection
                          <span className='ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full'>Coming Soon</span>
                        </button>
                        <p className='text-[10px] text-slate-500 text-center mb-2'>
                          AI-powered card inspection tool launching soon!
                        </p>
                        
                        {/* Add/Edit Notes */}
                        <button
                          onClick={async () => {
                            const notes = prompt('Add review notes (centering, surface, corners, etc.):', localCard.grading_review_notes || '');
                            if (notes !== null) {
                              try {
                                const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ grading_review_notes: notes })
                                });
                                const data = await response.json();
                                if (data.success) {
                                  setLocalCard(prev => ({ ...prev, ...data.card }));
                                  if (typeof onUpdate === 'function') await onUpdate();
                                }
                              } catch (err) {
                                alert('Failed to save notes');
                              }
                            }
                          }}
                          className='w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-400 transition-all'
                        >
                          ✏️ {localCard.grading_review_notes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                        
                        {/* Remove from Review */}
                        <button
                          onClick={async () => {
                            if (confirm('Remove from grading review?')) {
                              try {
                                const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                                  method: 'DELETE'
                                });
                                const data = await response.json();
                                if (data.success) {
                                  setLocalCard(prev => ({ 
                                    ...prev, 
                                    grading_review_status: null,
                                    grading_review_notes: null,
                                    target_grading_company: null,
                                    grading_decision: null
                                  }));
                                  if (typeof onUpdate === 'function') await onUpdate();
                                  alert('Removed from grading review');
                                }
                              } catch (err) {
                                alert('Failed to remove');
                              }
                            }
                          }}
                          className='w-full py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-all'
                        >
                          🗑️ Remove from Review
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const response = await apiFetch(`/cards/${card.id}/grading-review`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ grading_review_status: 'pending_review' })
                            });
                            const data = await response.json();
                            if (data.success) {
                              setLocalCard(prev => ({ ...prev, ...data.card }));
                              if (typeof onUpdate === 'function') await onUpdate();
                              alert('🔍 Card flagged for grading review!');
                            } else {
                              alert('Failed: ' + (data.error || 'Unknown error'));
                            }
                          } catch (err) {
                            console.error('Flag error:', err);
                            alert('Failed to flag card');
                          }
                        }}
                        className='w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border-2 border-dashed border-amber-500/50 rounded-lg transition-all'
                      >
                        <p className='text-sm font-bold text-amber-400'>🔍 Flag for Grading Review</p>
                        <p className='text-xs text-amber-300/70 mt-1'>Add to your review queue</p>
                      </button>
                    )}
                    </div>
                  </details>
                )}
              </div>

              {/* MIDDLE: Card Info + Pricing */}
              <div className='space-y-3'>
                {/* SAFETY: Ensure modal always shows even without pricing */}
                {(() => {
                  // If card has no pricing at all, the modal should still work
                  const hasAnyPrice = localCard.ebay_low || localCard.ebay_avg || localCard.ebay_high;
                  if (!hasAnyPrice) {
                    console.log('⚠️ Card has no pricing data - modal will show "Add Price" section');
                  }
                  return null;
                })()}
                {/* Card Info */}
                <div className='bg-slate-800/50 rounded-xl p-3 border border-slate-700/50'>
                  <h2 className='text-2xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>
                    {card.player}
                  </h2>
                  <p className='text-sm text-slate-400 mb-3'>{card.year} {setName}</p>

                  <div className='grid grid-cols-2 gap-2 text-xs'>
                    <div className='bg-slate-900/50 p-2 rounded'>
                      <p className='text-slate-500 mb-0.5'>Card #</p>
                      <p className='font-bold text-indigo-400'>#{card.card_number}</p>
                    </div>
                    <div className='bg-slate-900/50 p-2 rounded'>
                      <p className='text-slate-500 mb-0.5'>Team</p>
                      <p className='font-bold text-purple-400'>{card.team}</p>
                    </div>
                    {card.parallel !== 'Base' && (
  <div className='bg-slate-900/50 p-2 rounded col-span-2'>
    <p className='text-slate-500 mb-0.5'>Parallel</p>
    <p className='font-bold text-cyan-400'>{localCard.parallel}</p>
  </div>
)}
                    
                    {card.is_graded && card.grading_company && (
                      <div className='bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 rounded col-span-2 border border-purple-500/50'>
                        <p className='text-purple-300 text-xs font-bold mb-0.5'>Graded</p>
                        <p className='font-black text-purple-400'>{card.grading_company} {card.grade}</p>
                        {card.cert_number && <p className='text-xs text-slate-400 mt-1'>Cert: {card.cert_number}</p>}
                      </div>
                    )}
                    
                    {card.numbered === 'true' && card.serial_number && (
                      <div className='bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-2 rounded col-span-2 border border-yellow-500/50'>
                        <p className='text-yellow-300 text-xs font-bold mb-0.5'>Numbered</p>
                        <p className='font-black text-yellow-400'>#{card.serial_number}{card.numbered_to ? ` / ${card.numbered_to}` : ''}</p>
                      </div>
                    )}
                    
                    {card.is_autographed && (
                      <div className='bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-2 rounded col-span-2 border border-emerald-500/50'>
                        <p className='text-emerald-300 text-xs font-bold'>✍️ Autographed</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* EXISTING PRICE DISPLAY */}
                {(localCard.ebay_low || localCard.ebay_avg || localCard.sportscardspro_psa10 || localCard.sportscardspro_raw) ? (
                  <div className='bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3'>
                    {/* AUTO-PRICING BADGE */}
                    {!localCard.is_graded && (
                      <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3'>
                        <p className='text-yellow-400 text-xs font-bold mb-1'>⚠️ RAW CARD ESTIMATE</p>
                        <p className='text-yellow-300 text-[10px] leading-relaxed'>
                          Pricing is estimated from similar raw cards. Actual value depends on condition. Consider grading for accurate valuation.
                        </p>
                      </div>
                    )}
                    
                    <div className='flex items-center gap-2 mb-2'>
                      <DollarSign className='text-emerald-400' size={16} />
                      <h3 className='font-bold text-sm text-emerald-400'>
                        🎯 Lowest BIN Price
                      </h3>
                    </div>
                    
                    {editingPrice ? (
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-2xl font-black text-emerald-400'>$</span>
                        <input
                          type='number'
                          step='0.01'
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSavePrice(parseFloat(tempPrice));
                            } else if (e.key === 'Escape') {
                              setEditingPrice(false);
                              setTempPrice('');
                            }
                          }}
                          autoFocus
                          className='flex-1 text-2xl font-black text-emerald-400 bg-slate-900/50 border-2 border-emerald-500 rounded-lg px-2 py-1 focus:outline-none'
                        />
                      </div>
                    ) : (
                      <div 
                        className='cursor-pointer hover:bg-slate-900/30 rounded-lg p-2 transition-all mb-2'
                        onClick={() => {
                          setEditingPrice(true);
                          setTempPrice(parseFloat(localCard.ebay_low || 0).toString());
                        }}
                      >
                        <p className='text-3xl font-black text-emerald-400'>${parseFloat(localCard.ebay_low || 0).toFixed(2)}</p>
                      </div>
                    )}
                    
                    <div className='flex justify-between text-xs bg-slate-900/50 rounded-lg p-2 mb-2'>
                      <div><p className='text-slate-500'>Avg</p><p className='font-bold text-purple-400'>${parseFloat(localCard.ebay_avg || 0).toFixed(2)}</p></div>
                      <div><p className='text-slate-500'>High</p><p className='font-bold text-orange-400'>${parseFloat(localCard.ebay_high || 0).toFixed(2)}</p></div>
                      <div><p className='text-slate-500'>Sales</p><p className='font-bold text-cyan-400'>{localCard.ebay_sample_size || 0}</p></div>
                    </div>
                    
                    <div className={`grid gap-2 mb-3 ${card.sport === 'Pokemon' ? 'grid-cols-1' : 'grid-cols-2'}`}>
  <Button 
    variant='primary' 
    size='sm' 
    onClick={handleViewMarketComps} 
    disabled={pricing}
    className='text-xs'
  >
    {pricing ? '...' : '🎯 eBay'}
  </Button>
  
  {/* ONLY SHOW SOLD COMPS FOR SPORTS CARDS */}
  {card.sport !== 'Pokemon' && (
    <Button 
      variant='secondary' 
      size='sm' 
      onClick={fetchSportsCardsProData}
      className='text-xs'
      disabled={pricing}
    >
      {pricing ? '⏳' : `💎 Sold ${sportsCardsProData ? '' : '🚧'}`}
    </Button>
  )}
</div>
                    
                  
{card.sport !== 'Pokemon' && (() => {
  // 🎯 Smart grade detection - show price for card's actual grade
  let matchingPrice = null;
  let gradeLabel = '';
  
  if (sportsCardsProData) {
    if (localCard.is_graded && localCard.grading_company && localCard.grade) {
      const company = localCard.grading_company.toLowerCase();
      const grade = parseFloat(localCard.grade);
      
      // PSA grades
      if (company.includes('psa')) {
        if (grade === 10 && sportsCardsProData.psa10) {
          matchingPrice = parseFloat(sportsCardsProData.psa10);
          gradeLabel = 'PSA 10';
        } else if (grade === 9 && sportsCardsProData.psa9) {
          matchingPrice = parseFloat(sportsCardsProData.psa9);
          gradeLabel = 'PSA 9';
        } else if (grade === 8 && sportsCardsProData.psa8) {
          matchingPrice = parseFloat(sportsCardsProData.psa8);
          gradeLabel = 'PSA 8';
        } else if (grade === 7 && sportsCardsProData.psa7) {
          matchingPrice = parseFloat(sportsCardsProData.psa7);
          gradeLabel = 'PSA 7';
        }
      }
      // BGS grades
      else if (company.includes('bgs') && grade >= 9.5 && sportsCardsProData.bgs10) {
        matchingPrice = parseFloat(sportsCardsProData.bgs10);
        gradeLabel = 'BGS 10';
      }
      // CGC grades
      else if (company.includes('cgc') && grade >= 9.5 && sportsCardsProData.cgc10) {
        matchingPrice = parseFloat(sportsCardsProData.cgc10);
        gradeLabel = 'CGC 10';
      }
      // SGC grades
      else if (company.includes('sgc') && grade >= 9.5 && sportsCardsProData.sgc10) {
        matchingPrice = parseFloat(sportsCardsProData.sgc10);
        gradeLabel = 'SGC 10';
      }
    }
    // Raw card - show raw price
    else if (!localCard.is_graded && sportsCardsProData.raw) {
      matchingPrice = parseFloat(sportsCardsProData.raw);
      gradeLabel = 'Raw';
    }
    
    // 🛡️ SMARTER FALLBACK: Only use PSA 10 if card IS graded but we don't have exact grade data
    if (!matchingPrice && localCard.is_graded && sportsCardsProData.psa10) {
      matchingPrice = parseFloat(sportsCardsProData.psa10);
      gradeLabel = 'PSA 10 (estimated)';
    }
    // 🛡️ If raw card and no raw data, try PSA 10 as last resort
    else if (!matchingPrice && !localCard.is_graded && sportsCardsProData.psa10) {
      matchingPrice = parseFloat(sportsCardsProData.psa10);
      gradeLabel = 'PSA 10 (graded estimate)';
    }
  }
  
  // Only show if we have a valid price
  if (!matchingPrice || isNaN(matchingPrice) || matchingPrice <= 0) {
    return null;
  }
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 rounded-xl p-3 mb-3 shadow-lg transition-all ${
      isMobile ? '' : 'hover:shadow-blue-500/20'
    }`}>
      {!isMobile && (
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5'></div>
      )}
      <div className='relative'>
        <div className='flex items-center gap-2 mb-2'>
          <h3 className='font-bold text-sm text-blue-400 flex items-center gap-1'>
            💎 Recent Sold
          </h3>
        </div>
        <p className='text-3xl font-black text-blue-400 mb-1'>
          ${matchingPrice.toFixed(2)}
        </p>
        <p className='text-xs text-blue-300/70'>
          {gradeLabel} - SportsCardsPro
        </p>
      </div>
    </div>
  );
})()}

{/* PSA POPULATION REPORT */}
{localCard.psa_auction_data && (
  <div className='relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-3 mb-3 shadow-lg transition-all'>
    <div className='relative'>
      <div className='flex items-center gap-2 mb-2'>
        <h3 className='font-bold text-sm text-purple-400 flex items-center gap-1'>
          📊 PSA Population Report
        </h3>
      </div>
      
      <div className='grid grid-cols-2 gap-2 mb-2'>
        <div className='bg-slate-900/50 rounded-lg p-2'>
          <p className='text-xs text-slate-400 mb-1'>Total Pop</p>
          <p className='text-lg font-bold text-purple-400'>
            {localCard.psa_auction_data.totalPopulation || 0}
          </p>
        </div>
        <div className='bg-slate-900/50 rounded-lg p-2'>
          <p className='text-xs text-slate-400 mb-1'>Higher Grades</p>
          <p className='text-lg font-bold text-orange-400'>
            {localCard.psa_auction_data.populationHigher || 0}
          </p>
        </div>
      </div>
      
      {/* Rarity Badge */}
{(() => {
  const total = localCard.psa_auction_data.totalPopulation || 0;
  let rarity = 'Common';
  let bgColor = 'bg-slate-500/10';
  let borderColor = 'border-slate-500/30';
  let textColor = 'text-slate-400';
  
  if (total < 10) { 
    rarity = 'Ultra Rare'; 
    bgColor = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
    textColor = 'text-red-400';
  } else if (total < 50) { 
    rarity = 'Very Rare'; 
    bgColor = 'bg-purple-500/10';
    borderColor = 'border-purple-500/30';
    textColor = 'text-purple-400';
  } else if (total < 100) { 
    rarity = 'Rare'; 
    bgColor = 'bg-pink-500/10';
    borderColor = 'border-pink-500/30';
    textColor = 'text-pink-400';
  } else if (total < 500) { 
    rarity = 'Uncommon'; 
    bgColor = 'bg-cyan-500/10';
    borderColor = 'border-cyan-500/30';
    textColor = 'text-cyan-400';
  }
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-2 text-center`}>
      <p className={`text-xs font-bold ${textColor}`}>
        🏆 {rarity}
      </p>
      {localCard.psa_auction_data.populationHigher === 0 && (
        <p className='text-xs text-yellow-400 mt-1'>
          ⭐ Highest Grade Population!
        </p>
      )}
    </div>
  );
})()}
      
      <p className='text-xs text-purple-300/70 mt-2'>
        Grade: {localCard.psa_auction_data.grade} - Cert: {localCard.psa_auction_data.certNumber}
      </p>
    </div>
  </div>
)}

                    
                    {/* MY ASKING PRICE SECTION */}
                    <div className='pt-3 border-t border-emerald-500/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <label className='text-xs font-bold text-slate-400'>💰 My Asking Price</label>
                        {localCard.asking_price && (
                          <button
                            onClick={() => {
                              if (confirm('Clear your asking price?')) {
                                handleSaveAskingPrice(null);
                              }
                            }}
                            className='text-xs text-red-400 hover:text-red-300'
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {localCard.asking_price ? (
                        <div 
                          className='bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-900/70 transition-all'
                          onClick={() => {
                            const newPrice = prompt('Enter your asking price:', localCard.asking_price);
                            if (newPrice !== null) {
                              handleSaveAskingPrice(parseFloat(newPrice) || null);
                            }
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-2xl font-black text-yellow-400'>
                              ${parseFloat(localCard.asking_price).toFixed(2)}
                            </span>
                            <span className='text-xs text-slate-500'>Click to edit</span>
                          </div>
                          
                          {/* Show comparison to market */}
                          {localCard.ebay_low && (
                            <div className='mt-2 pt-2 border-t border-slate-700/50'>
                              {(() => {
                                const diff = parseFloat(localCard.asking_price) - parseFloat(localCard.ebay_low);
                                const diffPercent = (diff / parseFloat(localCard.ebay_low)) * 100;
                                
                                return diff > 0 ? (
                                  <p className='text-xs text-orange-400'>
                                    +${diff.toFixed(2)} above market ({diffPercent.toFixed(0)}%)
                                  </p>
                                ) : diff < 0 ? (
                                  <p className='text-xs text-emerald-400'>
                                    ${Math.abs(diff).toFixed(2)} below market ({Math.abs(diffPercent).toFixed(0)}%)
                                  </p>
                                ) : (
                                  <p className='text-xs text-cyan-400'>At market price</p>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const newPrice = prompt('What price do you want to sell for?', localCard.ebay_low || '');
                            if (newPrice !== null && newPrice !== '') {
                              handleSaveAskingPrice(parseFloat(newPrice));
                            }
                          }}
                          className='w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 transition-all text-left'
                        >
                          <p className='text-xs text-yellow-400 font-bold'>+ Set Your Asking Price</p>
                          <p className='text-xs text-slate-500 mt-1'>What do YOU want to sell for?</p>
                        </button>
                      )}
                      
                      <p className='text-[9px] text-slate-500 mt-2'>
                        💡 This is YOUR target price - different from current market
                      </p>
                    </div>
                  </div>
                ) : (
                  // NO PRICE - ADD PRICE
                  <div className='bg-slate-800/30 border border-indigo-500/30 rounded-xl p-3 text-center'>
                    <DollarSign size={32} className='mx-auto text-indigo-400 mb-2' />
                    <h3 className='font-bold text-sm text-indigo-400 mb-2'>Add Market Price</h3>
                    
                    {editingPrice ? (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-2xl font-black text-emerald-400'>$</span>
                          <input
                            type='number'
                            step='0.01'
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSavePrice(parseFloat(tempPrice));
                              } else if (e.key === 'Escape') {
                                setEditingPrice(false);
                                setTempPrice('');
                              }
                            }}
                            autoFocus
                            placeholder='0.00'
                            className='flex-1 text-xl font-black text-emerald-400 bg-slate-900/50 border-2 border-emerald-500 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <Button 
                            variant='secondary' 
                            size='sm' 
                            className='flex-1'
                            onClick={() => {
                              setEditingPrice(false);
                              setTempPrice('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant='success' 
                            size='sm' 
                            className='flex-1'
                            onClick={() => handleSavePrice(parseFloat(tempPrice))}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant='primary' 
                          size='sm' 
                          className='w-full mb-2' 
                          onClick={handleViewMarketComps} 
                          disabled={pricing}
                        >
                          {pricing ? 'Fetching...' : 'View Market Comps'}
                        </Button>
                        <Button 
                          variant='success' 
                          size='sm' 
                          className='w-full' 
                          onClick={handleStartManualPrice}
                        >
                          Manual Price
                        </Button>
                      </>
                    )}

                    {/* MY ASKING PRICE - SHOW EVEN WITHOUT MARKET PRICE */}
                    <div className='mt-3 pt-3 border-t border-indigo-500/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <label className='text-xs font-bold text-slate-400'>💰 My Asking Price</label>
                        {localCard.asking_price && (
                          <button
                            onClick={() => {
                              if (confirm('Clear your asking price?')) {
                                handleSaveAskingPrice(null);
                              }
                            }}
                            className='text-xs text-red-400 hover:text-red-300'
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {localCard.asking_price ? (
                        <div 
                          className='bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-900/70 transition-all'
                          onClick={() => {
                            const newPrice = prompt('Enter your asking price:', localCard.asking_price);
                            if (newPrice !== null) {
                              handleSaveAskingPrice(parseFloat(newPrice) || null);
                            }
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-2xl font-black text-yellow-400'>
                              ${parseFloat(localCard.asking_price).toFixed(2)}
                            </span>
                            <span className='text-xs text-slate-500'>Click to edit</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const newPrice = prompt('What price do you want to sell for?');
                            if (newPrice !== null && newPrice !== '') {
                              handleSaveAskingPrice(parseFloat(newPrice));
                            }
                          }}
                          className='w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 transition-all text-left'
                        >
                          <p className='text-xs text-yellow-400 font-bold'>+ Set Your Asking Price</p>
                          <p className='text-xs text-slate-500 mt-1'>What do YOU want to sell for?</p>
                        </button>
                      )}
                      
                      <p className='text-[9px] text-slate-500 mt-2'>
                        💡 Set your target price even without market data
                      </p>
                    </div>
                  </div>
                )}

                {/* UNIFIED: Showcase & Sale Settings */}
                <div className='bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-3'>
                  <h3 className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3 flex items-center gap-2'>
                    <Sparkles size={16} />
                    Public Showcase & NFC
                  </h3>
                  
                  {/* PUBLIC/PRIVATE TOGGLE */}
                  <div className='bg-slate-900/50 rounded-lg p-3 mb-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-slate-300 font-semibold'>Make Card Public</span>
                      <button
                        onClick={handleTogglePublic}
                        disabled={togglingPublic}
                        className={`relative inline-block w-12 h-6 transition-colors rounded-full ${
                          localCard.is_public ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          localCard.is_public ? 'translate-x-6' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>
                    <p className='text-xs text-slate-400'>
                      {localCard.is_public ? '⭐ Public - Anyone with link can view' : '🔒 Private - Only you can see this card'}
                    </p>
                    
                    {localCard.is_public && localCard.short_id && (
                      <div className='mt-3 pt-3 border-t border-slate-700'>
                        <p className='text-xs text-slate-400 mb-1'>Public URL:</p>
                        <div className='flex items-center gap-2'>
                          <p className='text-xs text-indigo-400 font-mono flex-1 truncate'>
                            slabtrack.io/card/{localCard.short_id}
                          </p>
                          <button
                            onClick={handleCopyPublicUrl}
                            className='text-xs bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded transition-colors'
                          >
                            {showCopySuccess ? '✅' : '📋'}
                          </button>
                        </div>
                        {localCard.public_views > 0 && (
                          <p className='text-xs text-slate-500 mt-2'>👁️ {localCard.public_views} views</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ONLY SHOW IF PUBLIC */}
                  {(localCard.is_public === true || localCard.is_public === 1) && (
                    <>
                      {/* FOR SALE TOGGLE */}
                      <div className='bg-slate-900/50 rounded-lg p-3 mb-3'>
                        <div className='flex items-center justify-between mb-2'>
                          <div>
                            <span className='text-sm text-slate-300 font-semibold block'>List For Sale</span>
                            <span className='text-xs text-slate-500'>Show price on public page</span>
                          </div>
                          <button
                            onClick={() => setForSaleData({...forSaleData, for_sale: !forSaleData.for_sale})}
                            className={`relative inline-block w-12 h-6 transition-colors rounded-full ${
                              forSaleData.for_sale ? 'bg-green-600' : 'bg-slate-700'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              forSaleData.for_sale ? 'translate-x-6' : 'translate-x-0'
                            }`}></span>
                          </button>
                        </div>
                      </div>

                      {/* FOR SALE DETAILS (only if for_sale is true) */}
                      {forSaleData.for_sale && (
                        <div className='space-y-3 bg-green-500/5 rounded-lg p-3 border border-green-500/20 mb-3'>
                          {/* Asking Price */}
                          <div>
                            <label className='text-xs text-slate-400 mb-1 block font-semibold'>Asking Price</label>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg font-bold text-green-400'>$</span>
                              <input
                                type='number'
                                step='0.01'
                                value={forSaleData.asking_price}
                                onChange={(e) => setForSaleData({...forSaleData, asking_price: e.target.value})}
                                placeholder='0.00'
                                className='flex-1 text-lg font-bold text-green-400 bg-slate-900/50 border border-green-500/50 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400'
                              />
                            </div>
                          </div>

                          {/* Price Type */}
                          <div>
                            <label className='text-xs text-slate-400 mb-1 block font-semibold'>Price Type</label>
                            <select
                              value={forSaleData.price_type}
                              onChange={(e) => setForSaleData({...forSaleData, price_type: e.target.value})}
                              className='w-full bg-slate-900/50 border border-green-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400'
                            >
                              <option value='firm'>Firm Price</option>
                              <option value='obo'>Or Best Offer</option>
                              <option value='trade'>Open to Trades</option>
                            </select>
                          </div>

                          {/* Owner Notes */}
                          <div>
                            <label className='text-xs text-slate-400 mb-1 block font-semibold'>Seller's Note (Public)</label>
                            <textarea
                              value={forSaleData.owner_notes}
                              onChange={(e) => setForSaleData({...forSaleData, owner_notes: e.target.value})}
                              placeholder='Tell buyers about this card...'
                              className='w-full bg-slate-900/50 border border-green-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400 resize-none'
                              rows={2}
                              maxLength={200}
                            />
                            <p className='text-xs text-slate-500 mt-1'>{forSaleData.owner_notes.length}/200</p>
                          </div>

                          {/* Trade Interests */}
                          {forSaleData.price_type === 'trade' && (
                            <div>
                              <label className='text-xs text-slate-400 mb-1 block font-semibold'>Trade Interests</label>
                              <input
                                type='text'
                                value={forSaleData.trade_interests}
                                onChange={(e) => setForSaleData({...forSaleData, trade_interests: e.target.value})}
                                placeholder='Looking for: Mahomes, Burrow...'
                                className='w-full bg-slate-900/50 border border-green-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400'
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* PRIVACY: HIDE OWNER NAME */}
                      <div className='bg-slate-900/50 rounded-lg p-3 mb-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <span className='text-sm text-slate-300 font-semibold block mb-1'>Hide My Username</span>
                            <span className='text-xs text-slate-500'>Don't show "@username" on public page</span>
                          </div>
                          <button
                            onClick={() => setForSaleData({...forSaleData, hide_owner_info: !forSaleData.hide_owner_info})}
                            className={`relative inline-block w-12 h-6 transition-colors rounded-full ${
                              forSaleData.hide_owner_info ? 'bg-orange-600' : 'bg-slate-700'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              forSaleData.hide_owner_info ? 'translate-x-6' : 'translate-x-0'
                            }`}></span>
                          </button>
                        </div>
                      </div>

                      {/* SAVE BUTTON */}
                      <Button
                        variant='success'
                        size='sm'
                        className='w-full mb-3 bg-gradient-to-r from-green-600 to-emerald-600'
                        onClick={handleSaveForSale}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : '💾 Save Showcase Settings'}
                      </Button>

                      {/* NFC + QR CODE SECTION */}
                      {localCard.short_id && (
                        <div className='bg-slate-900/50 rounded-lg p-3'>
                          <p className='text-xs text-purple-400 font-bold mb-3 text-center'>📱 Share This Card</p>
                          
                          {/* Tab Navigation */}
                          <div className='flex gap-1 mb-3'>
                            <button
                              onClick={() => setShareTab('nfc')}
                              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                                shareTab === 'nfc' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              📡 NFC
                            </button>
                            <button
                              onClick={() => setShareTab('qr')}
                              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                                shareTab === 'qr' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              📱 QR Code
                            </button>
                            <button
                              onClick={() => setShareTab('link')}
                              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                                shareTab === 'link' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              🔗 Link
                            </button>
                          </div>

                          {/* NFC Tab */}
                          {shareTab === 'nfc' && (
                            <div className='space-y-2'>
                              {nfcSupported === true ? (
                                <>
                                  <Button
                                    onClick={handleWriteNFC}
                                    variant='primary'
                                    size='sm'
                                    className='w-full bg-gradient-to-r from-purple-600 to-pink-600'
                                    disabled={writingNFC}
                                  >
                                    {writingNFC ? '📡 Hold tag near phone...' : '📡 Write to NFC Tag'}
                                  </Button>
                                  <p className='text-xs text-slate-400 text-center'>
                                    Tap button, then hold NFC sticker to phone
                                  </p>
                                </>
                              ) : nfcSupported === false ? (
                                <div className='bg-orange-500/10 border border-orange-500/30 rounded-lg p-3'>
                                  <p className='text-xs text-orange-400 font-bold mb-2'>
                                    {nfcError || 'NFC not available on this device'}
                                  </p>
                                  {nfcError?.includes('iOS') && (
                                    <>
                                      <p className='text-xs text-slate-400 mb-3'>
                                        iOS Safari doesn't support NFC writing. Use QR code or download our companion app.
                                      </p>
                                      <Button
                                        onClick={() => window.open('https://apps.apple.com/slabtrack-nfc', '_blank')}
                                        variant='secondary'
                                        size='sm'
                                        className='w-full text-xs'
                                      >
                                        Download iOS NFC App
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    onClick={() => setShareTab('qr')}
                                    variant='secondary'
                                    size='sm'
                                    className='w-full text-xs mt-2'
                                  >
                                    Use QR Code Instead
                                  </Button>
                                </div>
                              ) : (
                                <p className='text-xs text-slate-400 text-center'>Checking NFC support...</p>
                              )}
                            </div>
                          )}

                          {/* QR Code Tab */}
                          {shareTab === 'qr' && (
                            <div className='space-y-2'>
                              <div className='flex justify-center'>
                                <div className='bg-white p-3 rounded-lg'>
                                  <QRCodeSVG 
                                    id='showcase-qr-code'
                                    value={`https://slabtrack.io/card/${localCard.short_id}`}
                                    size={120}
                                    level="H"
                                    includeMargin={true}
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={handleDownloadQR}
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                              >
                                💾 Download QR Code
                              </Button>
                              <p className='text-xs text-slate-400 text-center'>
                                Print or display this QR code
                              </p>
                            </div>
                          )}

                          {/* Link Tab */}
                          {shareTab === 'link' && (
                            <div className='space-y-2'>
                              <div className='bg-slate-800 rounded-lg p-2'>
                                <p className='text-xs text-indigo-400 font-mono break-all text-center'>
                                  https://slabtrack.io/card/{localCard.short_id}
                                </p>
                              </div>
                              <Button
                                onClick={handleCopyPublicUrl}
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                              >
                                {showCopySuccess ? '✅ Copied!' : '📋 Copy Link'}
                              </Button>
                              <p className='text-xs text-slate-400 text-center'>
                                Share this link anywhere
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FULL SHOWCASE QR CODE - FOR DISPLAY CASES */}
                      <div className='mt-4 pt-4 border-t border-cyan-500/20'>
                        <p className='text-xs text-cyan-400 font-bold mb-3 text-center flex items-center justify-center gap-2'>
                          ⭐ Full Showcase QR Code
                        </p>
                        <div className='bg-slate-900/50 rounded-lg p-3'>
                          <div className='flex justify-center mb-2'>
                            <div className='bg-white p-3 rounded-lg'>
                              <QRCodeSVG 
                                id='full-showcase-qr-code'
                                value={`https://slabtrack.io/showcase/${user?.full_name || user?.email?.split('@')[0] || 'user'}`}
                                size={120}
                                level="H"
                                includeMargin={true}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              const svg = document.getElementById('full-showcase-qr-code');
                              const svgData = new XMLSerializer().serializeToString(svg);
                              const canvas = document.createElement('canvas');
                              const ctx = canvas.getContext('2d');
                              const img = new Image();
                              
                              img.onload = () => {
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                
                                canvas.toBlob((blob) => {
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `${card.player}_Full_Showcase_QR.png`.replace(/\s+/g, '_');
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                });
                              };
                              
                              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                            }}
                            variant='secondary'
                            size='sm'
                            className='w-full text-xs bg-cyan-600 hover:bg-cyan-500'
                          >
                            💾 Download Full Showcase QR
                          </Button>
                          <p className='text-xs text-slate-400 mt-2 text-center'>
                            📦 Place on display case to show ALL your public cards
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT: Actions & Showcase */} 
              <div className='space-y-3'>
                {/* eBay Listings */}
                <div className='bg-slate-800/30 border border-slate-700/50 rounded-xl p-3'>
                  <h3 className='text-sm font-bold text-slate-300 mb-3 flex items-center gap-2'>
                    <ExternalLink size={16} className='text-indigo-400' />
                    eBay Listings
                  </h3>
                  <div className='space-y-2'>
                    <Button 
                      variant='primary' 
                      size='sm' 
                      className='w-full flex flex-col items-start gap-1 py-2.5 px-3 text-left bg-gradient-to-r from-indigo-600 to-blue-600'
                      onClick={() => {
                        const query = buildEbaySearchQuery(localCard);
                        window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`, '_blank');
                      }}
                    >
                      <span className='font-bold text-sm'>💰 Market Comps</span>
                      <span className='text-xs text-indigo-200'>Open eBay active listings</span>
                    </Button>
                    <Button 
                      variant='secondary' 
                      size='sm' 
                      className='w-full flex flex-col items-start gap-1 py-2.5 px-3 text-left bg-emerald-600/20 hover:bg-emerald-600/30 border-2 border-emerald-500/30 hover:border-emerald-500/50'
                      onClick={handleViewSoldHistory}
                    >
                      <span className='font-bold text-sm text-emerald-400'>📊 eBay Sold History</span>
                      <span className='text-xs text-emerald-300/70'>View completed sales on eBay</span>
                    </Button>
                    <Button 
                      variant='success' 
                      size='sm' 
                      className='w-full flex flex-col items-start gap-1 py-2.5 px-3 text-left bg-gradient-to-r from-emerald-600 to-teal-600'
                      onClick={() => setShowListing(true)}
                    >
                      <span className='font-bold text-sm'>📋 Copy eBay Template</span>
                      <span className='text-xs text-emerald-200'>Get listing details to copy</span>
                    </Button>
                    
                    <Button 
                      variant='primary' 
                      size='sm' 
                      className='w-full flex flex-col items-start gap-1 py-2.5 px-3 text-left bg-gradient-to-r from-green-600 to-emerald-600'
                      onClick={() => {
                        console.log('🔍 eBay button clicked! Connection status:', ebayConnected);
                        
                        // Check if eBay policies are configured
                        if (!user?.ebay_payment_policy_id || !user?.ebay_return_policy_id || !user?.ebay_fulfillment_policy_id) {
                          console.log('❌ eBay policies missing - showing prompt');
                          const connect = window.confirm(
                            '📦 eBay not connected or policies missing!\n\n' +
                            'Go to Settings → eBay Selling to connect and configure?'
                          );
                          if (connect) {
                            window.location.href = '/settings?tab=ebay';
                          }
                          return;
                        }
                        
                        console.log('✅ Connected - opening modal');
                        setShowEbayListingModal(true);
                      }}
                    >
                      <span className='font-bold text-sm'>
                        {ebayConnected ? '✅ List on eBay' : '🔗 Connect eBay'}
                      </span>
                      <span className='text-xs text-green-200'>
                        {ebayConnected ? 'Create live eBay listing' : 'Link your seller account'}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Card Tools */}
                <div className='bg-slate-800/30 border border-slate-700/50 rounded-xl p-3'>
                  <h3 className='text-sm font-bold text-slate-300 mb-3 flex items-center gap-2'>
  <Sparkles size={16} className='text-purple-400' />
  Card Tools
</h3>
<div className='space-y-2'>
  <Button 
    variant='secondary' 
    size='sm' 
    className='w-full flex items-center justify-between gap-2 py-2.5 px-3 border-2 border-orange-500/30'
    onClick={() => { if (localCard.front_image_url) { setEditingSide('front'); setShowImageEditor(true); } }}
  >
    <span className='text-sm text-orange-400'>🔧 Edit Front Image</span>
    <Edit2 size={14} className='text-orange-400' />
  </Button>
  <Button 
    variant='secondary' 
    size='sm' 
    className='w-full flex items-center justify-between gap-2 py-2.5 px-3 border-2 border-orange-500/30'
    onClick={() => { if (card.back_image_url) { setEditingSide('back'); setShowImageEditor(true); } }}
  >
    <span className='text-sm text-orange-400'>🔧 Edit Back Image</span>
    <Edit2 size={14} className='text-orange-400' />
  </Button>
                    <Button 
                      variant='secondary' 
                      size='sm' 
                      className='w-full flex items-center justify-between gap-2 py-2.5 px-3'
                      onClick={handleDownloadBothImages}
                    >
                      <span className='text-sm'>Download Images</span>
                      <Download size={14} />
                    </Button>
                    
                    {/* Replace/Add Images */}
                    <input
                      type='file'
                      ref={fileInputRef}
                      accept='image/*'
                      capture='environment'
                      onChange={handleReplaceImage}
                      className='hidden'
                    />
                    <Button 
                      variant='secondary' 
                      size='sm' 
                      className='w-full flex items-center justify-between gap-2 py-2.5 px-3'
                      onClick={() => { setReplacingSide('front'); fileInputRef.current?.click(); }}
                    >
                      <span className='text-sm'>📷 Replace Front</span>
                    </Button>
                    <Button 
                      variant='secondary' 
                      size='sm' 
                      className='w-full flex items-center justify-between gap-2 py-2.5 px-3'
                      onClick={() => { setReplacingSide('back'); fileInputRef.current?.click(); }}
                    >
                      <span className='text-sm'>{localCard.back_image_url ? '📷 Replace Back' : '📷 Add Back Image'}</span>
                    </Button>
                    <Button 
                      variant='secondary' 
                      size='sm' 
                      className='w-full flex items-center justify-between gap-2 py-2.5 px-3'
                      onClick={() => setShowEditModal(true)}
                    >
                      <span className='text-sm'>Edit Card Details</span>
                      <Edit2 size={14} />
                    </Button>
                    <Button 
  variant='primary' 
  size='sm' 
  className='w-full flex items-center justify-between gap-2 py-2.5 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm'
  onClick={() => setShowQuickTransfer(true)}
>
  🎁 Quick Transfer
  <Package size={14} />
</Button>
                    <Button 
  variant='primary' 
  size='sm' 
  className='w-full flex items-center justify-between gap-2 py-2.5 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-sm'
  onClick={() => setShowSocialShare(true)}
>
  📸 Share to Social
  <MessageSquare size={14} />
</Button>
                  </div>
                </div>

                {/* Parallel Variants Section */}
                <ParallelVariantsSection 
                  card={localCard}
                  onOpenParallelModal={(parallels) => {
                    console.log('🎯 Sidebar passing parallels to modal:', parallels?.length || 0);
                    setCachedParallels(parallels);
                    setShowParallelModal(true);
                  }}
                />
              </div>
            </div>

            {/* Stats Tabs */}
            <div className='mt-3 mb-20 sm:mb-3'>
              {card.sport === 'Pokemon' ? (
                <PokemonStatsTabs card={localCard} />
              ) : card.sport !== 'Magic' && card.sport !== 'Other' ? (
                <StatsTabs card={card} showGradingTab={!card.is_graded} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showListing && createPortal(<ListingModal card={{...localCard, ebay_avg: localCard.ebay_avg || 0}} onClose={() => setShowListing(false)} />, document.body)}
      {showSmartPricing && createPortal(
  <CombinedMarketModal 
    card={localCard}
    activeListings={activeListings}
    onClose={() => setShowSmartPricing(false)}
    onSelectPrice={handleSelectPrice}
  />, 
  document.body
)}
{showSoldCompsModal && sportsCardsProData && createPortal(
  <HistoricalCompsModal 
    card={localCard}
    sportsCardsProData={sportsCardsProData}
    onClose={() => setShowSoldCompsModal(false)}
    onSelectPrice={handleSelectPrice}
  />, 
  document.body
)}
      {showImageEditor && createPortal(
  <ImageEditor 
    card={localCard} 
    editingSide={editingSide} 
    image={editingSide === 'front' ? localCard.front_image_url : localCard.back_image_url} 
    onUpdate={async () => { 
      // Refresh the card data from the database
      if (typeof onUpdate === 'function') {
        await onUpdate();
      }
      
      // Also refresh local card state
      try {
        const response = await cardsAPI.getAll();
        if (response.cards) {
          const updated = response.cards.find(c => c.id === card.id);
          if (updated) {
            setLocalCard(updated);
          }
        }
      } catch (error) {
        console.error('Failed to refresh card:', error);
      }
    }} 
    onSave={async (newImageUrl, side) => { 
      console.log('✅ CardDetailModal received new image URL:', newImageUrl, 'for side:', side);
      
      // Update local state immediately with the new Cloudinary URL
      setLocalCard(prev => ({
        ...prev,
        [side === 'front' ? 'front_image_url' : 'back_image_url']: newImageUrl
      }));
      
      // Close the image editor
      setShowImageEditor(false); 
      
      // Refresh parent component
      if (typeof onUpdate === 'function') {
        await onUpdate();
      }
    }} 
    onClose={() => setShowImageEditor(false)} 
  />, 
  document.body
)}
      {showEditModal && createPortal(<EditCardModal card={localCard} onClose={() => setShowEditModal(false)} onSave={async (updatedCard) => { setLocalCard(updatedCard); setShowEditModal(false); if (typeof onUpdate === 'function') {
  await onUpdate();
}; }} />, document.body)}
      {showMarkAsSoldModal && createPortal(<MarkAsSoldModal card={localCard} onClose={() => setShowMarkAsSoldModal(false)} onConfirm={confirmSold} />, document.body)}
      {showParallelModal && createPortal(
  <ParallelPricingModal 
    card={localCard}
    existingParallels={cachedParallels}
    onClose={() => {
      setShowParallelModal(false);
      setCachedParallels(null);
    }}
    onSelectParallel={async (parallelData) => {
      try {
        // Update BOTH parallel name AND pricing
        const updateResponse = await cardsAPI.update(card.id, {
          ...localCard,
          parallel: parallelData.parallel
        });
        
        const priceResponse = await cardsAPI.updatePrice(card.id, {
          sportscardspro_raw: parallelData.sportscardspro_raw || null,
          sportscardspro_psa9: parallelData.sportscardspro_psa9 || null,
          sportscardspro_psa10: parallelData.sportscardspro_psa10 || null,
          sportscardspro_bgs10: parallelData.sportscardspro_bgs10 || null
        });
        
        if (priceResponse.success) {
          setLocalCard(priceResponse.card);
          if (typeof onUpdate === 'function') {
            await onUpdate();
          }
        }
      } catch (error) {
        console.error('Failed to update parallel:', error);
        alert('❌ Failed to update card');
      }
    }}
  />, 
  document.body
)}
        {showQuickTransfer && createPortal(
  <QuickTransferModal 
    card={localCard}
    onClose={() => setShowQuickTransfer(false)}
    onGenerate={handleQuickTransfer}
  />, 
  document.body
)}
{showPokemonHistorical && pokemonPricingData && createPortal(
  <PokemonHistoricalModal 
    card={localCard}
    pokemonPricingData={pokemonPricingData}
    onClose={() => setShowPokemonHistorical(false)}
    onSelectPrice={handleSelectPrice}
  />, 
  document.body
)}

{showGradingAssistant && createPortal(
  <GradingAssistant
    card={localCard}
    onClose={() => setShowGradingAssistant(false)}
    onComplete={async (inspectionData) => {
      setLocalCard(prev => ({ ...prev, ...inspectionData }));
      setShowGradingAssistant(false);
      if (typeof onUpdate === 'function') await onUpdate();
      alert(`✅ Grading inspection complete!\n\nEstimated Grade: ${inspectionData.estimated_grade}`);
    }}
  />,
  document.body
)}

{showEbayListingModal && createPortal(
  <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
    <EbayListingModal
      cards={[localCard]}
      onClose={() => {
        console.log('🔒 Closing eBay modal');
        setShowEbayListingModal(false);
      }}
      onSuccess={async () => {
        console.log('✅ eBay listing successful!');
        setShowEbayListingModal(false);
        if (typeof onUpdate === 'function') {
          await onUpdate();
        }
        alert('✅ Card listed on eBay! Check your eBay seller account.');
      }}
    />
  </div>,
  document.body
)}

{showSocialShare && createPortal(
  <SocialShareModal 
    card={localCard}
    onClose={() => setShowSocialShare(false)}
  />, 
  document.body
)}
    </>
  );
}