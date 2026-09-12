import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Matrix characters - mixing katakana, latin, and numerals
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    // Font size and column setup
    const fontSize = 16;
    let columns = canvas.width / fontSize;
    
    // Array to store the Y coordinate of each column
    // Initialize drops - one per column, starting at random negative Y positions for organic stagger
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start off-screen
    }

    const draw = () => {
      // Re-calculate columns in case of resize
      columns = canvas.width / fontSize;
      while (drops.length < columns) {
        drops.push(Math.random() * -100);
      }

      // Semi-transparent black background to create the fade-out effect
      ctx.fillStyle = 'rgba(10, 14, 23, 0.05)'; // Matches --cyber-bg with low opacity for smooth trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon green text
      ctx.fillStyle = '#0F0'; 
      ctx.font = `${fontSize}px monospace`;
      
      // For a more glowing effect, you can add shadow (can impact performance if heavily used)
      // ctx.shadowBlur = 5;
      // ctx.shadowColor = '#0F0';

      for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly once it crosses the screen, ensuring a continuous stream
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    // Run animation at roughly 33 FPS (every 30ms)
    const interval = setInterval(draw, 30);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Places it behind all content
        opacity: 0.15, // Subtle opacity so it doesn't overpower the UI
        pointerEvents: 'none' // Ensures clicks pass through to UI underneath
      }}
    />
  );
};

export default MatrixRain;
