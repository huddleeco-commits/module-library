import { Composition } from "remotion";
import { BusinessPromo } from "./compositions/BusinessPromo";
import { SocialSquare } from "./compositions/SocialSquare";
import { SocialVertical } from "./compositions/SocialVertical";

// Default props for preview
const defaultProps = {
  businessName: "Mario's Pizza",
  tagline: "Authentic Italian Since 1985",
  industry: "pizza",
  primaryColor: "#DC2626",
  accentColor: "#F59E0B",
  backgroundColor: "#FFFFFF",
  phone: "(555) 123-4567",
  website: "marios-pizza.be1st.io",
  city: "Brooklyn",
  state: "NY",
  features: [
    { icon: "Pizza", text: "Fresh Menu" },
    { icon: "Truck", text: "Fast Delivery" },
    { icon: "ShoppingCart", text: "Online Ordering" },
    { icon: "Award", text: "Rewards Program" },
  ],
  template: "food",
  mood: "energetic",
  music: "upbeat",
  accentAnimation: "bounce",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main 10-second promo video - 1920x1080 */}
      <Composition
        id="BusinessPromo"
        component={BusinessPromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />

      {/* Instagram square - 10 seconds - 1080x1080 */}
      <Composition
        id="SocialSquare"
        component={SocialSquare}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
      />

      {/* TikTok vertical - 10 seconds - 1080x1920 */}
      <Composition
        id="SocialVertical"
        component={SocialVertical}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
