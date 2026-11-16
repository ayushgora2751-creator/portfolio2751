/**
 * SiteBuilderSequence.jsx
 * 
 * Signature Cinematic Intro Experience:
 * The live website systematically constructs itself before the user's eyes,
 * driven by an animated swarm of multiplayer design cursors dragging out
 * blueprint wireframe boxes, snapping ruler guides, and typing headlines.
 * 
 * Inspired by Joel Califa's "Swarm" and Dhvanil Patel's "swarm-cursors".
 */

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Volume2, VolumeX, Sparkles, Terminal, Play, RotateCcw } from 'lucide-react';
import { sound } from '../services/soundEffects';

const BUILD_STEPS = [
  { id: 1, name: "INITIALIZING CANVAS", desc: "Deploying swarm agents & coordinate grid", duration: 1600 },
  { id: 2, name: "DRAFTING NAVIGATION", desc: "Tracing header wireframe [1240 × 60 px]", duration: 2000 },
  { id: 3, name: "ASSEMBLING HERO & 3D", desc: "Constructing 3D WebGL viewport & typography", duration: 2400 },
  { id: 4, name: "BUILDING PROJECT CARDS", desc: "Generating responsive 3D tilt component grid", duration: 2000 },
  { id: 5, name: "FINALIZING LIVE SITE", desc: "Compiling shaders & mounting production DOM", duration: 1200 },
];

