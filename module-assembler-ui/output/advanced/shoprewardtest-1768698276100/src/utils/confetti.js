export const triggerConfetti = (options = {}) => {
  const {
    particleCount = 100,
    duration = 3000,
    colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    shapes = ['circle', 'square', 'triangle'],
    gravity = 0.5,
    wind = 0,
    startVelocity = 45,
    spread = 45
  } = options;

  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size and position
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  
  document.body.appendChild(canvas);

  // Particle class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.velocity = {
        x: (Math.random() - 0.5) * 2 * spread,
        y: Math.random() * -startVelocity
      };
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.size = Math.random() * 6 + 4;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.01;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
      this.velocity.y += gravity;
      this.velocity.x += wind;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.fillStyle = this.color;
      
      switch (this.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        
        case 'square':
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          break;
        
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    }

    isDead() {
      return this.life <= 0 || this.y > canvas.height + 100;
    }
  }

  // Create particles array
  const particles = [];
  
  // Generate particles from multiple points for better spread
  const origins = [
    { x: canvas.width * 0.25, y: canvas.height * 0.3 },
    { x: canvas.width * 0.5, y: canvas.height * 0.2 },
    { x: canvas.width * 0.75, y: canvas.height * 0.3 }
  ];
  
  origins.forEach(origin => {
    for (let i = 0; i < particleCount / origins.length; i++) {
      particles.push(new Particle(origin.x, origin.y));
    }
  });

  // Animation function
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.update();
      particle.draw();
      
      // Remove dead particles
      if (particle.isDead()) {
        particles.splice(i, 1);
      }
    }
    
    // Continue animation if particles exist
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      // Clean up
      document.body.removeChild(canvas);
    }
  };

  // Start animation
  animate();
  
  // Auto cleanup after duration
  setTimeout(() => {
    if (canvas.parentNode) {
      document.body.removeChild(canvas);
    }
  }, duration);
};

// Preset confetti effects
export const celebrateReward = () => {
  triggerConfetti({
    particleCount: 150,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF'],
    duration: 4000,
    spread: 60,
    startVelocity: 60
  });
};

export const milestoneAchieved = () => {
  triggerConfetti({
    particleCount: 200,
    colors: ['#FFD700', '#FFF700', '#FFB347', '#DAA520'],
    shapes: ['circle', 'square'],
    duration: 5000,
    spread: 80,
    startVelocity: 50
  });
};

export const levelUp = () => {
  // Multiple bursts for level up
  setTimeout(() => triggerConfetti({ particleCount: 50, spread: 30 }), 0);
  setTimeout(() => triggerConfetti({ particleCount: 50, spread: 30 }), 300);
  setTimeout(() => triggerConfetti({ particleCount: 50, spread: 30 }), 600);
};

// Export default
export default {
  triggerConfetti,
  celebrateReward,
  milestoneAchieved,
  levelUp
};