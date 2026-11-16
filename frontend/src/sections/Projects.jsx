import React, { useState } from 'react';
import { ExternalLink, Github, Layers, Sparkles, Eye, ArrowUpRight } from 'lucide-react';

function ProjectCard({ project, onSelect }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg tilt
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className="perspective-1000 group relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-swarm="gather"
      data-tilt="true"
    >
      <div
        className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all duration-200 ease-out flex flex-col justify-between h-full"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 20px 40px -15px rgba(59, 130, 246, 0.25), 0 0 20px 0 rgba(6, 182, 212, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        {/* Thumbnail Preview with Zoom on Hover */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          <img
            src={project.thumbnail_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          {/* Subtle gradient darkener */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Category Chip */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass-pill border border-white/15 text-[11px] font-mono text-accent-cyan uppercase tracking-wider backdrop-blur-md">
            {project.category}
          </div>

          {/* Quick Overlay Preview Action */}
          <button
            onClick={() => onSelect(project)}
            className="absolute bottom-3 right-3 p-2 rounded-xl glass-card text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent-blue"
            aria-label={`View details for ${project.title}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col flex-grow justify-between text-left">
          <div>
            {/* Title */}
            <h3 className="text-xl font-display font-bold text-white group-hover:text-gradient-cyan transition-colors mb-2">
              {project.title}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
              {project.short_description}
            </p>

            {/* Technology Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(project.technologies || []).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] font-mono text-slate-300 group-hover:border-accent-blue/30 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Card Links Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Code</span>
              </a>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">Private Code</span>
            )}

            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-accent-cyan hover:text-white transition-colors group/link"
              >
                <span>Live Demo</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            ) : (
              <button
                onClick={() => onSelect(project)}
                className="flex items-center gap-1 text-xs font-mono text-accent-blue hover:text-white"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all');

  const projectList = projects || [];

  const categories = ['all', ...new Set(projectList.map(p => p.category))];

  const filteredProjects = filter === 'all'
    ? projectList
    : projectList.filter(p => p.category === filter);

  return (
    <section id="projects" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-3 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Proven Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            PROJECT <span className="text-gradient-cyan">SHOWCASE</span>
          </h2>
          <p className="max-w-xl text-slate-400 text-sm mt-3 font-light">
            Real full-stack applications, real-time multiplayer systems, 3D WebGL experiences, and client engineering solutions.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full mt-4" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                filter === cat
                  ? 'bg-accent-blue text-white shadow-glow border border-accent-blue'
                  : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
              }`}
              data-swarm="gather"
            >
              {cat === 'all' ? `All Works (${projectList.length})` : cat}
            </button>
          ))}
        </div>

        {/* Projects Grid with 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              onSelect={setSelectedProject}
            />
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl glass-card rounded-2xl border border-white/20 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 bg-slate-900">
              <img
                src={selectedProject.thumbnail_url}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-accent-cyan px-2.5 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                {selectedProject.category}
              </span>
              <h3 className="text-2xl font-display font-bold text-white">{selectedProject.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {selectedProject.description}
              </p>
              <div className="pt-2">
                <span className="block text-xs font-mono text-slate-400 mb-2 uppercase">Tech Stack:</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.technologies || []).map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-accent-cyan">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                {selectedProject.live_url && (
                  <a
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-mono uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>Visit Live Site</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

