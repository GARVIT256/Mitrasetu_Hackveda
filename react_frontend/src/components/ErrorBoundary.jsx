import React, { useEffect, useRef } from 'react';

/**
 * Animated aura orb with deep pastel purple + black halo.
 * 
 * - Always visible on white/dark backgrounds
 * - Layered gradients with subtle breathing motion
 * - Black halo gives floating depth
 */
export default function AnimatedAuraOrb({
  size = 220,
  level = 0,
  accent = '#a78bfa' // pastel purple (violet-400/500)
}) {
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    let frame;

    const render = () => {
      tRef.current += 0.015;
      const t = tRef.current;
      const w = canvas.width;

      ctx.clearRect(0, 0, w, w);
      ctx.globalCompositeOperation = 'lighter';

      const baseR = w * 0.32;
      const pulse = baseR + Math.sin(t * 2) * 6 + level * 32;

      const accentRGB = '167,139,250'; // from #a78bfa
      

      // --- Black halo (soft shadow background) ---
      // Inside your gradients setup in render()

// --- Dark background glow (helps contrast) ---
const darkBase = ctx.createRadialGradient(w/2, w/2, 0, w/2, w/2, w*0.6);
darkBase.addColorStop(0, 'rgba(0,0,0,0.25)');
darkBase.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = darkBase;
ctx.fillRect(0, 0, w, w);

// --- Outer halo ring ---
const halo = ctx.createRadialGradient(w/2, w/2, baseR*0.8, w/2, w/2, baseR*1.8);
halo.addColorStop(0, 'rgba(0,0,0,0.15)');
halo.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = halo;
ctx.beginPath();
ctx.arc(w/2, w/2, baseR*1.8, 0, Math.PI*2);
ctx.fill();




      // --- Dynamic aura gradients ---
      const gradients = [
        {
          stops: [
            [`rgba(${accentRGB},0.20)`, 0],
            [`rgba(${accentRGB},0.4)`, 0.55],
            ['rgba(0,0,0,0)', 1]
          ],
          r: pulse * 1.4,
          ox: Math.sin(t * 0.7) * 10,
          oy: Math.cos(t * 0.7) * 10
        },
        {
          stops: [
            [`rgba(${accentRGB},0.35)`, 0],
            ['rgba(255,255,255,0.15)', 0.6],
            ['rgba(0,0,0,0)', 1]
          ],
          r: pulse,
          ox: Math.cos(t * 0.9) * 12,
          oy: Math.sin(t * 0.9) * 12
        },
        {
          stops: [
            ['rgba(255,255,255,0.7)', 0],
            ['rgba(255,255,255,0.08)', 1]
          ],
          r: baseR * 0.7 + level * 40,
          ox: Math.sin(t * 0.5) * 6,
          oy: Math.cos(t * 0.5) * 6
        }
      ];

      gradients.forEach(g => {
        const grad = ctx.createRadialGradient(
          w / 2 + g.ox,
          w / 2 + g.oy,
          0,
          w / 2 + g.ox,
          w / 2 + g.oy,
          g.r
        );
        g.stops.forEach(cs => grad.addColorStop(cs[1], cs[0]));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w / 2 + g.ox, w / 2 + g.oy, g.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Bright center nucleus ---
     // --- Brighter nucleus ---
const nucleus = ctx.createRadialGradient(w/2, w/2, 0, w/2, w/2, baseR);
nucleus.addColorStop(0, 'rgba(180,130,255,0.95)'); // bright pastel purple
nucleus.addColorStop(0.4, 'rgba(255,200,255,0.4)'); // softer pink glow
nucleus.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = nucleus;
ctx.beginPath();
ctx.arc(w/2, w/2, baseR, 0, Math.PI*2);
ctx.fill();

      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, [size, level, accent]);

  return (
    <div style={{ width: size, height: size }} className="relative select-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Soft blur overlay */}
      <div className="absolute inset-0 rounded-full backdrop-blur-[2px]" />
    </div>
  );
}