export default function SiteBuilderSequence({ onComplete, isReplaying = false }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isFinishing, setIsFinishing] = useState(false);
  const canvasRef = useRef(null);

  const fullTitle = "AYUSH GORA";

  // Escape key to skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const skipIntro = () => {
    setIsFinishing(true);
    sound.playCompletionHarmonics();
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Main Progression Sequence
  useEffect(() => {
    let stepTimer;
    let titleTimer;

    // Step 1: Init
    sound.playDraftBlip(320);

    // Timeline driver
    const step1Timeout = setTimeout(() => {
      setCurrentStepIdx(1);
      sound.playDraftBlip(440);
      setProgress(25);
    }, 1600);

    const step2Timeout = setTimeout(() => {
      setCurrentStepIdx(2);
      sound.playDraftBlip(550);
      setProgress(50);

      // Start typing hero title
      let charIdx = 0;
      titleTimer = setInterval(() => {
        if (charIdx <= fullTitle.length) {
          setTypedTitle(fullTitle.slice(0, charIdx));
          sound.playDraftBlip(600 + charIdx * 30, 0.04);
          charIdx++;
        } else {
          clearInterval(titleTimer);
        }
      }, 120);
    }, 3600);

    const step3Timeout = setTimeout(() => {
      setCurrentStepIdx(3);
      sound.playDraftBlip(660);
      setProgress(75);
    }, 6000);

    const step4Timeout = setTimeout(() => {
      setCurrentStepIdx(4);
      sound.playChime(880, 0.35);
      setProgress(100);
    }, 7800);

    const finishTimeout = setTimeout(() => {
      setIsFinishing(true);
      sound.playCompletionHarmonics();
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, 9000);

    return () => {
      clearTimeout(step1Timeout);
      clearTimeout(step2Timeout);
      clearTimeout(step3Timeout);
      clearTimeout(step4Timeout);
      clearTimeout(finishTimeout);
      clearInterval(titleTimer);
    };
  }, [onComplete]);

  // Autonomous Swarm Cursor Animation for Construction Stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const builderAgents = [
      { name: "Ayush", role: "Layout Lead", color: "#3b82f6", x: width * 0.2, y: height * 0.2, targetX: width * 0.5, targetY: height * 0.4 },
      { name: "Three.js", role: "Mesh Gen", color: "#8b5cf6", x: width * 0.8, y: height * 0.3, targetX: width * 0.5, targetY: height * 0.45 },
      { name: "Django", role: "API Schema", color: "#10b981", x: width * 0.3, y: height * 0.7, targetX: width * 0.35, targetY: height * 0.7 },
      { name: "DevOps", role: "Infra Blueprint", color: "#06b6d4", x: width * 0.7, y: height * 0.7, targetX: width * 0.65, targetY: height * 0.7 },
      { name: "UI/UX", role: "Typographer", color: "#f43f5e", x: width * 0.5, y: height * 0.1, targetX: width * 0.5, targetY: height * 0.35 },
    ];

    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Blueprint Coordinate Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Step-specific drafting wireframes
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Navigation Wireframe (Active from step 1 onward)
      if (currentStepIdx >= 1) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.setLineDash([5, 5]);
        const navW = Math.min(width * 0.85, 1100);
        const navH = 50;
        const navX = centerX - navW / 2;
        const navY = 30;
        ctx.strokeRect(navX, navY, navW, navH);

        // Dimensions badge
        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(navX + navW - 90, navY - 14, 85, 14);
        ctx.fillStyle = '#22d3ee';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`${Math.round(navW)} × 50 px`, navX + navW - 85, navY - 4);
      }

      // 2. Hero Wireframe (Active from step 2 onward)
      if (currentStepIdx >= 2) {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
        ctx.setLineDash([6, 6]);
        const heroW = Math.min(width * 0.75, 860);
        const heroH = 320;
        const heroX = centerX - heroW / 2;
        const heroY = centerY - heroH / 2 - 20;
        ctx.strokeRect(heroX, heroY, heroW, heroH);

        // Corner Crosshairs
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([]);
        const cs = 10;
        ctx.beginPath();
        ctx.moveTo(heroX - cs, heroY); ctx.lineTo(heroX + cs, heroY);
        ctx.moveTo(heroX, heroY - cs); ctx.lineTo(heroX, heroY + cs);
        ctx.moveTo(heroX + heroW - cs, heroY + heroH); ctx.lineTo(heroX + heroW + cs, heroY + heroH);
        ctx.moveTo(heroX + heroW, heroY + heroH - cs); ctx.lineTo(heroX + heroW, heroY + heroH + cs);
        ctx.stroke();

        // Dimensions badge
        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(heroX + 15, heroY - 16, 100, 16);
        ctx.fillStyle = '#c084fc';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`HERO VIEWPORT`, heroX + 20, heroY - 4);
      }

      // 3. Project Cards Wireframes (Active from step 3 onward)
      if (currentStepIdx >= 3) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.setLineDash([4, 4]);
        const cardW = Math.min(width * 0.24, 280);
        const cardH = 150;
        const cardY = centerY + 140;

        [-1, 0, 1].forEach((col, cIdx) => {
          const cardX = centerX + col * (cardW + 24) - cardW / 2;
          ctx.strokeRect(cardX, cardY, cardW, cardH);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(cardX + 8, cardY - 14, 80, 14);
          ctx.fillStyle = '#60a5fa';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillText(`CARD 0${cIdx + 1} WIRE`, cardX + 12, cardY - 4);
        });
      }
      ctx.restore();

      // Update and Draw Builder Agents
      builderAgents.forEach((agent, i) => {
        // Choreographed target movement depending on step
        if (currentStepIdx === 1) {
          // Dragging header
          agent.targetX = centerX + Math.cos(time * 2 + i) * (width * 0.35);
          agent.targetY = 55 + Math.sin(time + i) * 10;
        } else if (currentStepIdx === 2) {
          // Orbiting hero & typing
          const orbitR = 180 + i * 40;
          agent.targetX = centerX + Math.cos(time * 2 + i * 1.5) * orbitR;
          agent.targetY = centerY - 20 + Math.sin(time * 2 + i * 1.5) * (orbitR * 0.5);
        } else if (currentStepIdx >= 3) {
          // Assembling project cards
          const col = (i % 3) - 1;
          agent.targetX = centerX + col * 260 + Math.cos(time * 3 + i) * 40;
          agent.targetY = centerY + 200 + Math.sin(time * 3 + i) * 30;
        }

        // Spring movement
        agent.x += (agent.targetX - agent.x) * 0.08;
        agent.y += (agent.targetY - agent.y) * 0.08;

        // Draw cursor pointer
        ctx.save();
        ctx.translate(agent.x, agent.y);

        ctx.fillStyle = agent.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(4, 11);
        ctx.lineTo(8.5, 17.5);
        ctx.lineTo(11, 16);
        ctx.lineTo(7, 10);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStepIdx]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#030712] transition-opacity duration-700 select-none ${
        isFinishing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Interactive Drafting Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Controls Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-cyan animate-pulse">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-mono uppercase tracking-widest text-white font-bold">
              MULTI-AGENT LIVE BUILD SEQUENCE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Joel Califa &amp; Dhvanil Patel Swarm Architecture
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
            title={isMuted ? "Unmute Synthesizer Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-accent-cyan" />}
            <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
          </button>

          {/* Skip Button */}
          <button
            onClick={skipIntro}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-glow transition-all"
          >
            <span>Skip Build</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Simulated Live Typing & Viewport */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-accent-cyan/30 text-xs font-mono text-accent-cyan mb-4 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PHASE 0{currentStepIdx + 1}/05: {BUILD_STEPS[currentStepIdx].name}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-white h-20 flex items-center">
          <span className="text-gradient-cyan">{typedTitle || (currentStepIdx >= 2 ? "A" : "")}</span>
          <span className="inline-block w-1 h-10 sm:h-14 bg-accent-cyan ml-2 animate-pulse" />
        </h1>

        <p className="text-xs sm:text-sm font-mono text-slate-400 mt-2 max-w-md h-5">
          {BUILD_STEPS[currentStepIdx].desc}
        </p>
      </div>

      {/* Bottom Progress Telemetry Bar */}
      <footer className="relative z-20 px-6 py-5 border-t border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">CONSTRUCTION PROGRESS</span>
            <span className="text-accent-cyan font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">ESC</kbd> to jump straight into portfolio</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>5 CURSOR AGENTS ACTIVE</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

