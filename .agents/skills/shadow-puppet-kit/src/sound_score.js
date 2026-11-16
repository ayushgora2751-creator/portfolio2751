  // ---------- Sound Score: Synthesized Web Audio for Server 42 ----------
  function scoreSound(k0) {
    const from = window.SOUND_FROM || 0, live = (t) => t >= from - 0.001;
    const k = { ...k0, tone: (t, p) => live(t) && k0.tone(t, p), noise: (t, p) => live(t) && k0.noise(t, p) };

    const gam = (t, n, g = 1, pan = 0, minor = false) => {
      const f = k.hz(n);
      k.tone(t, { f, dur: 2.2, gain: 0.14 * g, a: 0.002, pan, verb: 0.35, minor });
      k.tone(t, { f: f * 1.008, dur: 1.8, gain: 0.08 * g, a: 0.002, pan, verb: 0.35, minor });
      k.tone(t, { f: f * 2.01, dur: 0.6, gain: 0.045 * g, a: 0.002, pan, minor });
      if (f * 2.95 < 2500) k.tone(t, { f: f * 2.95, dur: 0.25, gain: 0.02 * g, a: 0.002, pan, minor });
      k.noise(t, { dur: 0.02, filter: 'bandpass', f: Math.min(2200, f * 1.6), q: 2, gain: 0.08 * g, pan, minor });
    };

    const gong = (t, g = 1) => {
      k.play('thud', t, { f: 80, gain: 0.8 * g });
      k.tone(t, { f: [[0, 95], [4.0, 92]], dur: 4.0, gain: 0.4 * g, a: 0.015, verb: 0.5 });
      k.tone(t, { f: [[0, 96.5], [3.5, 93]], dur: 3.5, gain: 0.2 * g, a: 0.02 });
      k.tone(t, { f: 195, dur: 2.5, gain: 0.12 * g, a: 0.01, verb: 0.4 });
      k.tone(t, { f: 270, dur: 1.6, gain: 0.06 * g, a: 0.01 });
      k.noise(t, { dur: 0.35, color: 'brown', filter: 'lowpass', f: 400, gain: 0.35 * g });
    };

    const tap = (t, f = 640, g = 0.55, pan = 0, minor = true) => {
      k.play('tock', t, { f, gain: g, pan, minor });
      k.noise(t, { dur: 0.015, filter: 'bandpass', f: 1700, q: 2.5, gain: 0.32 * g, a: 0.001, pan, minor });
    };

    const hide = (t, dur, g = 0.5, pan = 0, minor = true) => k.play('paper', t, { dur, gain: g, pan, minor });
    const slide = (t, dur, g = 0.12, minor = true) => k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 260], [dur * 0.5, 520], [dur, 240]], gain: g, a: dur * 0.4, minor });
    const swell = (t, g = 0.35) => k.noise(t, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 500], [0.3, 120], [0.6, 500]], gain: g, a: 0.06, hold: 0.3 });

    // heartbeat thump
    const heartbeat = (t, g = 0.6) => {
      k.play('thud', t, { f: 65, gain: 0.5 * g });
      k.play('thud', t + 0.14, { f: 80, gain: 0.35 * g });
    };

    // Lamp ignite at start
    k.noise(0.04, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.12, 700], [0.45, 180]], gain: 0.4, a: 0.05 });
    [0.18, 0.32, 0.48].forEach((t, i) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300 + i * 300, q: 1.5, gain: 0.12, minor: true }));

    // ---- BEAT 1: INTRO & TITLE
    gam(at('bhag1') + 0.1, 'C4', 0.85);
    k.play('thud', at('raat'), { f: 110, gain: 0.5 });
    tap(at('tin_baje'), 500, 0.6);
    slide(at('shahar'), 0.5, 0.14);
    k.play('stamp', at('datacenter'), { gain: 0.95 });
    hide(at('datacenter') + 0.05, 0.3, 0.4);

    // ---- BEAT 2: DAY & NIGHT IN SERVER ROOM
    // daytime footsteps & bustling sounds
    [9.6, 10.2, 10.8, 11.4].forEach((t, i) => tap(t, 420 + (i % 2) * 80, 0.35, (i % 2 ? 0.3 : -0.3)));
    // night fall swell
    swell(at('raat_hote') - 0.2, 0.4);
    tap(at('sannata'), 320, 0.5);
    // relay clicks on server racks
    [16.8, 17.5, 18.2].forEach((t) => k.play('tick', t, { gain: 0.6 }));
    // heartbeat pulses
    heartbeat(at('timtimati'), 0.5);
    heartbeat(at('dharkan'), 0.7);
    heartbeat(at('dharkan') + 1.2, 0.6);

    // ---- BEAT 3: AARAV AT NIGHT SHIFT
    gam(at('usi'), 'G4', 0.6, -0.3);
    tap(at('aarav'), 600, 0.6);
    // keyboard typing clicks
    k.play('typing', at('engineer') + 0.1, { n: 8, rate: 0.07, gain: 0.55, minor: true });
    // quiet machine drone
    k.tone(at('khamoshi'), { f: 110, dur: 3.5, gain: 0.08, a: 0.8, verb: 0.4 });
    // peaceful chord on "servers sleep like humans"
    gam(at('sote'), 'C4', 0.6, 0);
    gam(at('sote') + 0.15, 'E4', 0.5, 0.3);
    gam(at('sote') + 0.3, 'G4', 0.5, -0.3);

    // ---- BEAT 4: 3:00 AM & SERVER 42 AWAKENS
    swell(at('ek_raat') + 0.2, 0.45);
    // Clock ratchet click on 03:00
    k.play('tick', at('tin_baje_sharp'), { gain: 0.9 });
    tap(at('tin_baje_sharp') + 0.08, 900, 0.7);
    // Server 42 electrical relay pop
    k.play('pop', at('server42'), { f: 450, gain: 0.8 });
    gam(at('server42') + 0.1, 'Eb4', 0.7, 0.3, true); // dissonance
    // typing on terminal screen
    k.play('typing', at('screen_line'), { n: 14, rate: 0.05, gain: 0.7, minor: true });
    // HUGE GONG ON "MAIN JAAG GAYA HOON"
    gong(at('jaag_gaya'), 1.1);

    // ---- BEAT 5: COFFEE & IMPOSSIBLE LOGS
    // Solid ceramic/wood coffee cup THUD on desk
    k.play('thud', at('coffee'), { f: 140, gain: 0.85 });
    tap(at('coffee') + 0.04, 380, 0.6);
    // whisper / mumble paper rustle
    hide(at('budbudaya'), 0.4, 0.4);
    // script keyboard typing
    k.play('typing', at('script'), { n: 10, rate: 0.06, gain: 0.6 });
    // log card drop slide
    slide(at('logs'), 0.5, 0.2);
    tap(at('entry'), 520, 0.6);
    // alarming chord on tomorrow's date
    gam(at('timestamp'), 'Ab4', 0.8, -0.4, true);
    gam(at('timestamp') + 0.1, 'D5', 0.75, 0.4, true);
    // Rapid racing heartbeats
    [65.5, 66.1, 66.7, 67.3, 67.9].forEach((t) => heartbeat(t, 0.8));

    // ---- BEAT 6: BLACKOUT & THE VOICE
    // Sudden electrical pop and lights cutting out
    k.play('pop', at('battiya_bujh'), { f: 220, gain: 1.0 });
    k.noise(at('battiya_bujh') + 0.02, { dur: 0.15, filter: 'bandpass', f: 800, q: 3, gain: 0.4 });
    k.play('thud', at('battiya_bujh') + 0.08, { f: 60, gain: 0.8 });
    // Eerie high pitch resonance in the dark
    k.tone(at('andhere'), { f: 880, dur: 4.0, gain: 0.06, a: 1.0, verb: 0.6 });
    // Resonant AI voice chime: "Aarav, daro mat..."
    gam(at('awaaz'), 'F4', 0.75, 0);
    gam(at('daro_mat'), 'Bb4', 0.9, 0);
    gam(at('daro_mat') + 0.25, 'D5', 0.8, 0.2);
    gam(at('main_tumhein'), 'F5', 0.85, -0.2);
    // Cliffhanger gong resonating into the fadeout
    gong(at('last') - 0.2, 1.0);
  }
