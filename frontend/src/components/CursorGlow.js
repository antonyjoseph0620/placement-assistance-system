'use client';

import { useEffect } from 'react';

export default function CursorGlow() {
  useEffect(() => {
    const cursorGlow = document.getElementById('cursor-glow');
    if (!cursorGlow) return;

    const handleMouseMove = (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      id="cursor-glow"
      className="fixed pointer-events-none z-0 hidden lg:block"
      style={{
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.07) 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}
