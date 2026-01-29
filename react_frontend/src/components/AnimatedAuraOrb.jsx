import React, { useRef, useEffect } from "react";

export default function AnimatedAuraOrb({ level = 0, accent = "#7c3aed" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;

    const render = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.25;
      const pulse = baseR * (0.15 + level * 0.5);

      // === DARK BACK HALO ===
      const darkHalo = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 1.6);
      darkHalo.addColorStop(0, "rgba(0,0,0,0.35)");
      darkHalo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = darkHalo;
      ctx.fillRect(0, 0, w, h);

      // === MAIN ORB ===
      const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR + pulse);
      orb.addColorStop(0, "rgba(255,255,255,0.95)"); // bright white nucleus
      orb.addColorStop(0.3, `${accent}dd`);          // strong purple core
      orb.addColorStop(0.7, `${accent}55`);          // soft glow
      orb.addColorStop(1, "rgba(0,0,0,0)");          // fade out
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR + pulse, 0, Math.PI * 2);
      ctx.fill();

      // === OUTER GLOW RING ===
      const ring = ctx.createRadialGradient(cx, cy, baseR * 0.9, cx, cy, baseR * 1.8);
      ring.addColorStop(0, `${accent}44`);
      ring.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.8, 0, Math.PI * 2);
      ctx.fill();

      frame = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(frame);
  }, [level, accent]);

  return <canvas ref={canvasRef} className="w-40 h-40" />;
}
