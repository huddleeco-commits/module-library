import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Easing,
  random,
} from "remotion";

interface BusinessPromoProps {
  businessName: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  features: Array<{ icon: string; text: string }>;
  template: string;
  mood: string;
  music: string;
  accentAnimation: string;
}

// Industry-specific configurations with modern color palettes
const INDUSTRY_CONFIG: Record<string, {
  particles: string[];
  gradient: [string, string, string];
  emoji: string;
  taglineDefault: string;
  particleCount: number;
  accentGlow: string;
}> = {
  bakery: {
    particles: ['🧁', '🍰', '🎂', '🥐', '🍪', '🍩', '✨'],
    gradient: ['#FF6B6B', '#FEC89A', '#FFD93D'],
    emoji: '🧁',
    taglineDefault: 'Fresh Baked Daily',
    particleCount: 25,
    accentGlow: '#FFD93D',
  },
  pizza: {
    particles: ['🍕', '🧀', '🍅', '🌿', '🔥', '✨'],
    gradient: ['#FF4E50', '#F9D423', '#FC913A'],
    emoji: '🍕',
    taglineDefault: 'Authentic & Delicious',
    particleCount: 20,
    accentGlow: '#F9D423',
  },
  restaurant: {
    particles: ['🍽️', '🥂', '✨', '🌟', '🍷'],
    gradient: ['#667eea', '#764ba2', '#f093fb'],
    emoji: '🍽️',
    taglineDefault: 'Fine Dining Experience',
    particleCount: 15,
    accentGlow: '#f093fb',
  },
  cafe: {
    particles: ['☕', '🫖', '🥐', '✨', '💨'],
    gradient: ['#3a1c71', '#d76d77', '#ffaf7b'],
    emoji: '☕',
    taglineDefault: 'Your Daily Escape',
    particleCount: 18,
    accentGlow: '#ffaf7b',
  },
  'spa-salon': {
    particles: ['💆', '✨', '🌸', '💅', '🧖', '💫'],
    gradient: ['#ee9ca7', '#ffdde1', '#a18cd1'],
    emoji: '💆',
    taglineDefault: 'Relax & Rejuvenate',
    particleCount: 20,
    accentGlow: '#ffdde1',
  },
  barbershop: {
    particles: ['💈', '✂️', '🪒', '✨', '💫'],
    gradient: ['#0f0c29', '#302b63', '#24243e'],
    emoji: '💈',
    taglineDefault: 'Look Sharp, Feel Sharp',
    particleCount: 15,
    accentGlow: '#6366f1',
  },
  dental: {
    particles: ['🦷', '✨', '💫', '🪥', '😁'],
    gradient: ['#00c6ff', '#0072ff', '#00c6ff'],
    emoji: '🦷',
    taglineDefault: 'Smile With Confidence',
    particleCount: 18,
    accentGlow: '#00c6ff',
  },
  fitness: {
    particles: ['💪', '🏋️', '⚡', '🔥', '✨'],
    gradient: ['#f12711', '#f5af19', '#f12711'],
    emoji: '💪',
    taglineDefault: 'Transform Your Life',
    particleCount: 18,
    accentGlow: '#f5af19',
  },
  'law-firm': {
    particles: ['⚖️', '📜', '✨', '🏛️', '💼'],
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
    emoji: '⚖️',
    taglineDefault: 'Justice You Can Trust',
    particleCount: 10,
    accentGlow: '#e94560',
  },
  'real-estate': {
    particles: ['🏠', '🔑', '✨', '🏡', '💫'],
    gradient: ['#11998e', '#38ef7d', '#11998e'],
    emoji: '🏠',
    taglineDefault: 'Find Your Dream Home',
    particleCount: 15,
    accentGlow: '#38ef7d',
  },
  plumber: {
    particles: ['🔧', '🚿', '💧', '✨', '🛁'],
    gradient: ['#1e3c72', '#2a5298', '#1e3c72'],
    emoji: '🔧',
    taglineDefault: '24/7 Emergency Service',
    particleCount: 15,
    accentGlow: '#4facfe',
  },
  electrician: {
    particles: ['⚡', '💡', '🔌', '✨', '⚡'],
    gradient: ['#f7971e', '#ffd200', '#f7971e'],
    emoji: '⚡',
    taglineDefault: 'Powering Your World',
    particleCount: 18,
    accentGlow: '#ffd200',
  },
  default: {
    particles: ['✨', '💫', '⭐', '🌟'],
    gradient: ['#667eea', '#764ba2', '#667eea'],
    emoji: '✨',
    taglineDefault: 'Excellence in Service',
    particleCount: 15,
    accentGlow: '#a78bfa',
  },
};

