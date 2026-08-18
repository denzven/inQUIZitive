import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { PRESET_THEMES, findMatchingPreset } from '../config/themes';

/**
 * Modular Theme Background Overlay Renderer.
 * Dynamically renders theme-specific animations (toxic vat, matrix rain, spider webs, CRT scanlines)
 * based on the active theme's `overlayEffect` property defined in PRESET_THEMES.
 */
const MatrixRainCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters: Katakana, Numbers, and Symbols
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = '0123456789ABCDEF';
    const alphabet = katakana + latin;

    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let lastTime = 0;
    const fps = 30; // Smooth 30 FPS matrix drop speed
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;

      lastTime = currentTime - (delta % interval);

      // Translucent trail fill
      ctx.fillStyle = 'rgba(5, 10, 8, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Silkscreen", "Roboto Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Glowing white head for ~12% of drops, neon matrix green for the rest
        if (Math.random() > 0.88) {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FF66';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#00FF66';
          ctx.shadowColor = '#00FF66';
          ctx.shadowBlur = 2;
        }

        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="matrix-rain-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.65
      }} 
    />
  );
};

/**
 * 80s Retro Synthwave / Vaporwave 3D Perspective Horizon Grid & Sunset Radial Glow Canvas.
 * Renders infinite 3D perspective scrolling floor grid, glowing sliced synthwave sun,
 * and neon horizon radial aura.
 */
const VaporwaveHorizonCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let gridOffset = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const w = canvas.width;
      const h = canvas.height;
      const horizonY = h * 0.54; // Horizon line position (54% from top)

      ctx.clearRect(0, 0, w, h);

      // 1. Deep Space Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, 'rgba(10, 2, 26, 0.6)');
      skyGrad.addColorStop(0.5, 'rgba(30, 5, 54, 0.4)');
      skyGrad.addColorStop(1, 'rgba(69, 10, 92, 0.5)');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // 2. Large Neon Radial Sunset Glow Aura
      const sunCenterX = w / 2;
      const sunCenterY = horizonY - 10;
      const sunRadius = Math.min(w, h) * 0.20;

      const auraGrad = ctx.createRadialGradient(
        sunCenterX, sunCenterY, 5,
        sunCenterX, sunCenterY, sunRadius * 2.8
      );
      auraGrad.addColorStop(0, 'rgba(255, 0, 127, 0.55)');
      auraGrad.addColorStop(0.4, 'rgba(157, 0, 255, 0.35)');
      auraGrad.addColorStop(0.8, 'rgba(0, 255, 255, 0.15)');
      auraGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Sliced 80s Synthwave Sunset Sun
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, Math.PI, 0, false);
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI, false);

      const sunGrad = ctx.createLinearGradient(0, sunCenterY - sunRadius, 0, sunCenterY + sunRadius);
      sunGrad.addColorStop(0, '#FF007F'); // Neon Pink top
      sunGrad.addColorStop(0.5, '#FF5500'); // Sunset Orange
      sunGrad.addColorStop(1, '#FFCC00'); // Gold Sun bottom
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = '#FF007F';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw horizontal sunburst slices (Outrun style)
      ctx.fillStyle = '#1e0536';
      const numSlices = 7;
      for (let i = 0; i < numSlices; i++) {
        const sliceY = sunCenterY + (i / numSlices) * (sunRadius * 0.95);
        const sliceHeight = 2 + i * 1.5;
        ctx.fillRect(sunCenterX - sunRadius - 10, sliceY, sunRadius * 2 + 20, sliceHeight);
      }
      ctx.restore();

      // 4. Glowing Horizon Line
      ctx.strokeStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 5. Floor Space Deep Gradient
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, 'rgba(26, 4, 48, 0.5)');
      floorGrad.addColorStop(1, 'rgba(9, 1, 20, 0.7)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // 6. 3D Perspective Grid Lines (Floor)
      const numLines = 36;
      const floorHeight = h - horizonY;

      // Vertical Perspective Rays (fanning from center vanishing point)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 1.8;

      for (let i = -numLines; i <= numLines; i++) {
        const targetX = w / 2 + (i * (w / 18));
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(targetX, h);
        ctx.stroke();
      }

      // Horizontal Receding Lines (Infinite 3D perspective scrolling)
      gridOffset += 0.008;
      if (gridOffset >= 1) gridOffset -= 1;

      const numHorizLines = 16;
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.7)';
      ctx.lineWidth = 2.0;

      for (let i = 0; i < numHorizLines; i++) {
        const norm = (i + gridOffset) / numHorizLines;
        // Math.pow for non-linear 3D perspective depth!
        const lineY = horizonY + Math.pow(norm, 2.2) * floorHeight;

        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="vaporwave-horizon-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.55
      }} 
    />
  );
};

