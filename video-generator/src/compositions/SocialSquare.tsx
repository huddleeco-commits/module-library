import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

interface SocialSquareProps {
  businessName: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  website: string;
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

export const SocialSquare: React.FC<SocialSquareProps> = ({
  businessName,
  tagline,
  industry,
  primaryColor,
  accentColor,
  phone,
  website,
  features,
  accentAnimation,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Gradient animation
  const gradientRotation = interpolate(frame, [0, durationInFrames], [0, 180]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation}deg, ${primaryColor}, ${accentColor})`,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* SECTION 1: Logo (0-5 seconds / frames 0-150) */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
          }}
        >
          <div
            style={{
              opacity: spring({ frame, fps, config: { damping: 20 } }),
              transform: `scale(${spring({ frame, fps, config: { damping: 15 } })})`,
            }}
          >
            <h1
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
                margin: 0,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {businessName}
            </h1>
            <p
              style={{
                fontSize: 32,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              {tagline || industry}
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SECTION 2: Features (5-10 seconds / frames 150-300) */}
      <Sequence from={150} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
            gap: 30,
          }}
        >
          {features.slice(0, 2).map((feature, index) => {
            const delay = index * 20;
            const scale = spring({
              frame: frame - 150 - delay,
              fps,
              config: { damping: 12 },
            });
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "24px 40px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  transform: `scale(${scale})`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ fontSize: 48 }}>{getIconEmoji(feature.icon)}</span>
                <span style={{ fontSize: 36, fontWeight: 600, color: "#fff" }}>
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
            padding: 60,
          }}
        >
          <div
            style={{
              opacity: spring({ frame: frame - 300, fps }),
              transform: `translateY(${interpolate(
                spring({ frame: frame - 300, fps }),
                [0, 1],
                [30, 0]
              )}px)`,
            }}
          >
            <h2
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              Visit Us!
            </h2>
            {website && (
              <div
                style={{
                  fontSize: 32,
                  color: "#fff",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                🌐 {website}
              </div>
            )}
            <div
              style={{
                marginTop: 40,
                padding: "20px 50px",
                background: "#fff",
                borderRadius: 16,
                fontSize: 28,
                fontWeight: 700,
                color: primaryColor,
                textAlign: "center",
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
