import React from 'react';
import { ArrowDown, FileDown, Terminal, Code2, Cloud, Cpu } from 'lucide-react';
import Scene3D from '../three/Scene3D';

export default function Hero({ onOpenResume }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-8 px-4 sm:px-8 lg:px-14 overflow-hidden select-none bg-transparent">
      {/* Three.js Ambient Particle & Light Field */}
      <Scene3D />

      {/* Top / Upper-Third Asymmetric HUD */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 sm:pt-8 pointer-events-none">
        {/* Left Column: Headline, Bio & Action Buttons */}
        <div className="lg:col-span-7 flex flex-col items-start text-left max-w-xl pointer-events-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill mb-4 border border-accent-blue/30 text-xs font-mono text-slate-300 shadow-glow">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-white font-semibold">B.Tech CSE Student</span>
            <span className="text-slate-500">·</span>
            <span className="text-accent-cyan">Aspiring DevOps &amp; Cloud Engineer</span>
          </div>

          {/* Hero Name Title */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white mb-3"
            data-swarm="orbit"
          >
            <span className="block text-gradient-glow hover:scale-[1.01] transition-transform duration-300">
              AYUSH GORA
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base text-slate-300 font-sans font-light leading-relaxed mb-6 max-w-md backdrop-blur-[2px]">
            &ldquo;I build digital experiences and explore the future of technology.&rdquo;
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <a
              href="#projects"
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-purple text-white text-xs font-mono uppercase tracking-widest font-semibold hover:shadow-glow transition-all duration-300 group"
              data-swarm="gather"
            >
              <span>EXPLORE WORK</span>
              <ArrowDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-1" />
            </a>

            <button
              onClick={onOpenResume}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl glass-card text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-white/10 hover:border-accent-cyan transition-all duration-300 group"
              data-swarm="gather"
            >
              <FileDown className="w-3.5 h-3.5 text-accent-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span>VIEW RESUME</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tech Tags */}
        <div className="lg:col-span-5 hidden lg:flex flex-col items-end text-right space-y-3 pointer-events-auto">
          <div className="flex flex-wrap justify-end gap-1.5 max-w-xs">
            {['Python', 'Docker', 'AWS', 'Three.js', 'React', 'Local AI'].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md glass-pill border border-white/10 text-[10px] font-mono text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Center spacer */}
      <div className="flex-1 min-h-[140px] sm:min-h-[220px]" />

      {/* Bottom Dock: Highlights Strip & Scroll Indicator */}
      <div className="relative z-10 w-full pt-4 pointer-events-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl mx-auto text-left">
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-accent-cyan">
              <Terminal className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Education</span>
            </div>
            <p className="text-xs text-white font-medium">B.Tech CSE (Class &lsquo;29)</p>
            <p className="text-[11px] text-slate-400 truncate">GNA University, Phagwara</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-accent-blue">
              <Cloud className="w-4 h-4" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">DevOps &amp; Cloud</span>
            </div>
            <p className="text-xs text-white font-medium">Git, Linux, AWS, Docker</p>
            <p className="text-[11px] text-slate-400 truncate">GCP &amp; CI/CD Pipelines</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-emerald-400">
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Local AI &amp; Tools</span>
            </div>
            <p className="text-xs text-white font-medium">OpenJarvis + Ollama</p>
            <p className="text-[11px] text-slate-400 truncate">Qwen 3.5 &amp; Whisper/TTS</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-accent-purple">
              <Code2 className="w-4 h-4" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">Development</span>
            </div>
            <p className="text-xs text-white font-medium">Python, React, SQL</p>
            <p className="text-[11px] text-slate-400 truncate">FastAPI, Django &amp; Node</p>
          </div>
        </div>

        {/* Subtle Bottom Scroll Hint */}
        <div className="flex justify-center items-center gap-2 pt-4 text-slate-500 text-[10px] font-mono tracking-widest uppercase">
          <span>Scroll to scrub the cinematic sequence</span>
          <ArrowDown className="w-3 h-3 text-accent-cyan animate-bounce" />
        </div>
      </div>
    </section>
  );
}
