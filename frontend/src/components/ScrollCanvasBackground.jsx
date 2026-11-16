import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ScrollCanvasBackground
 * Renders the 192-frame sequence from ezgif-split / public/sequence as a fixed,
 * hardware-accelerated background for the entire website.
 * Scrubs through frames in direct proportion to the user's scroll position across the entire page.
 */
export default function ScrollCanvasBackground({
  frameCount = 192,
  className = "",
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentDrawnFrameRef = useRef(-1);
  const targetFrameRef = useRef(0);
  const animationFrameIdRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic frame path
  const getFramePath = useCallback((index) => {
    const padded = String(index).padStart(3, '0');
    return `/sequence/frame_${padded}_delay-0.042s.png`;
  }, []);

  // Object-fit: cover drawing function with Retina DPR scaling
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeIdx = Math.min(Math.max(0, Math.round(frameIdx)), frameCount - 1);
    let img = imagesRef.current[safeIdx];

    // If target frame hasn't loaded yet, fall back to the last drawn frame or frame 0
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (currentDrawnFrameRef.current >= 0 && imagesRef.current[currentDrawnFrameRef.current]) {
        img = imagesRef.current[currentDrawnFrameRef.current];
      } else if (imagesRef.current[0] && imagesRef.current[0].complete) {
        img = imagesRef.current[0];
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

    // Base background fill
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw frame
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    currentDrawnFrameRef.current = safeIdx;
  }, [frameCount]);

  // Preload all 192 frames progressively
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images = new Array(frameCount);

    // Frame 0 priority load for instant first visual
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / frameCount) * 100));
      drawFrame(0);
    };

    // Load remaining frames
    for (let i = 0; i < frameCount; i++) {
      if (i === 0) continue;
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (isCancelled) return;
        images[i] = img;
        loadedCount++;
        const pct = Math.round((loadedCount / frameCount) * 100);
        setLoadProgress(pct);
        if (loadedCount >= frameCount) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        const pct = Math.round((loadedCount / frameCount) * 100);
        setLoadProgress(pct);
        if (loadedCount >= frameCount) {
          setIsLoaded(true);
        }
      };
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [frameCount, getFramePath, drawFrame]);

  // Scroll handler that maps whole website scroll position to frame index
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      const target = progress * (frameCount - 1);
      targetFrameRef.current = target;

      // Draw immediately on scroll event
      drawFrame(target);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial positioning
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [frameCount, drawFrame]);

  // Smooth animation loop to catch Lenis smooth scroll updates
  useEffect(() => {
    let lastRendered = -1;

    const tick = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      const target = progress * (frameCount - 1);

      if (Math.abs(target - lastRendered) > 0.05) {
        lastRendered = target;
        drawFrame(target);
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [frameCount, drawFrame]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* 1. Underlying 192-Frame Canvas synced to whole page scroll */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* 2. Soft Vignette & Contrast Mask (balanced so background is clearly visible while text stays readable) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(3, 7, 18, 0.15) 0%, rgba(3, 7, 18, 0.40) 65%, rgba(3, 7, 18, 0.80) 100%)',
        }}
      />

      {/* 3. Horizontal Edge Darkeners */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-[#030712]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-[#030712]/70 to-transparent pointer-events-none" />

      {/* 4. Top and Bottom Ambient Gradients */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#030712]/80 via-[#030712]/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#030712]/80 via-[#030712]/50 to-transparent pointer-events-none" />

      {/* 5. Subtle Buffering Indicator (fades once all frames are buffered) */}
      {!isLoaded && loadProgress < 100 && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-pill border border-white/10 text-[10px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
          <span>BUFFERING BACKGROUND {loadProgress}%</span>
        </div>
      )}
    </div>
  );
}

