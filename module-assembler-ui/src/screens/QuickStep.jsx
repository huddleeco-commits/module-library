/**
 * QuickStep Screen
 * Quick business description and industry detection
 */

import React, { useState, useEffect } from 'react';
import { styles } from '../styles';

export function QuickStep({ industries, projectData, updateProject, onContinue, onBack }) {
  const [input, setInput] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(null);
  const [nameAvailability, setNameAvailability] = useState(null);

  const examples = [
    'Pizza restaurant in Brooklyn',
    'Dental clinic',
    'Sports card shop',
    'Yoga studio in Austin',
    'Law firm',
    'Coffee roastery'
  ];

  const handleDetect = async () => {
    if (!input.trim()) return;

    setDetecting(true);

    // Simple industry detection from input
    const inputLower = input.toLowerCase();
    let matchedIndustry = null;
    let matchedKey = null;

    // Match against industries
    for (const [key, ind] of Object.entries(industries)) {
      const name = ind.name?.toLowerCase() || '';
      const keywords = [name, ...(ind.keywords || [])].map(k => k.toLowerCase());

      if (keywords.some(k => inputLower.includes(k)) || inputLower.includes(key)) {
        matchedIndustry = ind;
        matchedKey = key;
        break;
      }
    }

    // Fallback detection - order matters (specific first)
    if (!matchedIndustry) {
      // Finance/Investment (BEFORE SaaS)
      if (inputLower.includes('investment') || inputLower.includes('wealth') || inputLower.includes('portfolio') || inputLower.includes('hedge fund') || inputLower.includes('private equity') || inputLower.includes('asset management') || inputLower.includes('capital') || inputLower.includes('securities') || inputLower.includes('brokerage') || inputLower.includes('financial advisor')) {
        matchedKey = 'finance';
        matchedIndustry = industries['finance'] || { name: 'Finance / Investment Firm', icon: '💹' };
      } else if (inputLower.includes('restaurant') || inputLower.includes('food') || inputLower.includes('pizza') || inputLower.includes('bbq') || inputLower.includes('cafe') || inputLower.includes('dining') || inputLower.includes('grill')) {
        matchedKey = 'restaurant';
        matchedIndustry = industries['restaurant'] || { name: 'Restaurant', icon: '🍽️' };
      } else if (inputLower.includes('dental') || inputLower.includes('dentist')) {
        matchedKey = 'dental';
        matchedIndustry = industries['dental'] || { name: 'Dental Practice', icon: '🦷' };
      } else if (inputLower.includes('doctor') || inputLower.includes('clinic') || inputLower.includes('medical') || inputLower.includes('healthcare') || inputLower.includes('physician')) {
        matchedKey = 'healthcare';
        matchedIndustry = industries['healthcare'] || { name: 'Healthcare', icon: '🏥' };
      } else if (inputLower.includes('card') || inputLower.includes('collect')) {
        matchedKey = 'collectibles';
        matchedIndustry = industries['collectibles'] || { name: 'Collectibles', icon: '🃏' };
      } else if (inputLower.includes('law') || inputLower.includes('attorney') || inputLower.includes('lawyer') || inputLower.includes('legal')) {
        matchedKey = 'law-firm';
        matchedIndustry = industries['law-firm'] || { name: 'Law Firm', icon: '⚖️' };
      } else if (inputLower.includes('yoga') || inputLower.includes('pilates') || inputLower.includes('meditation')) {
        matchedKey = 'yoga';
        matchedIndustry = industries['yoga'] || { name: 'Yoga Studio', icon: '🧘' };
      } else if (inputLower.includes('gym') || inputLower.includes('fitness') || inputLower.includes('crossfit')) {
        matchedKey = 'fitness';
        matchedIndustry = industries['fitness'] || { name: 'Fitness', icon: '🏋️' };
      } else if (inputLower.includes('spa') || inputLower.includes('salon') || inputLower.includes('beauty')) {
        matchedKey = 'spa-salon';
        matchedIndustry = industries['spa-salon'] || { name: 'Spa / Salon', icon: '💆' };
      } else if (inputLower.includes('coffee') || inputLower.includes('roaster')) {
        matchedKey = 'cafe';
        matchedIndustry = industries['cafe'] || { name: 'Coffee Shop', icon: '☕' };
      } else if (inputLower.includes('real estate') || inputLower.includes('realtor') || inputLower.includes('realty')) {
        matchedKey = 'real-estate';
        matchedIndustry = industries['real-estate'] || { name: 'Real Estate', icon: '🏠' };
      } else if (inputLower.includes('construction') || inputLower.includes('contractor') || inputLower.includes('builder')) {
        matchedKey = 'construction';
        matchedIndustry = industries['construction'] || { name: 'Construction', icon: '🔨' };
      } else if (inputLower.includes('plumb') || inputLower.includes('hvac')) {
        matchedKey = 'plumber';
        matchedIndustry = industries['plumber'] || { name: 'Plumber / HVAC', icon: '🔧' };
      } else if (inputLower.includes('electric')) {
        matchedKey = 'electrician';
        matchedIndustry = industries['electrician'] || { name: 'Electrician', icon: '⚡' };
      } else {
        matchedKey = 'saas';
        matchedIndustry = industries['saas'] || { name: 'Business', icon: '💼' };
      }
    }

    setTimeout(async () => {
      setDetected({ industry: matchedIndustry, key: matchedKey });
      updateProject({
        businessName: input,
        industry: matchedIndustry,
        industryKey: matchedKey,
        layoutKey: matchedIndustry?.defaultLayout || null,
        effects: matchedIndustry?.effects || [],
        selectedPages: matchedIndustry?.defaultPages || ['home', 'about', 'services', 'contact']
      });
      setDetecting(false);

      // Check name availability
      try {
        const res = await fetch(`/api/check-name?name=${encodeURIComponent(input)}`);
        const data = await res.json();
        if (data.success) {
          setNameAvailability(data);
        }
      } catch (err) {
        console.error('Name check failed:', err);
      }
    }, 800);
  };

  return (
    <div style={styles.stepContainer}>
      <button style={styles.backBtn} onClick={onBack}>← Back</button>

      <h1 style={styles.stepTitle}>⚡ What are you building?</h1>
      <p style={styles.stepSubtitle}>Describe your business in a few words</p>

      <div style={styles.inputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleDetect()}
          placeholder="e.g., BBQ restaurant in Dallas"
          style={styles.bigInput}
          autoFocus
        />
        <button
          onClick={handleDetect}
          disabled={detecting || !input.trim()}
          style={{...styles.primaryBtn, opacity: detecting || !input.trim() ? 0.5 : 1}}
        >
          {detecting ? '🔍 Detecting...' : 'Continue →'}
        </button>
      </div>

      {/* Example chips */}
      <div style={styles.examples}>
        <p style={styles.examplesLabel}>Try these:</p>
        <div style={styles.exampleChips}>
          {examples.map(ex => (
            <button key={ex} style={styles.exampleChip} onClick={() => setInput(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Detection result */}
      {detected && (
        <div style={styles.detectedCard}>
          <div style={styles.detectedIcon}>{detected.industry?.icon || '✨'}</div>
          <div style={styles.detectedContent}>
            <h3 style={styles.detectedTitle}>{detected.industry?.name || 'Business'} Detected!</h3>
            <p style={styles.detectedDesc}>Perfect template selected. Ready to customize.</p>
            {nameAvailability && (
              <div style={{ marginTop: '8px' }}>
                <p style={{
                  fontSize: '13px',
                  color: nameAvailability.available ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {nameAvailability.available ? '✓' : '✗'}
                  {nameAvailability.available
                    ? `"${nameAvailability.sanitizedName}" is available`
                    : `"${nameAvailability.sanitizedName}" already exists`
                  }
                </p>
                {!nameAvailability.available && nameAvailability.suggestions?.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Try instead:</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {nameAvailability.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setInput(s);
                            setDetected(null);
                            setNameAvailability(null);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: '#2a2a2a',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            style={{
              ...styles.continueBtn,
              opacity: nameAvailability && !nameAvailability.available ? 0.5 : 1,
              cursor: nameAvailability && !nameAvailability.available ? 'not-allowed' : 'pointer'
            }}
            onClick={onContinue}
            disabled={nameAvailability && !nameAvailability.available}
          >
            {nameAvailability && !nameAvailability.available ? 'Name Taken' : 'Customize →'}
          </button>
        </div>
      )}
    </div>
  );
}