export const ThemeOverlay: React.FC = () => {
  const theme = useQuizStore((state) => state.theme);
  const activePreset = findMatchingPreset(theme);
  const overlayEffect = activePreset?.overlayEffect || 'none';

  if (overlayEffect === 'none') return null;

  switch (overlayEffect) {
    case 'toxicVat':
      return (
        <div className="toxic-vat-container" aria-hidden="true">
          {/* Smooth Acid Liquid Base Gradient */}
          <div className="toxic-liquid-gradient" />

          {/* Frothy Acid Bubbles Floating Within */}
          <div className="toxic-vat-bubble bubble-1" />
          <div className="toxic-vat-bubble bubble-2" />
          <div className="toxic-vat-bubble bubble-3" />
          <div className="toxic-vat-bubble bubble-4" />
          <div className="toxic-vat-bubble bubble-5" />
          <div className="toxic-vat-bubble bubble-6" />
          <div className="toxic-vat-bubble bubble-7" />
          <div className="toxic-vat-bubble bubble-8" />
          <div className="toxic-vat-bubble bubble-9" />
          <div className="toxic-vat-bubble bubble-10" />
          <div className="toxic-vat-bubble bubble-11" />
          <div className="toxic-vat-bubble bubble-12" />
        </div>
      );
    case 'spiderWebs':
      return (
        <div className="spider-web-overlay" aria-hidden="true">
          <div className="web-grid-radar" />
        </div>
      );
    case 'matrixRain':
      return <MatrixRainCanvas />;
    case 'crtScanlines':
      return (
        <div className="crt-scanlines-overlay" aria-hidden="true">
          <div className="crt-scanlines-lines" />
          <div className="crt-beam-roll" />
          <div className="crt-vignette-glass" />
        </div>
      );
    case 'lumosGlow':
      return (
        <div className="lumos-glow-overlay" aria-hidden="true">
          <div className="snitch-sparkle sparkle-1" />
          <div className="snitch-sparkle sparkle-2" />
          <div className="snitch-sparkle sparkle-3" />
        </div>
      );
    case 'voxelGrid':
      return (
        <div className="voxel-grid-overlay" aria-hidden="true">
          <div className="minecraft-panorama-vignette" />
          
          {/* Angled Yellow Bouncing Minecraft Splash Text Banner */}
          <div className="minecraft-splash-container">
            <div className="minecraft-splash-banner">100% Pure Quiz Power!</div>
          </div>

          {/* Minecraft Java Edition Bottom Corner Labels */}
          <div className="minecraft-footer-left">inQUIZitive v1.19.10</div>
          <div className="minecraft-footer-right">Copyright Mojang AB / inQUIZitive</div>

          {/* Ambient Floating Minecraft Experience Orbs & Block Sparkles */}
          <div className="minecraft-xp-orb orb-1" />
          <div className="minecraft-xp-orb orb-2" />
          <div className="minecraft-xp-orb orb-3" />
          <div className="minecraft-xp-orb orb-4" />
          <div className="minecraft-xp-orb orb-5" />
        </div>
      );
    case 'vaporwaveHorizon':
      return <VaporwaveHorizonCanvas />;
    default:
      return null;
  }
};
