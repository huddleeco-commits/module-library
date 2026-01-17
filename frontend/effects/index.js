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
export { VideoBackground } from './VideoBackground';

export const effectPresets = {
  tech: ['TypeWriter', 'TiltCard', 'AnimatedCounter', 'GlowEffect'],
  'real-estate': ['ParallaxSection', 'ScrollReveal', 'AnimatedCounter'],
  handmade: ['SoftBounce', 'ScrollReveal', 'StaggeredList'],
  healthcare: ['ScrollReveal', 'AnimatedCounter'],
  ecommerce: ['ScrollReveal', 'TiltCard', 'StaggeredList'],
  // Industries with video backgrounds
  tattoo: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter', 'GlowEffect'],
  barbershop: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter'],
  restaurant: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter', 'ParallaxSection'],
  pizza: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter', 'ParallaxSection'],
  fitness: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter', 'StaggeredList'],
  spa: ['VideoBackground', 'ScrollReveal', 'AnimatedCounter', 'ParallaxSection'],
  default: ['ScrollReveal', 'AnimatedCounter', 'StaggeredList']
};
