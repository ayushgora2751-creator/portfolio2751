"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface ScrollyCanvasProps {
  children?: React.ReactNode;
  frameCount?: number;
}

export default function ScrollyCanvas({
  children,
  frameCount = 192,
}: ScrollyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(-1);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);

  // Window scroll mapping across entire website
  const { scrollYProgress } = useScroll();

  // Calculate image path dynamically
  const getFramePath = useCallback((index: number) => {
    const padded = String(index).padStart(3, "0");
    return `/sequence/frame_${padded}_delay-0.042s.png`;
  }, []);

  // Preload all frames on mount
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    // Prioritized preload: Load first frame immediately for instant first paint
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / frameCount) * 100));
      // Draw first frame immediately
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
        // Graceful fallback for any missing asset
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
  }, [frameCount, getFramePath]);

  // Object-fit: cover drawing function with Retina DPR scaling
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clamp index
    const safeIndex = Math.min(Math.max(0, frameIndex), frameCount - 1);
    
    // Find closest available loaded image if current frame hasn't finished loading yet
    let img = imagesRef.current[safeIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (lastDrawnFrameRef.current >= 0 && imagesRef.current[lastDrawnFrameRef.current]) {
        img = imagesRef.current[lastDrawnFrameRef.current];
      } else {
        return; // Nothing to draw yet
      }
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Resize canvas if needed
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Object-fit: cover math
    const imgRatio = img.width / img.height;
    const canvasRatio = displayWidth / displayHeight;
    let renderWidth = displayWidth;
    let renderHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Screen is wider than image
      renderHeight = displayWidth / imgRatio;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      // Screen is taller than image
      renderWidth = displayHeight * imgRatio;
      offsetX = (displayWidth - renderWidth) / 2;
    }

    // Clear background to #121212
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw the cover frame
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    lastDrawnFrameRef.current = safeIndex;
  }, [frameCount]);

  // Map scroll progress (0 to 1) to frame index (0 to frameCount - 1)
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
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

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Fixed Fullscreen Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block object-cover z-0"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* Balanced Soft Vignette & Contrast Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(3, 7, 18, 0.15) 0%, rgba(3, 7, 18, 0.40) 65%, rgba(3, 7, 18, 0.80) 100%)",
        }}
      />

      {/* Edge Blenders */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#121212]/80 via-[#121212]/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#121212]/80 via-[#121212]/50 to-transparent pointer-events-none" />

      {/* Loading Progress Indicator Overlay */}
      {!isPreloaded && loadProgress < 100 && (
        <div className="fixed top-6 right-6 z-30 flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
          <span>BUFFERING FRAMES {loadProgress}%</span>
        </div>
      )}
    </div>
  );
}

