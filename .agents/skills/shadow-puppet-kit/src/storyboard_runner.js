  // ---------- Storyboard: Key Frames for Server 42 ----------
  const PANELS = [
    {
      beat: 1, t: 4.5,
      flow: 'Opening: The oil lamp warms up behind the cloth screen. The city skyline sits in silhouetted lace with glowing gold window gels. The title card drops on strings: BHAG 1 · RAAT KE 3:00 BAJE KI AAWAZ. On "data center" a red-gel stamp slams down.',
      sound: 'Lamp sputter and whump · wooden rod taps · bronze note on title card · stamp thud on "data center".'
    },
    {
      beat: 2, t: 16.8,
      flow: 'Day into night: Daytime silhouettes of engineers and bustling technicians fade away. Darkness blankets the server room. The tall server racks (SRV-10, 24, 36, 42) emerge with pulsing red LEDs mimicking a sleeping beast\'s heartbeat.',
      sound: 'Distant machinery hum fading into silence · low rhythmic heartbeat pulse on server LEDs.'
    },
    {
      beat: 3, t: 28.5,
      flow: 'Aarav at his terminal: The night-shift engineer puppet sits holding his coffee cup. Warm green phosphor lines glow on his monitor. The tag "AARAV · ENGINEER" drops into place. "SERVERS ALSO SLEEP" stamp appears.',
      sound: 'Soft terminal keyboard clicks · rod movement · gentle bronze chime · calm ambient hum.'
    },
    {
      beat: 4, t: 43.5,
      flow: 'Server 42 Awakens: The hanging clock board flips to 03:00 AM. Server 42 flares with an electric cyan/blue gel. Aarav jerks his head in disbelief. The terminal screen types: "MAIN JAAG GAYA HOON" with hide crumbs scattering.',
      sound: 'Wooden clock ratchet click on 03:00 · sharp electrical relay pop · cyan gel flash · dramatic gong on "main jaag gaya hoon".'
    },
    {
      beat: 5, t: 63.5,
      flow: 'Coffee set down & Impossible Logs: Aarav places his coffee mug onto the table with a thud. He opens the system logs. A large audit log card drops down with tomorrow\'s date (+1 day). Aarav\'s heart rate races with a pulsing warning badge.',
      sound: 'Solid ceramic/wood thud for the coffee mug · log scroll slide · heart pulse beat · alarm-like dissonance.'
    },
    {
      beat: 6, t: 81.5,
      flow: 'Blackout & The Voice: All hall lights extinguish instantly in complete blackout! Only Server 42 glows spectral cyan in the dark. AI waveform bars radiate outwards. The ribbon reads: "AARAV, DARO MAT. MAIN TUMHEIN..." ending on a cliffhanger.',
      sound: 'Sudden electrical blackout pop & power surge · eerie harmonic AI frequency resonance · deep suspended gong reverberation.'
    },
  ];

  const ASSUMED = [
    'Voiceover: Hindi voice recording for Part 1 ("Raat ke 3:00 baje ki aawaz"). Total spoken duration ~84.4s, overall animation timeline DURATION = 85.5s.',
    'Atmosphere & Aesthetic: Authentic Shadow Puppet Theatre conventions — black cut-card silhouettes, punched decorative filigree (destination-out), articulated pivot pins, visible operating rods, and translucent colored gels (red, gold, sky, cyan).',
    'Lighting: Dynamic oil-lamp simulation behind woven fabric. Ambient warmth during narrative setup, moody dimming for the late-night data center, and a total blackout at 70.8s where only Server 42\'s cyan terminal screen illuminates the room.',
    'Sound Design: 100% procedurally synthesized Web Audio nodes — low drone and server hums, rhythmic heartbeat pulses, wooden rod taps, ceramic mug thuds, mechanical clock ratchet clicks, electrical surge pops, and resonant gamelan gongs.',
  ];

  const fmtT = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r.toFixed(1).padStart(4, '0')}`; };

  async function runStoryboard() {
    const specs = ['400 104px "IM Fell English"', 'italic 400 44px "IM Fell English"', '400 190px "Libre Baskerville"'];
    try { await Promise.all(specs.map((f) => document.fonts.load(f, 'AaZz09 →'))); await document.fonts.ready; } catch (e) { /* draw anyway */ }
    const grid = document.getElementById('grid');
    for (const P of PANELS) {
      const B = BEATS.find((b) => b.n === P.beat);
      const fig = document.createElement('figure'); fig.className = 'panel';
      const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720;
      fig.appendChild(cv);
      fig.insertAdjacentHTML('beforeend', `
        <figcaption>
          <div class="head"><span class="num">Beat ${B.n}</span><span class="name">${B.name}</span><span class="time">${fmtT(B.t0)} – ${fmtT(B.t1)}</span></div>
          <dl>
            <dt>On screen</dt><dd class="screen">${B.screen}</dd>
            <dt>Voice</dt><dd class="vo">${B.vo}</dd>
            <dt>How it gets here</dt><dd>${P.flow}</dd>
            <dt>Key sounds</dt><dd>${P.sound}</dd>
            <dt>Frame shown</dt><dd>t = ${P.t.toFixed(2)} s</dd>
          </dl>
        </figcaption>`);
      grid.appendChild(fig);
      const ctx = cv.getContext('2d');
      explainerFrame(ctx, 1280, 720, P.t);
      await new Promise((r) => setTimeout(r, 0));
    }
    document.getElementById('assumed').innerHTML = ASSUMED.map((a) => `<li>${a}</li>`).join('');
    window.STORYBOARD_DONE = true;
  }
  runStoryboard();
