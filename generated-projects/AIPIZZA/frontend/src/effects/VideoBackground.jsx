import React, { useRef, useState, useEffect } from 'react';

export function VideoBackground({
  children,
  videoSrc,
  posterImage,
  overlay,
  height = '100vh',
  className = '',
  style = {},
  muted = true,
  loop = true,
  playbackRate = 1
}) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile (videos often don't autoplay on mobile)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current && playbackRate !== 1) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isLoaded]);

  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  // On mobile or if no video, fall back to poster image
  const showVideo = videoSrc && !isMobile;

  return (
    <section
      className={'video-background ' + className}
      style={{
        position: 'relative',
        height: height,
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Poster/Fallback Image */}
      {posterImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${posterImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            opacity: showVideo && isLoaded ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}
        />
      )}

      {/* Video Element */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          loop={loop}
          playsInline
          onLoadedData={handleVideoLoaded}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease'
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {overlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: overlay,
            zIndex: 1
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default VideoBackground;
