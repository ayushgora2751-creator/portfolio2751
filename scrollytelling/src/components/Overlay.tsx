"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Code2, Sparkles, Terminal } from "lucide-react";

export default function Overlay() {
  const { scrollYProgress } = useScroll();

  // Section 1: (0% scroll) - Centered hero statement
  const opacity1 = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.22], [0, -50]);
  const scale1 = useTransform(scrollYProgress, [0, 0.22], [1, 0.96]);

  // Section 2: (30% scroll) - Left-aligned digital experiences
  const opacity2 = useTransform(scrollYProgress, [0.22, 0.30, 0.38, 0.46], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.22, 0.30, 0.38, 0.46], [60, 0, 0, -50]);

  // Section 3: (60% scroll) - Right-aligned design & engineering
  const opacity3 = useTransform(scrollYProgress, [0.52, 0.60, 0.68, 0.76], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.52, 0.60, 0.68, 0.76], [60, 0, 0, -50]);

  // Section 4: (85% - 100% scroll) - Work transition prompt
  const opacity4 = useTransform(scrollYProgress, [0.80, 0.88, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.80, 1], [40, 0]);

  return (
    <div className="relative w-full min-h-[160vh] flex flex-col justify-between pointer-events-none p-6 sm:p-12 lg:p-20">
      {/* Top Floating Brand Tag */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-panel text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <span className="font-semibold text-white tracking-wider">AYUSH GORA</span>
          <span className="text-slate-500">/</span>
          <span className="text-accent-cyan">PORTFOLIO &lsquo;26</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-accent-blue" />
          <span>Interactive Canvas Scrollytelling</span>
        </div>
      </div>

      {/* Main Narrative Overlays */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Section 1: 0% scroll - Centered */}
        <motion.div
          style={{ opacity: opacity1, y: y1, scale: scale1 }}
          className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-mono text-accent-cyan uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creative Engineering</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white max-w-5xl leading-none">
            AYUSH GORA
          </h1>

          <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-light text-slate-300 tracking-wide font-sans">
            Creative Developer.
          </p>

          <div className="mt-10 flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
            <span>Scroll Down to Scrub Scene</span>
          </div>
        </motion.div>

        {/* Section 2: 30% scroll - Left-aligned */}
        <motion.div
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-x-0 max-w-4xl mx-auto flex flex-col items-start text-left px-6 lg:px-0"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel text-xs font-mono text-accent-blue uppercase tracking-wider mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Mission</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            I build digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel text-xs font-mono text-accent-purple uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Philosophy</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Bridging design <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent-purple via-pink-400 to-accent-cyan">
              and engineering.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-lg text-slate-300 font-light max-w-md leading-relaxed">
            Where mathematical precision meets cinematic visual aesthetics and fluid performance.
          </p>
        </motion.div>
      </div>

      {/* Bottom Hint / Section 4 Transition Prompt */}
      <motion.div
        style={{ opacity: opacity4, y: y4 }}
        className="flex flex-col items-center justify-center text-center pb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono text-slate-300">
          <span>FEATURED WORK BELOW</span>
          <ArrowDown className="w-3.5 h-3.5 text-accent-cyan animate-bounce" />
        </div>
      </motion.div>
    </div>
  );
}