// Film grain overlay for cinematic look
const FilmGrain: React.FC<{ intensity?: number }> = ({ intensity = 0.08 }) => {
  const frame = useCurrentFrame();

  // Generate noise pattern that changes each frame
  const noiseElements = Array.from({ length: 50 }, (_, i) => {
    const seed = random(`grain-${i}-${frame}`);
    return {
      x: seed * 100,
      y: random(`grain-y-${i}-${frame}`) * 100,
      opacity: random(`grain-o-${i}-${frame}`) * intensity,
      size: 1 + random(`grain-s-${i}-${frame}`) * 2,
    };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
      }}
    >
      <svg width="100%" height="100%" style={{ opacity: 0.4 }}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.8}
            numOctaves={4}
            seed={frame}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" opacity={intensity} />
      </svg>
    </div>
  );
};

// Vignette effect
const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.6 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,${intensity}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Animated mesh gradient background
const MeshGradient: React.FC<{
  colors: [string, string, string];
}> = ({ colors }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Animate blob positions
  const blob1X = interpolate(frame, [0, durationInFrames], [20, 80], {
    extrapolateRight: "clamp",
  });
  const blob1Y = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [20, 40]
  );
  const blob2X = interpolate(frame, [0, durationInFrames], [80, 20], {
    extrapolateRight: "clamp",
  });
  const blob2Y = interpolate(
    Math.cos(frame * 0.015),
    [-1, 1],
    [60, 80]
  );
  const blob3X = interpolate(
    Math.sin(frame * 0.018),
    [-1, 1],
    [30, 70]
  );
  const blob3Y = interpolate(frame, [0, durationInFrames], [80, 30], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        }}
      />

      {/* Animated blobs */}
      <div
        style={{
          position: "absolute",
          left: `${blob1X}%`,
          top: `${blob1Y}%`,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: colors[0],
          filter: "blur(100px)",
          opacity: 0.6,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${blob2X}%`,
          top: `${blob2Y}%`,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: colors[1],
          filter: "blur(80px)",
          opacity: 0.5,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${blob3X}%`,
          top: `${blob3Y}%`,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: colors[2],
          filter: "blur(90px)",
          opacity: 0.5,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
};

// Ken Burns effect wrapper (subtle zoom/pan)
const KenBurns: React.FC<{
  children: React.ReactNode;
  startScale?: number;
  endScale?: number;
  direction?: "in" | "out";
}> = ({ children, startScale = 1, endScale = 1.08, direction = "in" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    direction === "in" ? [startScale, endScale] : [endScale, startScale],
    { extrapolateRight: "clamp" }
  );

  const x = interpolate(frame, [0, durationInFrames], [0, direction === "in" ? -2 : 2]);
  const y = interpolate(frame, [0, durationInFrames], [0, direction === "in" ? -1 : 1]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${scale}) translate(${x}%, ${y}%)`,
      }}
    >
      {children}
    </div>
  );
};

// Floating particle with better physics
const FloatingParticle: React.FC<{
  emoji: string;
  index: number;
  total: number;
  seed: string;
}> = ({ emoji, index, total, seed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();

  // Deterministic random values based on seed
  const startX = random(`${seed}-x-${index}`) * width;
  const speed = 0.5 + random(`${seed}-speed-${index}`) * 0.8;
  const wobbleAmount = 30 + random(`${seed}-wobble-${index}`) * 70;
  const wobbleSpeed = 0.01 + random(`${seed}-wspeed-${index}`) * 0.02;
  const startDelay = random(`${seed}-delay-${index}`) * 100;
  const size = 24 + random(`${seed}-size-${index}`) * 32;

  const adjustedFrame = Math.max(0, frame - startDelay);
  const progress = (adjustedFrame * speed) / durationInFrames;

  const y = interpolate(progress, [0, 1], [height + 50, -100], {
    extrapolateRight: "clamp",
  });
  const x = startX + Math.sin(adjustedFrame * wobbleSpeed) * wobbleAmount;
  const rotation = Math.sin(adjustedFrame * 0.02) * 20;
  const scale = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: size,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        opacity: 0.8,
        pointerEvents: "none",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
      }}
    >
      {emoji}
    </div>
  );
};

// Glowing text with better animations
const GlowText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fontSize?: number;
  color?: string;
  glowColor?: string;
  fontWeight?: number;
}> = ({ children, delay = 0, fontSize = 80, color = "#fff", glowColor, fontWeight = 800 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = String(
    Array.isArray(children) ? children.join("") : (children ?? "")
  );

  // Smoother spring config
  const springConfig = { damping: 15, stiffness: 120, mass: 0.8 };

  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
      {text.split("").map((char, i) => {
        const charDelay = delay + i * 1.5;
        const progress = spring({
          frame: frame - charDelay,
          fps,
          config: springConfig,
        });

        const y = interpolate(progress, [0, 1], [60, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const blur = interpolate(progress, [0, 0.5, 1], [8, 2, 0]);
        const scale = interpolate(progress, [0, 0.8, 1], [0.5, 1.1, 1]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              transform: `translateY(${y}px) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              textShadow: glowColor
                ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 4px 20px rgba(0,0,0,0.4)`
                : "0 4px 30px rgba(0,0,0,0.4)",
              letterSpacing: -1,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </div>
  );
};

// Glassmorphism card
const GlassCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        padding: "24px 40px",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Location badge component
const LocationBadge: React.FC<{
  city: string;
  state: string;
  delay?: number;
}> = ({ city, state, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });

  if (!city && !state) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 32px",
        background: "rgba(255,255,255,0.15)",
        borderRadius: 50,
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        transform: `scale(${scale})`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <span style={{ fontSize: 28 }}>📍</span>
      <span style={{ fontSize: 24, fontWeight: 600, color: "#fff" }}>
        {city}{city && state ? ", " : ""}{state}
      </span>
    </div>
  );
};

// Feature card with modern styling
const FeatureCard: React.FC<{
  icon: string;
  text: string;
  index: number;
  accentColor: string;
  glowColor: string;
}> = ({ icon, text, index, accentColor, glowColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 190 + index * 10;

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const x = interpolate(progress, [0, 1], [100, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 0.8, 1], [0.8, 1.02, 1]);

  const iconMap: Record<string, string> = {
    Pizza: "🍕", UtensilsCrossed: "🍽️", Truck: "🚚", ShoppingCart: "🛒",
    Award: "🏆", Calendar: "📅", User: "👤", Clock: "🕐",
    Shield: "🛡️", CheckCircle: "✅", Phone: "📞", Star: "⭐",
    Heart: "❤️", Sparkles: "✨", Zap: "⚡", Coffee: "☕",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "24px 36px",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.15)",
        transform: `translateX(${x}px) scale(${scale})`,
        opacity,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${accentColor}, ${glowColor})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          boxShadow: `0 8px 24px ${accentColor}44`,
        }}
      >
        {iconMap[icon] || "✨"}
      </div>
      <span style={{ fontSize: 28, fontWeight: 600, color: "#fff" }}>
        {text}
      </span>
    </div>
  );
};

// Animated line separator
const AnimatedLine: React.FC<{ delay?: number; color?: string }> = ({ delay = 0, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const width = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20 },
  });

  return (
    <div
      style={{
        width: interpolate(width, [0, 1], [0, 200]),
        height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 2,
        marginTop: 20,
        marginBottom: 20,
      }}
    />
  );
};

// Main component
export const BusinessPromo: React.FC<BusinessPromoProps> = ({
  businessName,
  tagline,
  industry,
  primaryColor,
  accentColor,
  backgroundColor,
  phone,
  website,
  city,
  state,
  features,
  template,
  mood,
  music,
  accentAnimation,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Get industry-specific config
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.default;
  const effectiveTagline = tagline || config.taglineDefault;

  // Use provided colors or fall back to industry defaults
  const gradientColors: [string, string, string] = [
    primaryColor || config.gradient[0],
    accentColor || config.gradient[1],
    config.gradient[2],
  ];

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Animated mesh gradient background */}
      <MeshGradient colors={gradientColors} />

      {/* Ken Burns wrapper for subtle movement */}
      <KenBurns startScale={1} endScale={1.05}>
        <AbsoluteFill>
          {/* Minimal floating particles - just 6 subtle ones */}
          {Array.from({ length: 6 }).map((_, i) => (
            <FloatingParticle
              key={i}
              emoji={config.particles[i % config.particles.length]}
              index={i}
              total={6}
              seed={`${industry}-${i}`}
            />
          ))}
        </AbsoluteFill>
      </KenBurns>

      {/* SECTION 1: Quick Impact Opening (0-4 seconds / frames 0-120) */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
          }}
        >
          {/* Animated business name - big and bold */}
          <GlowText delay={5} fontSize={95} glowColor={config.accentGlow}>
            {businessName}
          </GlowText>

          {/* Tagline with quick fade in */}
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.95)",
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginTop: 24,
              opacity: spring({ frame: frame - 25, fps, config: { damping: 12 } }),
              transform: `translateY(${interpolate(
                spring({ frame: frame - 25, fps, config: { damping: 12 } }),
                [0, 1],
                [15, 0]
              )}px)`,
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
            }}
          >
            {effectiveTagline}
          </div>

          {/* Location - compact inline */}
          {(city || state) && (
            <div
              style={{
                marginTop: 32,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 28px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 40,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
                opacity: spring({ frame: frame - 45, fps }),
                transform: `scale(${spring({ frame: frame - 45, fps })})`,
              }}
            >
              <span style={{ fontSize: 22 }}>📍</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>
                {city}{city && state ? ", " : ""}{state}
              </span>
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* SECTION 2: Fast Feature Flash (4-7 seconds / frames 120-210) */}
      <Sequence from={120} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
          }}
        >
          {/* Quick 3-feature horizontal layout */}
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {(features.length > 0 ? features : [
              { icon: "Star", text: "Top Rated" },
              { icon: "Clock", text: "Fast Service" },
              { icon: "Shield", text: "Trusted" },
            ]).slice(0, 3).map((feature, index) => {
              const delay = index * 8;
              const progress = spring({
                frame: frame - 120 - delay,
                fps,
                config: { damping: 12, stiffness: 100 },
              });

              const iconMap: Record<string, string> = {
                Pizza: "🍕", UtensilsCrossed: "🍽️", Truck: "🚚", ShoppingCart: "🛒",
                Award: "🏆", Calendar: "📅", User: "👤", Clock: "⏱️",
                Shield: "🛡️", CheckCircle: "✅", Phone: "📞", Star: "⭐",
                Heart: "❤️", Sparkles: "✨", Zap: "⚡", Coffee: "☕",
              };

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    padding: "32px 48px",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.15)",
                    transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])}) translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                    opacity: progress,
                    boxShadow: `0 12px 40px rgba(0,0,0,0.15), 0 0 60px ${config.accentGlow}22`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      filter: `drop-shadow(0 4px 12px ${config.accentGlow}66)`,
                    }}
                  >
                    {iconMap[feature.icon] || "✨"}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 600, color: "#fff", textAlign: "center" }}>
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SECTION 3: CTA + Final Logo (7-10 seconds / frames 210-300) */}
      <Sequence from={210} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Contact - clean and bold */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            {website && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#fff",
                  padding: "20px 44px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.2)",
                  opacity: spring({ frame: frame - 210, fps, config: { damping: 12 } }),
                  transform: `scale(${spring({ frame: frame - 210, fps, config: { damping: 12 } })})`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.1), 0 0 40px ${config.accentGlow}33`,
                }}
              >
                <span style={{ fontSize: 32 }}>🌐</span>
                {website}
              </div>
            )}

            {phone && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 28,
                  color: "rgba(255,255,255,0.9)",
                  opacity: spring({ frame: frame - 225, fps }),
                }}
              >
                <span style={{ fontSize: 24 }}>📞</span>
                {phone}
              </div>
            )}
          </div>

          {/* Final logo lockup - centered and bold */}
          <div
            style={{
              marginTop: 50,
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: spring({ frame: frame - 245, fps }),
              transform: `scale(${spring({ frame: frame - 245, fps })})`,
            }}
          >
            <span
              style={{
                fontSize: 50,
                filter: `drop-shadow(0 0 25px ${config.accentGlow})`,
              }}
            >
              {config.emoji}
            </span>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#fff",
                textShadow: `0 0 50px ${config.accentGlow}, 0 4px 24px rgba(0,0,0,0.4)`,
              }}
            >
              {businessName}
            </span>
          </div>

          {/* Blink branding */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: spring({ frame: frame - 260, fps }) * 0.6,
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span style={{ color: "#10B981" }}>⚡</span>
            <span style={{ fontWeight: 600, background: "linear-gradient(135deg, #10B981, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Blink</span>
            <span>by</span>
            <span style={{ fontWeight: 600 }}>BE1st</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Vignette overlay */}
      <Vignette intensity={0.5} />

      {/* Film grain overlay */}
      <FilmGrain intensity={0.06} />
    </AbsoluteFill>
  );
};
