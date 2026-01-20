export const triggerConfetti = () => {
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
  
  // Confetti particles array
  const particles = [];
  const particleCount = 150;
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.1,
      opacity: 1,
      life: 1
    });
  }
  
  // Animation function
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update particle position
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      
      // Fade out over time
      particle.life -= 0.01;
      particle.opacity = particle.life;
      
      // Remove particle if it's off screen or faded out
      if (particle.y > canvas.height + 10 || particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      
      // Draw different shapes
      const shapeType = Math.floor(i % 4);
      
      switch (shapeType) {
        case 0: // Rectangle
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          break;
          
        case 1: // Circle
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 2: // Triangle
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.moveTo(0, -particle.size / 2);
          ctx.lineTo(-particle.size / 2, particle.size / 2);
          ctx.lineTo(particle.size / 2, particle.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 3: // Star
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = particle.size / 2;
          const innerRadius = outerRadius / 2;
          
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (j === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    }
    
    // Continue animation if particles remain
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      // Clean up
      document.body.removeChild(canvas);
    }
  }
  
  // Start animation
  animate();
  
  // Add some particles from the center for burst effect
  setTimeout(() => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.2,
        opacity: 1,
        life: 1
      });
    }
  }, 100);
};

// Alternative simple confetti for lighter effect
export const triggerSimpleConfetti = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  
  document.body.appendChild(canvas);
  
  const particles = [];
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  
  // Create fewer particles for better performance
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      life: 1
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      particle.y += particle.vy;
      particle.x += particle.vx;
      particle.life -= 0.02;
      
      if (particle.y > canvas.height || particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }
  
  animate();
};