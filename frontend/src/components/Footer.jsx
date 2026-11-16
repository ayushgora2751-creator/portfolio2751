import React, { useState, useEffect } from 'react';
import { ArrowUp, Terminal, Heart, Sparkles, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-background-secondary/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand & Attribution */}
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-display font-bold text-base">
            <Terminal className="w-4 h-4 text-accent-cyan" />
            <span>AYUSH GORA</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono font-normal text-slate-400">© 2026</span>
          </div>
          <p className="text-xs text-slate-400 font-light">
            Crafted with React, Three.js WebGL, Django REST Framework, and Tailwind CSS.
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            Multiplayer swarm cursor engine inspired by Joel Califa &amp; Dhvanil Patel.
          </p>
        </div>

        {/* Live System Clock & Back to Top */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end text-xs font-mono text-slate-400">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">System Clock</span>
            <span className="text-white font-semibold">{timeStr || '00:00:00'}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="p-3 rounded-xl glass-card text-slate-300 hover:text-white hover:border-accent-blue transition-all"
            aria-label="Back to top"
            data-swarm="gather"
          >
            <ArrowUp className="w-4 h-4 text-accent-cyan" />
          </button>
        </div>
      </div>
    </footer>
  );
}

