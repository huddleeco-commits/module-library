import React, { useState, useEffect } from 'react';

export function TypeWriter({
  texts = ['Hello World'],
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  loop = true,
  cursor = true,
  className = '',
  style = {}
}) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;
    const currentText = texts[textIndex];
    
    if (isPaused) {
      const t = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, pauseTime);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else if (loop || textIndex < texts.length - 1) {
          setIsPaused(true);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex(loop ? (textIndex + 1) % texts.length : Math.min(textIndex + 1, texts.length - 1));
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(t);
  }, [displayText, isDeleting, isPaused, textIndex, texts, speed, deleteSpeed, pauseTime, loop]);

  return (
    <span className={'typewriter ' + className} style={{ display: 'inline-flex', ...style }}>
      {displayText}
      {cursor && <span style={{ marginLeft: '2px', animation: 'blink 1s step-end infinite' }}>|</span>}
      <style>{'@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }'}</style>
    </span>
  );
}

export default TypeWriter;
