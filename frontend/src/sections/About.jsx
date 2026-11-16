import React from 'react';
import { GraduationCap, Cloud, Compass, Sparkles, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function About({ profile }) {
  const bio = profile?.bio || (
    "Motivated Computer Science Engineering student (Class of 2029) with a strong problem-solving mindset and practical approach to learning. " +
    "Highly curious about infrastructure automation, local AI deployment, and building scalable applications. " +
    "Actively developing hands-on technical projects to bridge the gap between academic theory and industry practices, " +
    "with a primary focus on transitioning into Cloud Computing and DevOps Engineering roles."
  );

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-3 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Profile &amp; Vision</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            ABOUT <span className="text-gradient-cyan">ME</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full mt-4" />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3D Profile Card with Replaceable Placeholder Avatar */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-sm">
              {/* Glowing Aura */}
              <div className="absolute -inset-2 bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

              <div className="relative glass-card rounded-2xl border border-white/10 p-6 overflow-hidden">
                {/* Profile Photo Avatar */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/10 mb-6 group/avatar">
                  {/* Geometric backdrop */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                  
                  {/* Profile Image */}
                  <img
                    src="/profile.jpg"
                    alt="Ayush Gora"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/avatar:scale-105"
                  />

                  {/* Gradient shadow overlay for cyberpunk depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-accent-cyan z-20 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-accent-cyan z-20 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-accent-cyan z-20 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-accent-cyan z-20 pointer-events-none" />
                </div>

                {/* Identity Info */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-white">Ayush Gora</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-cyan border border-accent-blue/20">
                      B.Tech CSE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Phagwara, Punjab, India</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-accent-purple" />
                    <span>Graduation: 2029</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative, Career Goal & Education Timeline */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Bio Prose */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="text-xl font-display font-semibold text-white flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <span>Creative Developer &amp; Future Cloud Architect</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-base font-light">
                {bio}
              </p>
            </div>

            {/* Career Goal Highlight Card */}
            <div className="glass-card rounded-2xl p-6 border border-accent-blue/20 bg-gradient-to-r from-accent-blue/5 via-accent-purple/5 to-transparent flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center shrink-0 text-accent-cyan shadow-glow">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-accent-cyan mb-1">
                  Primary Career Objective
                </h4>
                <p className="text-white font-medium text-base">
                  &ldquo;To become a highly skilled, industry-ready Cloud and DevOps Engineer.&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                  Bridging interactive user experience with resilient cloud architecture, containerized microservices, and continuous delivery pipelines.
                </p>
              </div>
            </div>

            {/* Verified Education Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Formal Education</h4>
                  <h5 className="text-base font-display font-bold text-white">B.Tech Computer Science Engineering</h5>
                </div>
              </div>

              <div className="space-y-2 border-l-2 border-accent-blue/30 pl-4 ml-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">GNA University, Phagwara</span>
                  <span className="text-xs font-mono text-accent-cyan">2025 – 2029</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rigorous academic curriculum covering Algorithms, Operating Systems, Database Management, Computer Networks, and Cloud Infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

