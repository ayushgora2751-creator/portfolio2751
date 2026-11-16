import React, { useState, useEffect } from 'react';
import { Menu, X, FileDown, Sparkles, Terminal, ExternalLink, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function Navbar({ onOpenResume, onReplayIntro }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncMuteState = (e) => {
      if (e?.detail?.isMuted !== undefined) {
        setIsMuted(e.detail.isMuted);
      } else {
        setIsMuted(sound.isMuted);
      }
    };
    window.addEventListener('swarm_audio_mute_change', syncMuteState);
    return () => window.removeEventListener('swarm_audio_mute_change', syncMuteState);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Journey', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="group flex items-center gap-3 text-white font-display text-lg tracking-wider"
          data-swarm="gather"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-purple p-[1px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-background/90 rounded-[11px] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-accent-cyan transition-colors group-hover:text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white group-hover:text-gradient-cyan transition-colors">
              AYUSH GORA
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              DevOps &amp; Creative Web
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs uppercase font-mono tracking-wider text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10"
              data-swarm="gather"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action: Replay Build, Audio Toggle, Resume CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Replay Intro Build Sequence */}
          <button
            onClick={onReplayIntro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all duration-200"
            title="Replay Live Swarm Build Sequence"
            data-swarm="gather"
          >
            <RotateCcw className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="hidden xl:inline">Replay Build</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all duration-200"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            aria-label={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            data-swarm="gather"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-accent-cyan" />}
          </button>

          {/* Resume CTA */}
          <button
            onClick={onOpenResume}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-accent-blue/80 to-accent-cyan/80 hover:from-accent-blue hover:to-accent-cyan border border-white/20 text-white text-xs font-mono uppercase tracking-wider transition-all duration-200 hover:shadow-glow"
            data-swarm="gather"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 border-b border-white/10 backdrop-blur-xl px-4 py-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-mono uppercase tracking-wider text-slate-200 hover:text-accent-cyan py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs font-mono text-slate-400">Synthesizer Audio</span>
              <button
                onClick={handleToggleSound}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-white transition-colors"
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
                aria-label={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-accent-cyan" />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onReplayIntro();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4 text-accent-cyan" />
              <span>Replay Live Build</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResume();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent-blue text-white text-xs font-mono uppercase tracking-wider"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Resume</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
