export { ScrollReveal } from './ScrollReveal';
export { AnimatedCounter } from './AnimatedCounter';
export { TiltCard } from './TiltCard';
export { ParallaxSection } from './ParallaxSection';
export { TypeWriter } from './TypeWriter';
export { MagneticButton } from './MagneticButton';
export { SoftBounce } from './SoftBounce';
export { GlowEffect } from './GlowEffect';
export { StaggeredList } from './StaggeredList';
export { FloatingElements } from './FloatingElements';

export const effectPresets = {
  tech: ['TypeWriter', 'TiltCard', 'AnimatedCounter', 'GlowEffect'],
  'real-estate': ['ParallaxSection', 'ScrollReveal', 'AnimatedCounter'],
  handmade: ['SoftBounce', 'ScrollReveal', 'StaggeredList'],
  healthcare: ['ScrollReveal', 'AnimatedCounter'],
  ecommerce: ['ScrollReveal', 'TiltCard', 'StaggeredList'],
  default: ['ScrollReveal', 'AnimatedCounter', 'StaggeredList']
};
