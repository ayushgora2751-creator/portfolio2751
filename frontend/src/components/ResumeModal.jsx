import React from 'react';
import { X, FileText, Download, Printer, CheckCircle, ExternalLink, Sparkles, Terminal, Award, BookOpen } from 'lucide-react';

export default function ResumeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-card rounded-2xl border border-white/20 p-6 sm:p-10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close Resume Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Resume Header */}
        <div className="border-b border-white/10 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-black tracking-tight text-white">AYUSH GORA</h2>
              <p className="text-sm font-mono text-accent-cyan mt-1">
                B.Tech CSE Student | Aspiring DevOps &amp; Cloud Engineer
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                <span>Punjab, India</span>
                <span>•</span>
                <span className="text-slate-300">Class of 2029</span>
                <span>•</span>
                <a href="https://github.com/AyushGora" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                  GitHub
                </a>
                <span>•</span>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full glass-pill border border-emerald-500/30 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open to Internships</span>
              </span>
            </div>
          </div>
        </div>

        {/* Resume Body */}
        <div className="space-y-8 text-sm text-slate-300">
          {/* Section: Professional Summary */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3 flex items-center gap-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PROFESSIONAL SUMMARY</span>
            </h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 leading-relaxed text-slate-200">
              Motivated Computer Science Engineering student (Class of 2029) with a strong problem-solving mindset and practical approach to learning. Highly curious about infrastructure automation, local AI deployment, and building scalable applications. Actively developing hands-on technical projects to bridge the gap between academic theory and industry practices, with a primary focus on transitioning into Cloud Computing and DevOps Engineering roles.
            </div>
          </div>

          {/* Section: Technical Skills */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3 flex items-center gap-2 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>TECHNICAL SKILLS</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-accent-blue font-semibold mb-2">Cloud &amp; DevOps</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Git, GitHub, Linux Fundamentals.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="text-accent-cyan">Exploring:</span> AWS, GCP, Microsoft Azure, Docker, Kubernetes, CI/CD Pipelines.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-accent-purple font-semibold mb-2">Programming &amp; Web</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Python, Java, SQL, JavaScript, HTML, CSS, React.js, Node.js.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2">AI &amp; Development Tools</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ollama, OpenJarvis, NumPy, Matplotlib.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="text-accent-cyan">Learning:</span> FastAPI, Flask, Qwen 3.5, Kokoro TTS, Faster Whisper.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Project Experience */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3 flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>PROJECT EXPERIENCE</span>
            </h4>
            <div className="space-y-4">
              {/* Project 1 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">OpenJarvis — Local AI Personal Assistant</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-blue/20 text-accent-cyan border border-accent-blue/30">
                      In Development
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Python · Ollama · OpenJarvis · Qwen · Kokoro TTS · Faster Whisper</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Developing a locally hosted, offline AI personal assistant on Windows utilizing OpenJarvis and Ollama.</li>
                  <li>Integrating the Qwen 3.5 LLM alongside speech-to-text (Faster Whisper) and text-to-speech (Kokoro TTS) for seamless voice interaction.</li>
                  <li>Designing a local web-based chat interface to explore future computer automation capabilities securely without external API dependencies.</li>
                </ul>
              </div>

              {/* Project 2 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Fake Account Detection Application</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Planned / In Development
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">React.js · Python · FastAPI/Flask · SQL · Machine Learning</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Architecting an AI-powered application to identify potentially fake social media accounts by analyzing user profiles and behavioral patterns.</li>
                  <li>Planning implementation of secure authentication, AI/ML-based classification logic, and a comprehensive frontend reporting dashboard.</li>
                </ul>
              </div>

              {/* Project 3 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">MSJ Engineering Consultancy Website</span>
                    <a
                      href="https://msj01demo.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-accent-cyan hover:underline"
                    >
                      <span>msj01demo.netlify.app</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">React.js · HTML · CSS · JavaScript · Netlify</span>
                </div>
                <p className="text-xs text-slate-300">
                  Developed and deployed a professional frontend business demonstration for an engineering consultancy to showcase modern web presentation skills.
                </p>
              </div>

              {/* Project 4 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-white text-sm">Frontend Web Demonstrations (JAP Interior &amp; Dhauladhar Hills Resort)</span>
                  <span className="text-[11px] font-mono text-slate-400">React · HTML · CSS · JavaScript</span>
                </div>
                <p className="text-xs text-slate-300">
                  Built responsive, visually appealing frontend prototypes for interior design and hospitality businesses using React, HTML, CSS, and JavaScript.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Hackathons & Community Engagement */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3 flex items-center gap-2 font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>HACKATHONS &amp; COMMUNITY ENGAGEMENT</span>
            </h4>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block font-semibold text-white text-xs mb-1">Hackathon Participation</span>
                <p className="text-xs text-slate-300">
                  Competed in GNA Cyber Jungle (Shikar-E-Flag CTF); selected for Smart Campus &amp; Student Life problem statement; explored solutions for SIH26089 (CoopServe).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block font-semibold text-white text-xs mb-1">Google Developer Ecosystem</span>
                <p className="text-xs text-slate-300">
                  Engaged with GDG Jalandhar; participated in DevFest Jalandhar 2026 and Cloud Community Days Chandigarh 2026. Actively completing Google Cloud Skills Boost / Arcade learning paths.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block font-semibold text-white text-xs mb-1">Microsoft Ecosystem</span>
                <p className="text-xs text-slate-300">
                  Participating in Microsoft Learn student activities and the Microsoft Student Ambassador Community Skiller learning path.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Education */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3 flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>EDUCATION</span>
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="font-semibold text-white text-xs">Bachelor of Technology (B.Tech) in Computer Science and Engineering</span>
                  <span className="text-xs font-mono text-accent-blue">2025 – 2029 (Expected)</span>
                </div>
                <p className="text-xs text-slate-400">GNA University, Phagwara, Punjab</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="font-semibold text-white text-xs">Class XII (Senior Secondary)</span>
                  <span className="text-xs font-mono text-slate-400">2025</span>
                </div>
                <p className="text-xs text-slate-400">Rainbow International School</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="font-semibold text-white text-xs">Class X (Secondary)</span>
                  <span className="text-xs font-mono text-slate-400">2023</span>
                </div>
                <p className="text-xs text-slate-400">DAV Senior Secondary School</p>
              </div>
            </div>
          </div>

          {/* Section: Verified Certifications & Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono uppercase tracking-wider text-accent-cyan mb-2 font-semibold">
                ACTIVE LEARNING &amp; CERTIFICATIONS
              </h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>AWS Cloud Computing Fundamentals</li>
                <li>Google Cloud Skills Boost &amp; Architecture</li>
                <li>Docker &amp; Containerization</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono uppercase tracking-wider text-accent-cyan mb-2 font-semibold">
                PROFESSIONAL STRENGTHS
              </h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Self-Directed Learning &amp; Adaptability</li>
                <li>Complex Problem Solving &amp; Logic</li>
                <li>Cross-Functional Team Collaboration</li>
                <li>Rapid Project Prototyping &amp; Development</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-8 border-t border-white/10">
          <span className="text-xs font-mono text-slate-400">
            Ayush Gora — Resume (Official 2-Page Verified Document)
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <a
              href="#contact"
              onClick={onClose}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-white text-xs font-mono uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Get in Touch</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
