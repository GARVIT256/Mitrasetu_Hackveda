import React, { useEffect, useRef } from 'react';

// Simple bar waveform visual based on current amplitude (0..1)
export default function WaveformVisualizer({ level = 0, bars = 24, dark = false }) {
  const containerRef = useRef(null);
  const clamped = Math.min(1, Math.max(0, level));
  const activeBars = Math.round(clamped * bars);
  const bg = dark ? 'bg-gray-700' : 'bg-blue-100';
  const active = dark ? 'bg-blue-400' : 'bg-blue-500';
  const inactive = dark ? 'bg-gray-600' : 'bg-blue-200';
  const barElems = [];
  for (let i=0;i<bars;i++) {
    const h = 20 + Math.sin((i / bars) * Math.PI) * 24; // base shape arch
    const filled = i < activeBars;
    barElems.push(
      <div key={i} className={`flex-1 mx-[1px] rounded-sm transition-colors duration-100 ${filled? active:inactive}`} style={{height: h}} />
    );
  }
  return (
    <div ref={containerRef} className={`flex items-end justify-center w-full h-16 px-2 py-1 rounded-md ${bg}`}>{barElems}</div>
  );
}
