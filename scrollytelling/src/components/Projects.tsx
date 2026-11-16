"use client";

import React, { useState } from "react";
import { ExternalLink, Github, Layers, Sparkles, ArrowUpRight } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  stats?: string;
}

const VERIFIED_PROJECTS: Project[] = [
  {
    id: "openjarvis-local-ai",
    title: "OpenJarvis — Local AI Personal Assistant",
    category: "Local AI & Systems Automation",
    description: "Locally hosted offline AI assistant on Windows utilizing OpenJarvis and Ollama. Integrates Qwen 3.5 LLM with speech-to-text (Faster Whisper) and neural text-to-speech (Kokoro TTS) for private desktop automation.",
    tech: ["Python", "Ollama", "OpenJarvis", "Qwen 3.5", "Kokoro TTS", "Faster Whisper"],
    githubUrl: "https://github.com/AyushGora",
    stats: "100% Private Offline Execution",
  },
  {
    id: "fake-account-detection",
    title: "Fake Account Detection Application",
    category: "AI & Machine Learning",
    description: "AI-powered application architected to identify potentially fraudulent social media accounts through user profile feature extraction, behavioral patterns, secure auth, and reporting dashboard.",
    tech: ["React.js", "Python", "FastAPI/Flask", "SQL", "Machine Learning"],
    githubUrl: "https://github.com/AyushGora",
    stats: "Multi-parameter Behavioral Logic",
  },
  {
    id: "msj-engineering",
    title: "MSJ Engineering Consultancy",
    category: "Client & Enterprise Web",
    description: "Professional corporate frontend demonstration deployed live on Netlify for an engineering consultancy to showcase modern web presentation, responsive design, and branding.",
    tech: ["React.js", "HTML", "CSS", "JavaScript", "Netlify"],
    githubUrl: "https://github.com/AyushGora",
    liveUrl: "https://msj01demo.netlify.app",
    stats: "Live on Netlify (msj01demo)",
  },
  {
    id: "frontend-web-demos",
    title: "Frontend Web Demos (JAP & Dhauladhar)",
    category: "Commercial Frontend Showcase",
    description: "Responsive, visually compelling commercial frontend prototypes engineered for luxury interior design (JAP Interior) and hospitality businesses (Dhauladhar Hills Resort).",
    tech: ["React.js", "HTML", "CSS", "JavaScript", "UI/UX"],
    githubUrl: "https://github.com/AyushGora",
    liveUrl: "https://msj01demo.netlify.app",
    stats: "High Fidelity UI Prototypes",
  },
  {
    id: "3d-scrollytelling-portfolio",
    title: "3D Scrollytelling & Swarm Portfolio",
    category: "Creative Dev & Full Stack",
    description: "Production personal portfolio integrating a 192-frame hardware-accelerated canvas scroller, real-time WebGL Three.js objects, Web Audio synthesis, and decoupled Django REST backend.",
    tech: ["Next.js 14", "React", "Three.js", "Framer Motion", "Django REST"],
    githubUrl: "https://github.com/AyushGora/swarm",
    liveUrl: "http://localhost:3000",
    stats: "60 FPS Canvas Scrubbing",
  },
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="work" className="relative z-20 py-32 px-6 sm:px-12 lg:px-20 bg-transparent border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-mono text-accent-cyan uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Selected Works</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            CASE <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple">STUDIES</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-light max-w-xl">
            Real-world systems, interactive creative experiences, and scalable production software engineered by Ayush Gora.
          </p>
        </div>

        {/* Modern Glassmorphic Work Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {VERIFIED_PROJECTS.map((proj, idx) => (
            <div
              key={proj.id}
              className="group relative glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-default"
            >
              {/* Subtle top corner gradient glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-accent-blue/10 rounded-full blur-2xl group-hover:bg-accent-blue/20 transition-all duration-500" />

              <div>
                {/* Category & Index Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-accent-cyan">
                    {proj.category}
                  </span>
                  <span className="text-xs font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-accent-cyan transition-colors mb-3">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed mb-6">
                  {proj.description}
                </p>
              </div>

              <div>
                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {proj.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 text-[10px] font-mono text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Footer Strip with Action Links */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  {proj.stats && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {proj.stats}
                    </span>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="View Source on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={proj.githubUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-cyan hover:text-white text-xs font-mono transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Top / Footer Navigation */}
        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <p>© 2026 Ayush Gora. B.Tech Computer Science Engineering, GNA University.</p>
          <a
            href="#"
            className="hover:text-accent-cyan transition-colors uppercase tracking-wider"
          >
            ↑ Back to Top of Experience
          </a>
        </div>
      </div>
    </section>
  );
}

