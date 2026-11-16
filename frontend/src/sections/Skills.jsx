import React, { useState } from 'react';
import { 
  Code2, Server, Cloud, Cpu, Layout, Terminal, 
  Database, GitBranch, Container, KeyRound, HardDrive, 
  Zap, Palette, FileCode, Layers, Network, TerminalSquare, Boxes, Atom
} from 'lucide-react';

const ICON_MAP = {
  Code2, Server, Cloud, Cpu, Layout, Terminal, 
  Database, GitBranch, Container, KeyRound, HardDrive, 
  Zap, Palette, FileCode, Layers, Network, TerminalSquare, Boxes, Atom
};

export default function Skills({ skillCategories }) {
  const [activeTab, setActiveTab] = useState('all');

  const categories = skillCategories || [];
  
  const allSkills = categories.flatMap(cat => 
    (cat.skills || []).map(skill => ({ ...skill, categoryName: cat.name, categorySlug: cat.slug }))
  );

  const displayedSkills = activeTab === 'all'
    ? allSkills
    : allSkills.filter(s => s.categorySlug === activeTab);

  return (
    <section id="skills" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-background-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-3 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Arsenal</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            TECHNICAL <span className="text-gradient-purple">SKILLS</span>
          </h2>
          <p className="max-w-xl text-slate-400 text-sm mt-3 font-light">
            Proven competencies in modern web engineering, real-time 3D graphics, server architectures, and scalable cloud infrastructure.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-purple to-accent-blue rounded-full mt-4" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-accent-blue text-white shadow-glow border border-accent-blue'
                : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
            }`}
            data-swarm="gather"
          >
            All Disciplines ({allSkills.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                activeTab === cat.slug
                  ? 'bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-glow border border-accent-cyan/40'
                  : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
              }`}
              data-swarm="gather"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Skills Grid with 3D Orbiting Aesthetics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedSkills.map((skill, index) => {
            const IconComponent = ICON_MAP[skill.icon_name] || Cpu;
            return (
              <div
                key={`${skill.name}-${index}`}
                className="group relative glass-card rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-accent-blue/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent-blue/10 flex flex-col justify-between"
                data-swarm="gather"
                data-tilt="true"
              >
                {/* Glowing Corner Indicator */}
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-blue/30 group-hover:bg-accent-cyan group-hover:animate-ping transition-colors" />

                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center text-accent-cyan group-hover:text-white group-hover:border-accent-blue/50 group-hover:scale-110 transition-all duration-300 mb-4 shadow-sm">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Skill Title */}
                  <h3 className="text-base font-display font-bold text-white group-hover:text-gradient-cyan transition-colors mb-1 text-left">
                    {skill.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 font-light leading-relaxed text-left line-clamp-2">
                    {skill.description || "Core engineering competency"}
                  </p>
                </div>

                {/* Category Pill Footer */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{skill.categoryName}</span>
                  <span className="text-accent-cyan/80 group-hover:text-accent-cyan transition-colors">Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

