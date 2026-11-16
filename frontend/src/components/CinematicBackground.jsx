import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function CinematicBackground({
  frameCount = 192,
  fps = 24,
  autoPlay = true,
  className = "",
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const animationFrameIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayFrame, setDisplayFrame] = useState(0);

  // Mouse parallax offset state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const getFramePath = useCallback((index) => {
    const padded = String(index).padStart(3, '0');
    return `/sequence/frame_${padded}_delay-0.042s.png`;
  }, []);

  // Preload all 192 frames
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images = [];

    // Prioritize frame 0 for instant initial draw
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / frameCount) * 100));
      drawFrame(0);
    };

    for (let i = 0; i < frameCount; i++) {
      if (i === 0) continue;
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (isCancelled) return;
        images[i] = img;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount >= frameCount) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount >= frameCount) {
          setIsLoaded(true);
        }
      };
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [frameCount, getFramePath]);

  // Object-fit: cover drawing function with Retina DPR scaling
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeIdx = Math.min(Math.max(0, frameIdx), frameCount - 1);
    let img = imagesRef.current[safeIdx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (lastDrawnFrameRef.current >= 0 && imagesRef.current[lastDrawnFrameRef.current]) {
        img = imagesRef.current[lastDrawnFrameRef.current];
      } else {
        return;
      }
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgRatio = img.width / img.height;
    const canvasRatio = displayWidth / displayHeight;
    let renderWidth = displayWidth;
    let renderHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderHeight = displayWidth / imgRatio;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      renderWidth = displayHeight * imgRatio;
      offsetX = (displayWidth - renderWidth) / 2;
    }

    // Apply subtle mouse parallax shift (±15px)
    const px = mouseRef.current.x * 15;
    const py = mouseRef.current.y * 10;

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw video frame with cover math & parallax
    ctx.drawImage(img, offsetX + px, offsetY + py, renderWidth, renderHeight);

    ctx.restore();
    lastDrawnFrameRef.current = safeIdx;
  }, [frameCount]);

  // Track mouse for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation Loop (Continuous smooth video playback + mouse smoothing)
  useEffect(() => {
    const frameInterval = 1000 / fps;

    const loop = (timestamp) => {
      // Smooth lerp mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (isPlaying) {
        if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
        const elapsed = timestamp - lastFrameTimeRef.current;

        if (elapsed >= frameInterval) {
          lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);
          currentFrameRef.current = (currentFrameRef.current + 1) % frameCount;
          setDisplayFrame(currentFrameRef.current);
          drawFrame(currentFrameRef.current);
        } else {
          // Re-draw current frame for mouse parallax if needed
          if (Math.abs(mouseRef.current.targetX - mouseRef.current.x) > 0.001) {
            drawFrame(currentFrameRef.current);
          }
        }
      } else {
        // Redraw on mouse parallax even when paused
        if (Math.abs(mouseRef.current.targetX - mouseRef.current.x) > 0.001) {
          drawFrame(currentFrameRef.current);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [fps, isPlaying, frameCount, drawFrame]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden ${className}`}>
      {/* 1. Underlying 192-Frame Canvas Video */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* 2. Soft Edge Vignette & Center Spotlight (ensures background blends with obsidian #030712 while face stays bright & clear) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(3, 7, 18, 0.15) 0%, rgba(3, 7, 18, 0.45) 55%, rgba(3, 7, 18, 0.92) 100%)',
        }}
      />

      {/* 3. Horizontal Edge Darkeners (Soft gradient strips framing the sides) */}
      <div className="absolute inset-y-0 left-0 w-32 sm:w-64 bg-gradient-to-r from-[#030712]/90 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 sm:w-64 bg-gradient-to-l from-[#030712]/90 to-transparent pointer-events-none" />

      {/* 4. Top and Bottom Horizon Blenders */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#030712] via-[#030712]/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent pointer-events-none" />

      {/* 5. Buffering Indicator */}
      {!isLoaded && loadProgress < 100 && (
        <div className="absolute top-20 right-6 z-30 pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill border border-white/10 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
          <span>CINEMATIC FRAMES {loadProgress}%</span>
        </div>
      )}
    </div>
  );
}

