import React from 'react';
import { Briefcase, GraduationCap, Award, Compass, Terminal, CheckCircle2, Cloud, GitBranch } from 'lucide-react';

export default function Experience({ education, achievements }) {
  const eduList = education || [
    {
      id: 1,
      institution: "GNA University, Phagwara",
      degree: "B.Tech Computer Science Engineering",
      start_year: 2025,
      end_year: 2029,
      is_current: true,
      description: "Undergraduate curriculum covering Computer Science foundations, Distributed Systems, Software Engineering, and Modern Cloud Architectures."
    }
  ];

  const milestones = [
    {
      title: "Undergraduate Engineering (Class of 2029)",
      organization: "GNA University, Phagwara, Punjab",
      period: "2025 – 2029 (Expected)",
      icon: GraduationCap,
      color: "text-accent-blue",
      borderColor: "border-accent-blue/30",
      details: [
        "Enrolled in B.Tech Computer Science Engineering focusing on infrastructure automation and scalable software design.",
        "Preceded by Class XII at Rainbow International School (2025) and Class X at DAV Senior Secondary School (2023).",
      ]
    },
    {
      title: "Hackathons & Innovation Competitions",
      organization: "GNA Cyber Jungle CTF & SIH",
      period: "2025 – 2026",
      icon: Award,
      color: "text-accent-cyan",
      borderColor: "border-accent-cyan/30",
      details: [
        "Competed in GNA Cyber Jungle (Shikar-E-Flag CTF) cybersecurity challenge.",
        "Selected for Smart Campus & Student Life problem statement; explored solutions for SIH26089 (CoopServe).",
      ]
    },
    {
      title: "Google & Microsoft Developer Ecosystem",
      organization: "GDG Jalandhar & Microsoft Learn",
      period: "2025 – 2026",
      icon: Compass,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      details: [
        "Engaged with GDG Jalandhar; participated in DevFest Jalandhar 2026 and Cloud Community Days Chandigarh 2026.",
        "Actively completing Google Cloud Skills Boost / Arcade paths and Microsoft Student Ambassador Community Skiller.",
      ]
    },
    {
      title: "Local AI & Systems Automation",
      organization: "OpenJarvis & DevOps Projects",
      period: "2025 – Present",
      icon: Terminal,
      color: "text-accent-purple",
      borderColor: "border-accent-purple/30",
      details: [
        "Architecting OpenJarvis: an offline AI assistant combining Qwen 3.5 LLM, Kokoro TTS, and Faster Whisper on Windows.",
        "Engineering enterprise frontend demos (MSJ Engineering at msj01demo.netlify.app) and fake account detection analytics.",
      ]
    }
  ];

  return (
    <section id="experience" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-background-secondary/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-3 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Path &amp; Milestones</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            DEVELOPER <span className="text-gradient-purple">JOURNEY</span>
          </h2>
          <p className="max-w-xl text-slate-400 text-sm mt-3 font-light">
            Academic training at GNA University combined with continuous hands-on exploration of cloud systems and full-stack engineering.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full mt-4" />
        </div>

        {/* Timeline Stream */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Glowing Timeline Line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-accent-blue via-accent-cyan to-accent-purple -translate-x-1/2 opacity-30 hidden sm:block" />

          <div className="space-y-12">
            {milestones.map((item, index) => {
              const IconComp = item.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } gap-6 sm:gap-12`}
                >
                  {/* Timeline Center Node */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-background border border-white/20 items-center justify-center shadow-glow z-10">
                    <IconComp className={`w-5 h-5 ${item.color}`} />
                  </div>

                  {/* Content Card */}
                  <div className="w-full sm:w-1/2 text-left">
                    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-accent-cyan">
                          {item.period}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Milestone #{index + 1}</span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mb-4">{item.organization}</p>

                      <ul className="space-y-2.5 text-xs text-slate-300 font-light leading-relaxed">
                        {item.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

