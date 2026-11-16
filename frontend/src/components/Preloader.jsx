import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Sparkles } from 'lucide-react';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const logs = [
    "Initializing WebGL Three.js render pipeline...",
    "Calibrating multiplayer Swarm Cursor boids physics...",
    "Connecting Django REST Framework endpoints...",
    "Mounting glassmorphic design architecture...",
    "System online. Welcome to Ayush Gora's universe.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 300);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(prev + increment, 100);
        setCurrentLogIndex(Math.min(Math.floor((next / 100) * logs.length), logs.length - 1));
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md px-6 flex flex-col items-center text-center">
        {/* Pulsing Futuristic Core Icon */}
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-blue via-accent-cyan to-accent-purple p-[1px] animate-pulse">
            <div className="w-full h-full bg-background/90 rounded-[15px] flex items-center justify-center">
              <Terminal className="w-8 h-8 text-accent-cyan" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-accent-blue/20 blur-xl -z-10 animate-ping opacity-40" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-bold tracking-tight text-white mb-1">
          AYUSH GORA
        </h2>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-8">
          Creative Developer &amp; Cloud Enthusiast
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 p-0.5 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple rounded-full transition-all duration-75 shadow-glow"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Percentage & Current Telemetry Log */}
        <div className="flex items-center justify-between w-full text-xs font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1.5 text-accent-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
            <span>INITIALIZING</span>
          </span>
          <span className="font-semibold text-white">{progress}%</span>
        </div>

        <p className="text-[11px] font-mono text-slate-400 h-5 truncate max-w-xs">
          {logs[currentLogIndex]}
        </p>
      </div>
    </div>
  );
}

