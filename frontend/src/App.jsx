import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SiteBuilderSequence from './animations/SiteBuilderSequence';
import ResumeModal from './components/ResumeModal';
import Footer from './components/Footer';
import SwarmCursor from './animations/SwarmCursor';
import Hero from './sections/Hero';
import ScrollCanvasBackground from './components/ScrollCanvasBackground';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Contact from './sections/Contact';
import { useLenis } from './hooks/useLenis';
import { fetchProfile, fetchProjects, fetchSkills, fetchEducation, fetchAchievements } from './services/api';

export default function App() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Application Data States
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [education, setEducation] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Initialize smooth scrolling
  useLenis();

  // Load portfolio data from Django REST Framework backend
  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, projectsData, skillsData, eduData, achData] = await Promise.all([
          fetchProfile(),
          fetchProjects(),
          fetchSkills(),
          fetchEducation(),
          fetchAchievements(),
        ]);

        if (profileData) setProfile(profileData);
        if (projectsData) setProjects(projectsData);
        if (skillsData) setSkillCategories(skillsData);
        if (eduData) setEducation(eduData);
        if (achData) setAchievements(achData);
      } catch (err) {
        console.warn("Using local verified fallbacks:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 selection:bg-accent-blue selection:text-white">
      {/* 1. Multiplayer Swarm Live Construction Sequence (Joel Califa / Dhvanil Patel style) */}
      {isBuilding && (
        <SiteBuilderSequence
          onComplete={() => setIsBuilding(false)}
        />
      )}

      {/* 2. Continuous Orbiting Swarm Cursors Overlay */}
      <SwarmCursor />

      {/* 3. Global Canvas Background (ezgif-split 192-frame sequence scrubs with whole website scroll) */}
      <ScrollCanvasBackground />

      {/* 4. Navigation Header with Replay & Audio Controls */}
      <Navbar
        onOpenResume={() => setResumeModalOpen(true)}
        onReplayIntro={() => setIsBuilding(true)}
      />

      {/* 5. Main Portfolio Flow */}
      <main className="relative z-10 flex flex-col">
        <Hero onOpenResume={() => setResumeModalOpen(true)} />
        <About profile={profile} />
        <Skills skillCategories={skillCategories} />
        <Projects projects={projects} />
        <Experience education={education} achievements={achievements} />
        <Contact />
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Resume Modal */}
      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
      />
    </div>
  );
}
