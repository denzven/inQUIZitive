import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { findMatchingPreset, type ThemeOverlayEffect } from '../config/themes';

/**
 * Modular Matrix Digital Code Rain Canvas Component.
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
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = '0123456789ABCDEF';
    const alphabet = katakana + latin;

    const fontSize = canvas.width < 320 ? 12 : 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array.from({ length: Math.max(1, columns) }, () => Math.floor(Math.random() * -30));

    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;

      lastTime = currentTime - (delta % interval);

      ctx.fillStyle = 'rgba(5, 10, 8, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Silkscreen", "Roboto Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.88) {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FF66';
          ctx.shadowBlur = 6;
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
        opacity: 0.65,
        borderRadius: 'inherit'
      }} 
    />
  );
};

/**
 * 80s Retro Synthwave / Vaporwave 3D Perspective Horizon Grid & Sunset Canvas.
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
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const w = canvas.width;
      const h = canvas.height;
      const horizonY = h * 0.54;

      ctx.clearRect(0, 0, w, h);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, 'rgba(10, 2, 26, 0.6)');
      skyGrad.addColorStop(0.5, 'rgba(30, 5, 54, 0.4)');
      skyGrad.addColorStop(1, 'rgba(69, 10, 92, 0.5)');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

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
      ctx.arc(sunCenterX, sunCenterY, Math.max(10, sunRadius * 2.8), 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, Math.max(5, sunRadius), Math.PI, 0, false);
      ctx.arc(sunCenterX, sunCenterY, Math.max(5, sunRadius), 0, Math.PI, false);

      const sunGrad = ctx.createLinearGradient(0, sunCenterY - sunRadius, 0, sunCenterY + sunRadius);
      sunGrad.addColorStop(0, '#FF007F');
      sunGrad.addColorStop(0.5, '#FF5500');
      sunGrad.addColorStop(1, '#FFCC00');
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = '#FF007F';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1e0536';
      const numSlices = 5;
      for (let i = 0; i < numSlices; i++) {
        const sliceY = sunCenterY + (i / numSlices) * (sunRadius * 0.95);
        const sliceHeight = 1.5 + i * 1.2;
        ctx.fillRect(sunCenterX - sunRadius - 10, sliceY, sunRadius * 2 + 20, sliceHeight);
      }
      ctx.restore();

      ctx.strokeStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, 'rgba(26, 4, 48, 0.5)');
      floorGrad.addColorStop(1, 'rgba(9, 1, 20, 0.7)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      const numLines = 18;
      const floorHeight = h - horizonY;

      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1.2;

      for (let i = -numLines; i <= numLines; i++) {
        const targetX = w / 2 + (i * (w / 12));
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(targetX, h);
        ctx.stroke();
      }

      gridOffset += 0.008;
      if (gridOffset >= 1) gridOffset -= 1;

      const numHorizLines = 10;
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.6)';
      ctx.lineWidth = 1.5;

      for (let i = 0; i < numHorizLines; i++) {
        const norm = (i + gridOffset) / numHorizLines;
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
        opacity: 0.55,
        borderRadius: 'inherit'
      }} 
    />
  );
};

/**
 * Custom JavaScript Canvas Overlay Renderer.
 * Evaluates user-provided JS canvas animation function safely inside requestAnimationFrame.
 * Parameters passed to custom script: (canvas, ctx, width, height, time, frameCount).
 */
const CustomJsOverlayCanvas: React.FC<{ code?: string }> = ({ code }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();
    let frameCount = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const defaultScript = `
// Pulsing Neon Sine Wave Fireflies
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
ctx.fillRect(0, 0, width, height);

for (let i = 0; i < 14; i++) {
  const x = (width * 0.5) + Math.sin(time + i * 0.7) * (width * 0.35);
  const y = (height * 0.5) + Math.cos(time * 0.8 + i * 1.5) * (height * 0.35);
  const size = 3 + Math.sin(time * 3 + i) * 2;
  
  ctx.fillStyle = \`hsl(\${(time * 40 + i * 25) % 360}, 100%, 65%)\`;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2);
  ctx.fill();
}
ctx.shadowBlur = 0;
    `;

    const activeCode = code && code.trim() ? code : defaultScript;

    let userDrawFn: Function | null = null;
    try {
      userDrawFn = new Function('canvas', 'ctx', 'width', 'height', 'time', 'frameCount', activeCode);
    } catch (err: any) {
      console.warn("Custom Overlay Compile Error:", err);
    }

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      const time = (now - startTime) / 1000;
      frameCount++;

      if (userDrawFn) {
        try {
          userDrawFn(canvas, ctx, canvas.width, canvas.height, time, frameCount);
        } catch (err: any) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ff4d4d';
          ctx.font = '11px monospace';
          ctx.fillText('JS Overlay Error: ' + err.message, 10, 20);
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [code]);

  return (
    <canvas 
      ref={canvasRef} 
      className="custom-js-overlay-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8,
        borderRadius: 'inherit'
      }} 
    />
  );
};

