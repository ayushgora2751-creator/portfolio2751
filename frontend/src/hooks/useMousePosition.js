import { useState, useEffect } from 'react';

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    speed: 0,
    isHovering: false,
    hoverType: null,
  });

  useEffect(() => {
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let lastTime = performance.now();

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16); // cap at min 16ms
      const vx = (e.clientX - lastX) / dt;
      const vy = (e.clientY - lastY) / dt;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target.closest('button, a, input, textarea, [data-interactive="true"]');
      const swarmTarget = target.closest('[data-swarm]');

      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        vx,
        vy,
        speed,
        isHovering: !!isInteractive,
        hoverType: swarmTarget ? swarmTarget.getAttribute('data-swarm') : (isInteractive ? 'button' : null),
      });

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return mousePosition;
}

