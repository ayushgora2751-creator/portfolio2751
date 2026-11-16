import React from "react";
import ScrollyCanvas from "@/components/ScrollyCanvas";
import Overlay from "@/components/Overlay";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent text-foreground">
      {/* 1. Global Fixed Canvas Background (192 frames from ezgif-split) */}
      <ScrollyCanvas frameCount={192} />

      {/* 2. Content Overlays and Projects Grid */}
      <div className="relative z-10 flex flex-col">
        <Overlay />
        <Projects />
      </div>
    </main>
  );
}

