import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowDown, Code2, Sparkles, Terminal } from 'lucide-react';

export default function ScrollySection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const lastDrawnFrameRef = useRef(-1);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);

  const frameCount = 192;

  // Scroll mapping across 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate image path dynamically
  const getFramePath = useCallback((index) => {
    const padded = String(index).padStart(3, '0');
    return `/sequence/frame_${padded}_delay-0.042s.png`;
  }, []);

  // Preload all 192 frames on mount
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images = [];

    // Prioritized preload: Load first frame immediately
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / frameCount) * 100));
      renderFrame(0);
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
        setLoadProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount >= frameCount) {
          setIsPreloaded(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount >= frameCount) {
          setIsPreloaded(true);
        }
      };
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [getFramePath]);

  // Object-fit: cover drawing function with Retina DPR scaling
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeIndex = Math.min(Math.max(0, frameIndex), frameCount - 1);
    
    let img = imagesRef.current[safeIndex];
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

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    lastDrawnFrameRef.current = safeIndex;
  }, []);

  // Map scroll progress (0 to 1) to frame index
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const targetFrame = Math.floor(progress * (frameCount - 1));
    if (targetFrame !== lastDrawnFrameRef.current) {
      requestAnimationFrame(() => renderFrame(targetFrame));
    }
  });

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      renderFrame(lastDrawnFrameRef.current >= 0 ? lastDrawnFrameRef.current : 0);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Parallax Text Animations mapped to scroll milestones
  const opacity1 = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.22], [0, -50]);
  const scale1 = useTransform(scrollYProgress, [0, 0.22], [1, 0.96]);

  const opacity2 = useTransform(scrollYProgress, [0.22, 0.30, 0.38, 0.46], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.22, 0.30, 0.38, 0.46], [60, 0, 0, -50]);

  const opacity3 = useTransform(scrollYProgress, [0.52, 0.60, 0.68, 0.76], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.52, 0.60, 0.68, 0.76], [60, 0, 0, -50]);

  const opacity4 = useTransform(scrollYProgress, [0.80, 0.88, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.80, 1], [40, 0]);

  return (
    <div
      ref={containerRef}
      id="scrollytelling"
      className="relative w-full h-[500vh] bg-[#121212]"
    >
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block object-cover z-0"
        />

        {/* Buffering Indicator */}
        {!isPreloaded && loadProgress < 100 && (
          <div className="absolute top-6 right-6 z-30 flex items-center gap-3 px-4 py-2 rounded-full glass-pill border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
            <span>BUFFERING FRAMES {loadProgress}%</span>
          </div>
        )}

        {/* Parallax Overlay Layers */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none p-6 sm:p-12 lg:p-20">
          {/* Top Tag */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-pill border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <span className="font-semibold text-white tracking-wider">AYUSH GORA</span>
              <span className="text-slate-500">/</span>
              <span className="text-accent-cyan">SCROLLYTELLING &lsquo;26</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill border border-white/10 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-accent-blue" />
              <span>Canvas 192-Frame Engine</span>
            </div>
          </div>

          {/* Center Parallax Text Sections */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Section 1: 0% scroll - Centered */}
            <motion.div
              style={{ opacity: opacity1, y: y1, scale: scale1 }}
              className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-white/10 text-xs font-mono text-accent-cyan uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creative Engineering</span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight text-white max-w-5xl leading-none">
                AYUSH GORA
              </h1>

              <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-light text-slate-300 tracking-wide font-sans">
                Creative Developer.
              </p>

              <div className="mt-10 flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
                <span>Scroll Down to Scrub Sequence</span>
              </div>
            </motion.div>

            {/* Section 2: 30% scroll - Left-aligned */}
            <motion.div
              style={{ opacity: opacity2, y: y2 }}
              className="absolute inset-x-0 max-w-4xl mx-auto flex flex-col items-start text-left px-6 lg:px-0"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill border border-white/10 text-xs font-mono text-accent-blue uppercase tracking-wider mb-4">
                <Code2 className="w-3.5 h-3.5" />
                <span>Mission</span>
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-tight max-w-2xl">
                I build digital <br />
                <span className="text-gradient-cyan">
                  experiences.
                </span>
              </h2>

              <p className="mt-4 text-sm sm:text-lg text-slate-300 font-light max-w-md leading-relaxed">
                Crafting immersive 3D graphics, fluid interactions, and rock-solid full-stack architectures.
              </p>
            </motion.div>

            {/* Section 3: 60% scroll - Right-aligned */}
            <motion.div
              style={{ opacity: opacity3, y: y3 }}
              className="absolute inset-x-0 max-w-4xl mx-auto flex flex-col items-end text-right px-6 lg:px-0"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill border border-white/10 text-xs font-mono text-accent-purple uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Philosophy</span>
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-tight max-w-2xl">
                Bridging design <br />
                <span className="text-gradient-purple">
                  and engineering.
                </span>
              </h2>

              <p className="mt-4 text-sm sm:text-lg text-slate-300 font-light max-w-md leading-relaxed">
                Where mathematical precision meets cinematic visual aesthetics and fluid performance.
              </p>
            </motion.div>
          </div>

          {/* Section 4: 85% - 100% Transition Prompt */}
          <motion.div
            style={{ opacity: opacity4, y: y4 }}
            className="flex flex-col items-center justify-center text-center pb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border border-white/10 text-xs font-mono text-slate-300">
              <span>EXPLORE SELECTED WORK</span>
              <ArrowDown className="w-3.5 h-3.5 text-accent-cyan animate-bounce" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