/**
 * Electric Plasma Storm & High-Voltage Lightning Discharges Canvas Component.
 */
const PlasmaArcCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }> = [];
    for (let i = 0; i < 25; i++) {
      sparks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100,
        maxLife: 60 + Math.random() * 60,
        color: Math.random() > 0.4 ? '#00F0FF' : '#FF007F'
      });
    }

    let frame = 0;

    const drawBolt = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(5, Math.floor(distance / 15));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      let currX = x1;
      let currY = y1;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const targetX = x1 + (x2 - x1) * t;
        const targetY = y1 + (y2 - y1) * t;
        if (i < steps) {
          currX = targetX + (Math.random() - 0.5) * 24;
          currY = targetY + (Math.random() - 0.5) * 24;
        } else {
          currX = targetX;
          currY = targetY;
        }
        ctx.lineTo(currX, currY);
      }
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      frame++;

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = 'rgba(4, 2, 9, 0.22)';
      ctx.fillRect(0, 0, w, h);

      const t = frame * 0.03;
      const core1X = w * 0.15 + Math.sin(t) * 30;
      const core1Y = h * 0.15 + Math.cos(t * 0.8) * 20;

      const core2X = w * 0.85 + Math.cos(t * 1.2) * 30;
      const core2Y = h * 0.85 + Math.sin(t * 0.9) * 20;

      const grad1 = ctx.createRadialGradient(core1X, core1Y, 5, core1X, core1Y, 140);
      grad1.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      grad1.addColorStop(0.5, 'rgba(123, 44, 191, 0.15)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(core1X, core1Y, 140, 0, Math.PI * 2);
      ctx.fill();

      const grad2 = ctx.createRadialGradient(core2X, core2Y, 5, core2X, core2Y, 140);
      grad2.addColorStop(0, 'rgba(255, 0, 127, 0.3)');
      grad2.addColorStop(0.5, 'rgba(123, 44, 191, 0.12)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(core2X, core2Y, 140, 0, Math.PI * 2);
      ctx.fill();

      if (frame % 4 === 0 || Math.random() < 0.25) {
        const color = Math.random() > 0.35 ? '#00F0FF' : '#FF007F';
        drawBolt(core1X, core1Y, w * 0.5 + (Math.random() - 0.5) * w * 0.6, h * 0.5 + (Math.random() - 0.5) * h * 0.6, color);
      }
      if (Math.random() < 0.15) {
        const color = Math.random() > 0.4 ? '#00F0FF' : '#7B2CBF';
        drawBolt(core2X, core2Y, w * 0.5 + (Math.random() - 0.5) * w * 0.6, h * 0.5 + (Math.random() - 0.5) * h * 0.6, color);
      }

      for (let s of sparks) {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > s.maxLife || s.x < 0 || s.x > w || s.y < 0 || s.y > h) {
          s.x = Math.random() > 0.5 ? core1X : core2X;
          s.y = Math.random() > 0.5 ? core1Y : core2Y;
          s.vx = (Math.random() - 0.5) * 3;
          s.vy = (Math.random() - 0.5) * 3;
          s.life = 0;
        }

        const alpha = 1 - s.life / s.maxLife;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, 2 * alpha), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
      className="plasma-arc-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75,
        borderRadius: 'inherit'
      }} 
    />
  );
};

/**
 * Grand Imperial Industrial Clockwork Assembly Canvas Component.
 * Features massive interlocking brass/copper gears across the viewport,
 * mechanical tooth ratio synchronization, metallic bevel gradients, brass rivets,
 * and rising steam embers.
 */
const SteampunkGearsCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Steam embers floating up
    const embers: Array<{ x: number; y: number; size: number; speedY: number; osc: number; alpha: number }> = [];
    for (let i = 0; i < 35; i++) {
      embers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.8 + 0.4,
        osc: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.25
      });
    }

    const drawDetailedGear = (
      x: number, 
      y: number, 
      radius: number, 
      teeth: number, 
      angle: number, 
      baseColor: string, 
      strokeColor: string, 
      rimColor: string,
      spokeCount = 6
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const toothDepth = radius * 0.15;
      const innerRadius = radius - toothDepth;

      // 1. Draw Outer Gear Teeth Wheel
      ctx.fillStyle = baseColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.65) / teeth) * Math.PI * 2;
        const a4 = ((i + 1) / teeth) * Math.PI * 2;

        ctx.arc(0, 0, innerRadius, a1, a2);
        ctx.arc(0, 0, radius, a2, a3);
        ctx.arc(0, 0, innerRadius, a3, a4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Outer Rim Ring Groove
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Brass Rivets along Rim
      const rivetCount = teeth;
      ctx.fillStyle = rimColor;
      for (let i = 0; i < rivetCount; i++) {
        const rAngle = (i / rivetCount) * Math.PI * 2;
        const rx = Math.cos(rAngle) * (innerRadius * 0.94);
        const ry = Math.sin(rAngle) * (innerRadius * 0.94);
        ctx.beginPath();
        ctx.arc(rx, ry, Math.max(1.5, radius * 0.025), 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Decorative Spoke Cutouts
      const spokeRadius = innerRadius * 0.42;
      const holeRadius = innerRadius * 0.22;
      ctx.fillStyle = '#140D0A'; // Cutout dark background
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < spokeCount; i++) {
        const sAngle = (i / spokeCount) * Math.PI * 2;
        const hx = Math.cos(sAngle) * spokeRadius;
        const hy = Math.sin(sAngle) * spokeRadius;
        ctx.beginPath();
        ctx.arc(hx, hy, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 5. Center Axle Hub
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.stroke();

      // Center Pin
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#140D0A';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    let startTime = performance.now();

    const draw = (now: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const time = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep Hearth Furnace Glow
      const ambientGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      ambientGrad.addColorStop(0, 'rgba(255, 191, 0, 0.15)');
      ambientGrad.addColorStop(0.5, 'rgba(184, 134, 11, 0.06)');
      ambientGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      const baseScale = Math.min(w, h);

      // 1. Background Mega-Gear (Ultra Large & Faded)
      const g0Radius = baseScale * 0.55;
      drawDetailedGear(
        w * 0.5, h * 0.5, g0Radius, 24, time * 0.08,
        'rgba(184, 134, 11, 0.05)', 'rgba(255, 191, 0, 0.12)', 'rgba(255, 191, 0, 0.18)', 8
      );

      // 2. Master Central Brass Gear
      const g1Radius = baseScale * 0.28;
      const g1Teeth = 16;
      const g1Angle = time * 0.25;
      const g1X = w * 0.42;
      const g1Y = h * 0.52;
      drawDetailedGear(
        g1X, g1Y, g1Radius, g1Teeth, g1Angle,
        'rgba(184, 134, 11, 0.18)', 'rgba(255, 191, 0, 0.45)', 'rgba(255, 215, 0, 0.6)', 6
      );

      // 3. Interlocking Copper Gear (Top-Right, Counter-Rotating, Synchronized)
      const g2Radius = baseScale * 0.22;
      const g2Teeth = 12;
      // Synchronize rotation speed according to gear teeth ratio!
      const g2Angle = -g1Angle * (g1Teeth / g2Teeth) + 0.18;
      // Distance between centers equals sum of inner radii
      const dist12 = (g1Radius * 0.85) + (g2Radius * 0.85);
      const angle12 = -Math.PI * 0.28;
      const g2X = g1X + Math.cos(angle12) * dist12;
      const g2Y = g1Y + Math.sin(angle12) * dist12;

      drawDetailedGear(
        g2X, g2Y, g2Radius, g2Teeth, g2Angle,
        'rgba(139, 90, 43, 0.2)', 'rgba(205, 92, 92, 0.45)', 'rgba(255, 191, 0, 0.55)', 5
      );

      // 4. Interlocking Dark Bronze Gear (Bottom-Left)
      const g3Radius = baseScale * 0.25;
      const g3Teeth = 14;
      const g3Angle = -g1Angle * (g1Teeth / g3Teeth) + 0.35;
      const dist13 = (g1Radius * 0.85) + (g3Radius * 0.85);
      const angle13 = Math.PI * 0.72;
      const g3X = g1X + Math.cos(angle13) * dist13;
      const g3Y = g1Y + Math.sin(angle13) * dist13;

      drawDetailedGear(
        g3X, g3Y, g3Radius, g3Teeth, g3Angle,
        'rgba(184, 134, 11, 0.16)', 'rgba(255, 191, 0, 0.4)', 'rgba(255, 215, 0, 0.5)', 6
      );

      // 5. Update & Draw Rising Steam Embers
      for (let e of embers) {
        e.y -= e.speedY;
        e.osc += 0.03;
        const curX = e.x + Math.sin(e.osc) * 20;

        if (e.y < -10) {
          e.y = h + 10;
          e.x = Math.random() * w;
        }

        ctx.fillStyle = `rgba(255, 191, 0, ${e.alpha})`;
        ctx.shadowColor = '#FFBF00';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(curX, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
      className="steampunk-gears-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
        borderRadius: 'inherit'
      }} 
    />
  );
};

interface ThemeOverlayProps {
  effect?: ThemeOverlayEffect;
  customOverlayCode?: string;
  isMiniPreview?: boolean;
}

export const ThemeOverlay: React.FC<ThemeOverlayProps> = ({ effect, customOverlayCode, isMiniPreview = false }) => {
  const theme = useQuizStore((state) => state.theme);
  const activePreset = findMatchingPreset(theme);
  const overlayEffect = effect !== undefined ? effect : (activePreset?.overlayEffect || 'none');

  if (overlayEffect === 'none') return null;

  switch (overlayEffect) {
    case 'toxicVat':
      return (
        <div className="toxic-vat-container" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="toxic-liquid-gradient" />
          <div className="toxic-vat-bubble bubble-1" />
          <div className="toxic-vat-bubble bubble-2" />
          <div className="toxic-vat-bubble bubble-3" />
          <div className="toxic-vat-bubble bubble-4" />
          <div className="toxic-vat-bubble bubble-5" />
          {!isMiniPreview && (
            <>
              <div className="toxic-vat-bubble bubble-6" />
              <div className="toxic-vat-bubble bubble-7" />
              <div className="toxic-vat-bubble bubble-8" />
              <div className="toxic-vat-bubble bubble-9" />
              <div className="toxic-vat-bubble bubble-10" />
            </>
          )}
        </div>
      );
    case 'spiderWebs':
      return (
        <div className="spider-web-overlay" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="web-grid-radar" />
        </div>
      );
    case 'matrixRain':
      return <MatrixRainCanvas />;
    case 'crtScanlines':
      return (
        <div className="crt-scanlines-overlay" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="crt-scanlines-lines" />
          <div className="crt-beam-roll" />
          <div className="crt-vignette-glass" />
        </div>
      );
    case 'lumosGlow':
      return (
        <div className="lumos-glow-overlay" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="snitch-sparkle sparkle-1" />
          <div className="snitch-sparkle sparkle-2" />
          <div className="snitch-sparkle sparkle-3" />
        </div>
      );
    case 'voxelGrid':
      return (
        <div className="voxel-grid-overlay" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="minecraft-panorama-vignette" />
          {!isMiniPreview && (
            <div className="minecraft-splash-container">
              <div className="minecraft-splash-banner">100% Pure Quiz Power!</div>
            </div>
          )}
          <div className="minecraft-xp-orb orb-1" />
          <div className="minecraft-xp-orb orb-2" />
          <div className="minecraft-xp-orb orb-3" />
        </div>
      );
    case 'vaporwaveHorizon':
      return <VaporwaveHorizonCanvas />;
    case 'plasmaArc':
      return <PlasmaArcCanvas />;
    case 'steampunkGears':
      return <SteampunkGearsCanvas />;
    case 'customJs':
      return <CustomJsOverlayCanvas code={customOverlayCode || activePreset?.customOverlayCode} />;
    default:
      return null;
  }
};
