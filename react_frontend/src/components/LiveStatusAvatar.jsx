import React, { useEffect, useRef } from 'react';

// Animated blob avatar similar to ChatGPT pulsing circle.
// Props: speaking (bool), streaming (bool), dark (bool)
export function LiveStatusAvatar({ speaking=false, streaming=false, dark=false }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return; const ctx = canvas.getContext('2d');
    let raf; let t=0;
    const draw=()=>{
      t+=0.02; const w=canvas.width, h=canvas.height; ctx.clearRect(0,0,w,h);
      const layers=5; const baseR = w/2 * 0.55; const cx=w/2, cy=h/2;
      for(let i=layers;i>0;i--){
        const p=i/layers; const deform = (Math.sin(t*2 + i)+Math.cos(t*1.3 - i))* (speaking?6:2);
        const r = baseR + deform + (streaming? (Math.sin(t*6 + i)*2):0) + i*3;
        ctx.beginPath();
        for(let a=0;a<=Math.PI*2+0.01;a+=Math.PI/64){
          const wobble = Math.sin(a*4 + t*3 + i) * (speaking?3:1.2);
          const rr = r + wobble;
          const x = cx + Math.cos(a)*rr;
          const y = cy + Math.sin(a)*rr;
          if(a===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        const grad = ctx.createRadialGradient(cx,cy, r*0.1, cx,cy,r);
        const col1 = dark? '#6d4aff':'#5b8dff';
        const col2 = dark? '#a875ff':'#82caff';
        grad.addColorStop(0, streaming? col2 : col1);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=> cancelAnimationFrame(raf);
  },[speaking, streaming, dark]);
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <canvas ref={canvasRef} width={56} height={56} className="absolute inset-0"/>
      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs ${dark? 'bg-purple-600 text-white':'bg-blue-500 text-white'} shadow-md`}>AI</div>
      {streaming && <span className="absolute -bottom-1 text-[10px] font-medium text-blue-500 dark:text-blue-300">typing…</span>}
    </div>
  );
}

export default LiveStatusAvatar;