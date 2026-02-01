import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

interface SocialVerticalProps {
  businessName: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  features: Array<{ icon: string; text: string }>;
  accentAnimation: string;
}

// Map icon names to emojis
function getIconEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    Pizza: "🍕",
    UtensilsCrossed: "🍽️",
    Truck: "🚚",
    ShoppingCart: "🛒",
    Award: "🏆",
    Calendar: "📅",
    User: "👤",
    Clock: "🕐",
    Shield: "🛡️",
    CheckCircle: "✅",
  };
  return iconMap[icon] || "✨";
}

export const SocialVertical: React.FC<SocialVerticalProps> = ({
  businessName,
  tagline,
  industry,
  primaryColor,
  accentColor,
  phone,
  website,
  city,
  state,
  features,
  accentAnimation,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Gradient animation
  const gradientRotation = interpolate(frame, [0, durationInFrames], [0, 180]);

  // Pulse animation for TikTok energy
  const pulse = 1 + Math.sin(frame * 0.15) * 0.02;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation + 45}deg, ${primaryColor}, ${accentColor}, ${primaryColor})`,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* SECTION 1: Big Logo Intro (0-5 seconds / frames 0-150) */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              opacity: spring({ frame, fps, config: { damping: 20 } }),
              transform: `scale(${spring({ frame, fps, config: { damping: 10, stiffness: 80 } }) * pulse})`,
            }}
          >
            <h1
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#fff",
                textAlign: "center",
                margin: 0,
                textShadow: "0 6px 30px rgba(0,0,0,0.4)",
                letterSpacing: -2,
              }}
            >
              {businessName}
            </h1>
            <p
              style={{
                fontSize: 36,
                color: "rgba(255,255,255,0.95)",
                textAlign: "center",
                marginTop: 24,
                fontWeight: 500,
              }}
            >
              {tagline || `The Best ${industry} in Town`}
            </p>
            <div
              style={{
                marginTop: 40,
                fontSize: 28,
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
              }}
            >
              📍 {city}, {state}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SECTION 2: Feature Stack (5-10 seconds / frames 150-300) */}
      <Sequence from={150} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            gap: 24,
          }}
        >
          <h2
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 30,
              textShadow: "0 4px 15px rgba(0,0,0,0.3)",
              opacity: spring({ frame: frame - 150, fps }),
            }}
          >
            What We Offer
          </h2>
          {features.slice(0, 3).map((feature, index) => {
            const delay = index * 15;
            const slideIn = spring({
              frame: frame - 150 - delay,
              fps,
              config: { damping: 12 },
            });
            const slideX = interpolate(slideIn, [0, 1], [100, 0]);

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 32px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  transform: `translateX(${slideX}px)`,
                  opacity: slideIn,
                  backdropFilter: "blur(10px)",
                  width: "90%",
                  maxWidth: 500,
                }}
              >
                <span style={{ fontSize: 44 }}>{getIconEmoji(feature.icon)}</span>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>
                  {feature.text}
                </span>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* SECTION 3: CTA (10-15 seconds / frames 300-450) */}
      <Sequence from={300} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              opacity: spring({ frame: frame - 300, fps }),
              transform: `scale(${spring({ frame: frame - 300, fps, config: { damping: 15 } })})`,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 50,
                textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              Check Us Out!
            </h2>

            {website && (
              <div
                style={{
                  padding: "24px 48px",
                  background: "#fff",
                  borderRadius: 24,
                  fontSize: 32,
                  fontWeight: 700,
                  color: primaryColor,
                  marginBottom: 30,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
              >
                🌐 {website}
              </div>
            )}

            {phone && (
              <div
                style={{
                  fontSize: 36,
                  color: "#fff",
                  marginTop: 30,
                }}
              >
                📞 {phone}
              </div>
            )}

            <div
              style={{
                marginTop: 60,
                fontSize: 48,
                fontWeight: 900,
                color: "#fff",
                textShadow: "0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              {businessName}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
