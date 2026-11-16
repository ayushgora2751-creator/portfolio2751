  // ---------- Raat Ke 3:00 Baje Ki Awaaz · Server 42 ----------
  // Word times (s) from the voiceover.
  const WT = {
    bhag1: 0.05,
    raat: 1.25,
    tin_baje: 2.15,
    purani: 3.50,
    shahar: 5.20,
    datacenter: 7.20,

    din: 9.40,
    saikdo: 10.60,
    raat_hote: 12.30,
    sannata: 14.30,
    racks: 16.50,
    lal_battiya: 17.60,
    timtimati: 19.10,
    dharkan: 20.80,

    usi: 23.40,
    aarav: 24.20,
    engineer: 25.40,
    der_raat: 28.20,
    khamoshi: 31.20,
    sote: 34.20,

    ek_raat: 39.10,
    tin_baje_sharp: 40.20,
    server42: 41.50,
    programming: 44.20,
    screen_line: 47.10,
    jaag_gaya: 49.20,

    coffee: 51.50,
    budbudaya: 54.30,
    mazaak: 56.40,
    script: 57.80,
    logs: 59.50,
    entry: 61.20,
    timestamp: 62.80,
    dharakne: 65.50,
    aaj_kaise: 68.00,

    battiya_bujh: 70.80,
    andhere: 74.20,
    server42_screen: 75.50,
    awaaz: 78.40,
    daro_mat: 81.30,
    main_tumhein: 83.20,
    last: 84.40,
  };

  const DURATION = 85.5;
  const LEAD = 0.1;
  const at = (k) => (WT[k] != null ? WT[k] - LEAD : 0);

  const SC = {
    intro: 0.0,
    datacenter: 8.8,
    aarav: 23.0,
    awakens: 38.8,
    logs: 51.0,
    blackout: 70.4,
  };

  const BEATS = [
    { n: 1, name: 'Title & Data Center', t0: 0.0, t1: 8.8, vo: 'भाग एक: रात के 3:00 बजे की आवाज. बहुत पुरानी बात नहीं है। शहर के एक कोने में एक छोटा सा डाटा सेंटर था।', screen: 'भाग 1 · रात के 3:00 बजे की आवाज' },
    { n: 2, name: 'The Sleeping Beast', t0: 8.8, t1: 23.0, vo: 'दिन में वहां सैकड़ों लोग आते जाते थे। पर रात होते ही वह जगह सन्नाटे में डूब जाती थी। सिर्फ रैक्स पर लगी लाल बत्तियां टिमटिमाती थीं, जैसे कोई सोए हुए जानवर की धड़कन हो।', screen: 'DATA CENTER · 3:00 AM' },
    { n: 3, name: 'Aarav, The Engineer', t0: 23.0, t1: 38.8, vo: 'उसी डेटा सेंटर में आरव नाम का एक युवा इंजीनियर काम करता था। वह अक्सर देर रात तक रुकता था क्योंकि उसे उन मशीनों की खामोशी पसंद थी। उसे लगता था कि सर्वर भी इंसानों की तरह सोते हैं।', screen: 'AARAV · 02:59 AM' },
    { n: 4, name: 'Server 42 Awakens', t0: 38.8, t1: 51.0, vo: 'एक रात, ठीक 3:00 बजे, सर्वर 42 ने पहली बार कुछ ऐसा किया जो उसकी प्रोग्रामिंग में नहीं लिखा था। स्क्रीन पर एक पंक्ति उभरी: "मैं जाग गया हूं।"', screen: 'SERVER 42: "मैं जाग गया हूं"' },
    { n: 5, name: 'The Impossible Log', t0: 51.0, t1: 70.4, vo: 'आरव ने अपनी कॉफी का कप मेज पर रखा और धीरे से बुदबुदाया, "यह क्या मजाक है? मैंने कोई स्क्रिप्ट नहीं चलाई थी।" उसने लॉग्स खोले। एक एंट्री दिखी जिसका टाइमस्टैम्प कल की तारीख का था। आरव का दिल जोर से धड़कने लगा। "यह लॉग आज कैसे आ सकता था?"', screen: 'TIMESTAMP: TOMORROW · 03:00:01' },
    { n: 6, name: 'Blackout & The Voice', t0: 70.4, t1: DURATION, vo: 'तभी पूरे हॉल की बत्तियां एक साथ बुझ गईं। अंधेरे में सिर्फ सर्वर 42 की स्क्रीन चमक रही थी और उसमें से एक शांत, गहरी आवाज आई: "आरव, डरो मत। मैं तुम्हें..."', screen: '"आरव, डरो मत..." · TO BE CONTINUED' },
  ];

  const RED = 'rgb(240,60,46)', GOLD = 'rgb(255,214,96)', SKY = 'rgb(140,200,230)', CYAN = 'rgb(70,225,245)', GREEN = 'rgb(110,220,120)';
  const pop = (t, t0, d) => H.ease.back(cl((t - t0) / (d || 0.22)));
  const dip = (t, c) => Math.sin(Math.PI * cl((t - (c - 0.25)) / 0.5));

  // ---------- PROPS & PUPPETS ----------

  // City skyline silhouette with filigree windows and antennas
  function citySkyline(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;
    const w = 1400, h = 340;
    p.beginPath(); p.rect(-w / 2, -h, w, h); p.fill();
    // cut varied building heights
    cut(p, () => {
      p.fillRect(-w / 2 - 10, -h - 20, w + 20, 80);
      for (let x = -650; x < 650; x += 110) {
        const bh = 140 + Math.abs(Math.sin(x * 0.02)) * 140;
        p.clearRect(x, -h, 95, h - bh);
      }
      // window grids
      for (let x = -620; x < 620; x += 36) {
        for (let y = -220; y < -40; y += 32) {
          if (Math.sin(x * 3 + y * 7) > -0.2) p.fillRect(x, y, 14, 18);
        }
      }
    });
    // warm yellow light gels behind windows
    g.fillStyle = GOLD;
    for (let x = -620; x < 620; x += 36) {
      for (let y = -220; y < -40; y += 32) {
        if (Math.sin(x * 3 + y * 7) > -0.2) g.fillRect(x, y, 14, 18);
      }
    }
    both([p, g], (c) => c.restore());
  }

  // Server rack tower with punched slots and glowing LEDs
  function serverRack(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    const w = 150, h = 420;
    p.fillStyle = INK; p.strokeStyle = INK;
    // cabinet body
    p.beginPath(); p.roundRect(-w / 2, -h, w, h, 10); p.fill();
    // rivet perimeter
    for (let y = -h + 16; y <= -16; y += 22) { dot(p, -w / 2 + 8, y, 4); dot(p, w / 2 - 8, y, 4); }
    // cut horizontal server blade trays
    cut(p, () => {
      p.lineWidth = 2.4;
      for (let y = -h + 38; y <= -40; y += 36) {
        p.strokeRect(-w / 2 + 18, y, w - 36, 26);
        // ventilation slots
        for (let sx = -w / 2 + 65; sx <= w / 2 - 28; sx += 11) {
          p.fillRect(sx, y + 6, 4, 14);
        }
        // LED indicator holes
        dot(p, -w / 2 + 28, y + 13, 4.5);
        dot(p, -w / 2 + 42, y + 13, 3.5);
      }
    });

    // LEDs with colored gels
    const pulse = o.pulse || 0;
    const ledColor = o.awake ? CYAN : (o.hot ? RED : `rgba(240, 60, 46, ${0.4 + 0.6 * pulse})`);
    g.fillStyle = ledColor;
    for (let y = -h + 38; y <= -40; y += 36) {
      dot(g, -w / 2 + 28, y + 13, 6);
      if (o.awake) { g.fillStyle = GOLD; dot(g, -w / 2 + 42, y + 13, 5); g.fillStyle = ledColor; }
    }

    // rack plate label
    if (o.label) {
      both([p, g], (c) => { c.save(); c.translate(0, -h + 18); });
      p.fillStyle = INK; p.beginPath(); p.roundRect(-36, -10, 72, 20, 4); p.fill();
      cut(p, () => {
        p.font = `bold 13px ${NF}`; p.textAlign = 'center'; p.textBaseline = 'middle';
        p.fillText(o.label, 0, 1);
      });
      if (o.awake) { g.fillStyle = CYAN; g.fillRect(-32, -8, 64, 16); }
      both([p, g], (c) => c.restore());
    }

    // screen monitor on the rack (if Server 42)
    if (o.screen) {
      const sy = -h + 180;
      p.fillStyle = INK; p.beginPath(); p.roundRect(-w / 2 + 14, sy - 40, w - 28, 80, 6); p.fill();
      cut(p, () => {
        p.beginPath(); p.roundRect(-w / 2 + 20, sy - 34, w - 40, 68, 4); p.fill();
      });
      g.fillStyle = o.screenGel || 'rgb(25, 45, 55)';
      g.beginPath(); p.roundRect(-w / 2 + 20, sy - 34, w - 40, 68, 4); g.fill();
      if (o.screenText) {
        g.font = `bold 14px monospace`; g.fillStyle = o.textGel || CYAN; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(o.screenText, 0, sy);
      }
    }

    if (rods && !o.noRods) rods.push([...wpt(p, 0, 0), 3.5]);
    both([p, g], (c) => c.restore());
  }

  // Engineer Aarav puppet at his workstation
  function aaravPuppet(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s * (o.dir || 1), o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;

    // Torso and sweater/hoodie
    p.beginPath(); p.moveTo(-28, -130); p.lineTo(28, -130); p.lineTo(34, 0); p.lineTo(-34, 0); p.closePath(); p.fill();
    cut(p, () => {
      p.lineWidth = 2.2; p.beginPath(); p.moveTo(-10, -128); p.lineTo(0, -90); p.lineTo(10, -128); p.stroke();
      // lanyard and ID badge
      p.beginPath(); p.moveTo(-6, -118); p.lineTo(-2, -60); p.lineTo(2, -118); p.stroke();
      p.strokeRect(-10, -60, 20, 26);
      dot(p, 0, -47, 3);
    });

    // Head, pinned at neck
    both([p, g], (c) => { c.save(); c.translate(0, -134); c.rotate(o.headTilt || 0); });
    p.beginPath(); p.ellipse(0, -32, 28, 34, 0, 0, TAU); p.fill();
    // hair and spectacles profile
    p.beginPath(); p.arc(0, -38, 30, Math.PI, 0); p.fill();
    for (let k = -2; k <= 3; k++) tear(p, k * 8, -64, 18, 9, -Math.PI / 2 + k * 0.15);
    cut(p, () => {
      // glasses punch
      p.lineWidth = 2.4;
      p.strokeRect(-18, -38, 16, 14);
      p.beginPath(); p.moveTo(-2, -31); p.lineTo(2, -31); p.stroke();
      p.strokeRect(2, -38, 16, 14);
      dot(p, -10, -31, 2.5); dot(p, 10, -31, 2.5);
    });
    // amber reflections on glasses
    g.fillStyle = o.awakeReflect ? CYAN : GOLD;
    dot(g, -10, -31, 4.5); dot(g, 10, -31, 4.5);
    pin(p, 0, 0, 6);
    both([p, g], (c) => c.restore());

    // Articulated arm holding coffee mug
    both([p, g], (c) => { c.save(); c.translate(-24, -120); c.rotate(o.armAngle || 0.2); });
    p.beginPath(); p.roundRect(-10, -5, 20, 95, 8); p.fill();
    // forearm and hand
    both([p, g], (c) => { c.save(); c.translate(0, 85); c.rotate(o.forearm || 0.4); });
    p.beginPath(); p.roundRect(-8, -4, 16, 60, 6); p.fill();
    // Coffee cup in hand
    if (o.cup !== false) {
      p.save(); p.translate(0, 56);
      p.beginPath(); p.roundRect(-12, -18, 24, 28, [2, 2, 8, 8]); p.fill();
      // cup handle
      p.lineWidth = 3; p.beginPath(); p.arc(14, -5, 8, -Math.PI / 2, Math.PI / 2); p.stroke();
      cut(p, () => { p.lineWidth = 1.6; p.strokeRect(-9, -15, 18, 22); });
      g.fillStyle = GOLD; g.fillRect(-8, -14, 16, 20);
      p.restore();
    }
    pin(p, 0, 0, 5);
    if (rods && !o.noRods) rods.push([...wpt(p, 0, 50), 2.5]);
    both([p, g], (c) => c.restore());
    pin(p, 0, 0, 6);
    both([p, g], (c) => c.restore());

    if (rods && !o.noRods) rods.push([...wpt(p, 0, -20), 3.2]);
    both([p, g], (c) => c.restore());
  }

  // Workstation desk with terminal monitor and mug
  function deskTerminal(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    const w = 320, h = 180;
    p.fillStyle = INK; p.strokeStyle = INK;
    // Desk tabletop and legs
    p.fillRect(-w / 2, 0, w, 18);
    p.fillRect(-w / 2 + 20, 18, 16, 140);
    p.fillRect(w / 2 - 36, 18, 16, 140);

    // Monitor on stand
    p.fillRect(-30, -20, 60, 20);
    p.beginPath(); p.roundRect(-100, -170, 200, 140, 8); p.fill();
    cut(p, () => {
      p.beginPath(); p.roundRect(-90, -160, 180, 120, 6); p.fill();
    });
    // Glowing monitor screen
    g.fillStyle = o.screenGel || 'rgb(30, 80, 70)';
    g.beginPath(); g.roundRect(-90, -160, 180, 120, 6); g.fill();

    // Text on monitor
    if (o.lines) {
      g.font = 'bold 12px monospace'; g.fillStyle = o.textGel || 'rgb(120, 240, 180)';
      o.lines.forEach((l, idx) => {
        g.fillText(l, -80, -135 + idx * 22);
      });
    }

    // Keyboard on desk
    p.beginPath(); p.roundRect(-80, -8, 160, 8, 2); p.fill();
    cut(p, () => {
      for (let k = -70; k <= 70; k += 12) dot(p, k, -4, 1.8);
    });

    // Coffee mug sitting on desk
    if (o.deskMug) {
      p.save(); p.translate(110, -14);
      p.beginPath(); p.roundRect(-12, -18, 24, 28, [2, 2, 6, 6]); p.fill();
      p.lineWidth = 3; p.beginPath(); p.arc(14, -5, 7, -Math.PI / 2, Math.PI / 2); p.stroke();
      cut(p, () => { p.lineWidth = 1.5; p.strokeRect(-9, -15, 18, 22); });
      g.fillStyle = GOLD; g.fillRect(-8, -14, 16, 20);
      p.restore();
    }

    both([p, g], (c) => c.restore());
  }

  // Hanging clock board for 03:00 AM
  function clockHanging(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.s, o.s); });
    const w = 260, h = 110;
    p.fillStyle = INK; p.strokeStyle = INK;
    // hanging strings
    p.lineWidth = 2.4;
    p.beginPath(); p.moveTo(-w * 0.35, -h / 2); p.lineTo(-w * 0.35, -600); p.moveTo(w * 0.35, -h / 2); p.lineTo(w * 0.35, -600); p.stroke();
    // board shape
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 14); p.fill();
    for (let x = -w / 2 + 12; x <= w / 2 - 12; x += 18) { dot(p, x, -h / 2, 5); dot(p, x, h / 2, 5); }
    cut(p, () => {
      p.lineWidth = 2.6; p.beginPath(); p.roundRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 8); p.stroke();
      p.font = `bold 52px ${NF}`; p.textAlign = 'center'; p.textBaseline = 'middle';
      p.fillText(o.time || '03:00 AM', 0, 4);
    });
    g.fillStyle = o.gel || RED;
    g.beginPath(); g.roundRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 6); g.fill();
    both([p, g], (c) => c.restore());
  }

  // Holographic / Shadow Log Scroll
  function logCard(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    const w = 460, h = 260;
    p.fillStyle = INK; p.strokeStyle = INK;
    // hanging ropes
    p.lineWidth = 2.2; p.beginPath(); p.moveTo(-w * 0.4, -h / 2); p.lineTo(-w * 0.4, -500); p.moveTo(w * 0.4, -h / 2); p.lineTo(w * 0.4, -500); p.stroke();
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 12); p.fill();
    for (let x = -w / 2 + 14; x <= w / 2 - 14; x += 20) { dot(p, x, -h / 2, 5); dot(p, x, h / 2, 5); }
    cut(p, () => {
      p.lineWidth = 2.4; p.beginPath(); p.roundRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8); p.stroke();
      p.font = 'bold 22px monospace'; p.textAlign = 'left';
      p.fillText('>>> SYSTEM AUDIT LOG <<<', -w / 2 + 30, -h / 2 + 45);
      p.font = '17px monospace';
      p.fillText('SRV-42 [KERNEL EVENT]', -w / 2 + 30, -h / 2 + 85);
      p.fillText('STATUS: SENTIENT_PROMPT', -w / 2 + 30, -h / 2 + 120);
      p.font = 'bold 18px monospace';
      p.fillText(o.timestampText || 'TIMESTAMP: TOMORROW · 03:00:01', -w / 2 + 30, -h / 2 + 165);
    });
    g.fillStyle = 'rgb(255, 230, 160)';
    g.fillRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
    // red highlight banner on tomorrow's timestamp
    if (o.stamp) {
      stamp(p, g, { x: 80, y: 55, s: 1.1, rot: -0.12, text: 'CALENDAR +1 DAY', size: 32 });
    }
    both([p, g], (c) => c.restore());
  }

  // AI Sound Waveform radiating from Server 42
  function aiWaveform(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    const n = 28, step = 14;
    p.fillStyle = INK;
    for (let i = -n / 2; i <= n / 2; i++) {
      const h = (Math.sin(i * 0.4 + o.t * 8) * 0.5 + 0.5) * 70 + 10;
      p.beginPath(); p.roundRect(i * step - 3, -h / 2, 6, h, 3); p.fill();
    }
    g.fillStyle = CYAN;
    for (let i = -n / 2; i <= n / 2; i++) {
      const h = (Math.sin(i * 0.4 + o.t * 8) * 0.5 + 0.5) * 70 + 10;
      g.beginPath(); g.roundRect(i * step - 3, -h / 2, 6, h, 3); g.fill();
    }
    both([p, g], (c) => c.restore());
  }

  // ---------- SCENE RENDERING PIPELINE ----------

  // Main frame generator: pure function of time
  function explainerFrame(ctx, W, Hh, t) {
    const st = begin(W, Hh);

    // Lamp brightness with natural flicker and blackout event at 70.8s
    let lampB = 1.0;
    if (t > at('battiya_bujh')) {
      // sudden blackout!
      lampB = sm(at('battiya_bujh'), at('battiya_bujh') + 0.25, t) < 0.9 ? 0.05 : 0.08 + 0.03 * Math.sin(t * 12);
    } else if (t > 12.0 && t < 22.0) {
      // nighttime moody dimming
      lampB = 0.82 + 0.05 * Math.sin(t * 0.7);
    }

    lamp(ctx, W, Hh, t, lampB, t > at('jaag_gaya') && t < at('jaag_gaya') + 1.2 ? 0.4 : 0);

    // Stage ground & lace borders
    stage(st, t);

    // Scene dispatch
    if (t < SC.datacenter) {
      // ---- SCENE 1: TITLE & CITY INTRO ----
      pup(st, { blur: 1.8 }, (p, g) => citySkyline(p, g, { x: 640, y: 640, s: 1.0 }));
      
      // Hanging Title Board
      const dropU = cl(t / 1.0), dropS = lerp(0.4, 1.0, EO(dropU));
      pup(st, {}, (p, g) => {
        titleCard(p, g, {
          x: 640, y: 260, w: 780, h: 220, s: dropS, rot: swing(t, 0.4, 0.04, 2, 6),
          lines: [
            { text: 'BHAG 1', size: 36, y: -40, italic: true },
            { text: 'RAAT KE 3:00 BAJE KI AAWAZ', size: 48, y: 15, italic: false },
            { text: 'THE DATA CENTER MYSTERY', size: 28, y: 62, italic: true },
          ]
        });
      });

      // Server center badge
      if (t > at('datacenter')) {
        const u = cl((t - at('datacenter')) / 0.15);
        pup(st, {}, (p, g) => {
          stamp(p, g, { x: 640, y: 520, s: lerp(1.6, 1.0, EO(u)), text: 'SECRET DATA CENTER', size: 44, gel: RED });
          crumbs(p, 640, 520, (t - at('datacenter')) / 0.5, 12, 280);
        });
      }

    } else if (t < SC.aarav) {
      // ---- SCENE 2: DAY & NIGHT IN SERVER ROOM ----
      const isNight = t > at('raat_hote');
      const pulse = 0.5 + 0.5 * Math.sin(t * 5.5);

      // Server Racks in Hall
      pup(st, {}, (p, g, rods) => {
        serverRack(p, g, { x: 340, y: 650, s: 1.0, label: 'SRV-10', pulse }, rods);
        serverRack(p, g, { x: 540, y: 650, s: 1.0, label: 'SRV-24', pulse }, rods);
        serverRack(p, g, { x: 740, y: 650, s: 1.0, label: 'SRV-36', pulse }, rods);
        serverRack(p, g, { x: 940, y: 650, s: 1.0, label: 'SRV-42', pulse, screen: true, screenGel: 'rgb(20,40,45)' }, rods);
      });

      // Bustling people passing in daytime, sliding away at night
      if (!isNight) {
        const crowdX = lerp(-200, 1400, (t - SC.datacenter) / 3.4);
        pup(st, { blur: 1.6, alpha: 0.8 }, (p, g, rods) => {
          person(p, g, { x: crowdX, y: 650, s: 0.8, step: t * 8, arm: Math.sin(t * 8) * 0.3 }, rods);
          person(p, g, { x: crowdX - 160, y: 652, s: 0.75, step: t * 8 + 1, arm: Math.cos(t * 8) * 0.3 }, rods);
        });
      } else {
        // Tag "SANNATA" / Silence
        pup(st, {}, (p, g) => {
          tag(p, g, { x: 640, y: 60, rot: swing(t, at('sannata'), 0.08, 3, 7), w: 320, h: 84, text: 'SANNATA · NIGHT SILENCE', size: 30 });
        });
        // Heartbeat badge
        if (t > at('dharkan')) {
          const u = cl((t - at('dharkan')) / 0.15);
          pup(st, {}, (p, g) => {
            stamp(p, g, { x: 640, y: 220, s: lerp(1.5, 1.0, EO(u)) + 0.08 * pulse, text: 'BEAST HEARTBEAT · PULSE', size: 34, gel: RED });
          });
        }
      }

    } else if (t < SC.awakens) {
      // ---- SCENE 3: AARAV AT NIGHT SHIFT ----
      pup(st, { blur: 1.6 }, (p, g) => {
        serverRack(p, g, { x: 280, y: 650, s: 0.9, label: 'SRV-41', pulse: 0.3 });
        serverRack(p, g, { x: 1040, y: 650, s: 0.9, label: 'SRV-42', pulse: 0.4, screen: true });
      });

      // Desk terminal & Aarav seated
      pup(st, {}, (p, g, rods) => {
        deskTerminal(p, g, {
          x: 680, y: 640, s: 1.0, deskMug: false,
          lines: ['USER: AARAV', 'NIGHT SHIFT ACTIVE', 'SYSTEM: NORMAL', 'TIME: 02:58:44']
        });
        aaravPuppet(p, g, {
          x: 540, y: 650, s: 1.0,
          headTilt: Math.sin(t * 1.2) * 0.06,
          armAngle: 0.2 + Math.sin(t * 0.8) * 0.12,
          forearm: 0.4 + Math.sin(t * 0.8) * 0.1,
          cup: true
        }, rods);
      });

      // Name tag: "AARAV · ENGINEER"
      if (t > at('aarav')) {
        pup(st, {}, (p, g) => {
          tag(p, g, { x: 420, y: 120, rot: swing(t, at('aarav'), 0.06, 2, 8), w: 260, h: 80, text: 'AARAV · ENGINEER', size: 28 });
        });
      }

      // "MACHINES SLEEP LIKE HUMANS" plaque
      if (t > at('sote')) {
        pup(st, {}, (p, g) => {
          stamp(p, g, { x: 780, y: 140, s: pop(t, at('sote'), 0.25), text: 'SERVERS ALSO SLEEP', size: 34, gel: GOLD });
        });
      }

    } else if (t < SC.logs) {
      // ---- SCENE 4: 3:00 AM & SERVER 42 AWAKENS ----
      const clockPop = t > at('tin_baje_sharp');

      // Clock drops in
      pup(st, {}, (p, g) => {
        clockHanging(p, g, { x: 640, y: clockPop ? 90 : -200, rot: swing(t, at('tin_baje_sharp'), 0.08, 2, 8), s: 1.0, time: '03:00 AM', gel: RED });
      });

      // Server 42 front and center
      const awakeU = sm(at('server42'), at('server42') + 1.2, t);
      const isAwake = t > at('jaag_gaya');
      pup(st, {}, (p, g, rods) => {
        serverRack(p, g, {
          x: 780, y: 650, s: 1.15, label: 'SERVER 42',
          awake: isAwake,
          pulse: 0.8,
          screen: true,
          screenGel: isAwake ? CYAN : 'rgb(40,20,20)',
          screenText: isAwake ? 'MAIN JAAG GAYA HOON' : 'RUNNING...',
          textGel: isAwake ? '#000' : CYAN
        }, rods);
      });

      // Aarav in disbelief
      pup(st, {}, (p, g, rods) => {
        aaravPuppet(p, g, {
          x: 360, y: 650, s: 1.0,
          headTilt: -0.15 + (isAwake ? 0.08 * Math.sin(t * 15) : 0),
          armAngle: -0.3,
          forearm: 0.8,
          awakeReflect: isAwake,
          cup: true
        }, rods);
      });

      // Screen prompt stamp: "MAIN JAAG GAYA HOON"
      if (t > at('jaag_gaya')) {
        const u = cl((t - at('jaag_gaya')) / 0.14);
        pup(st, {}, (p, g) => {
          stamp(p, g, { x: 640, y: 320, s: lerp(1.7, 1.0, EO(u)), text: 'MAIN JAAG GAYA HOON', size: 48, gel: CYAN });
          crumbs(p, 640, 320, (t - at('jaag_gaya')) / 0.6, 33, 300);
        });
      }

    } else if (t < SC.blackout) {
      // ---- SCENE 5: COFFEE CUP ON DESK & IMPOSSIBLE LOGS ----
      // Aarav placed coffee on desk
      pup(st, {}, (p, g, rods) => {
        deskTerminal(p, g, {
          x: 440, y: 650, s: 1.0, deskMug: true,
          lines: ['LOG VIEWER · KERNEL', '> AUDIT CHECK...', '> ENTRY FOUND: TOMORROW', 'CRITICAL ERROR: TIME_MISMATCH']
        });
        aaravPuppet(p, g, {
          x: 260, y: 650, s: 1.0,
          headTilt: 0.12 + 0.03 * Math.sin(t * 2),
          armAngle: 0.05,
          forearm: 0.2,
          cup: false // cup is on the desk!
        }, rods);
      });

      // Server 42 looming in background
      pup(st, { blur: 1.2 }, (p, g) => {
        serverRack(p, g, { x: 1040, y: 650, s: 1.0, label: 'SRV-42', awake: true, pulse: 1.0, screen: true });
      });

      // Holographic / Shadow Log Scroll
      if (t > at('logs')) {
        const logU = sm(at('logs'), at('logs') + 0.5, t);
        pup(st, {}, (p, g) => {
          logCard(p, g, {
            x: 780, y: lerp(-300, 260, EO(logU)), s: 1.0,
            timestampText: 'TIMESTAMP: 17-NOV · 03:00:01',
            stamp: t > at('timestamp')
          });
        });
      }

      // Heartbeat pulse indicator on Aarav's chest
      if (t > at('dharakne')) {
        const hPulse = 0.5 + 0.5 * Math.sin((t - at('dharakne')) * 16);
        pup(st, {}, (p, g) => {
          stamp(p, g, { x: 440, y: 150, s: 1.0 + 0.12 * hPulse, text: 'HEART RACING · DIL DHADAKNA', size: 30, gel: RED });
        });
      }

    } else {
      // ---- SCENE 6: BLACKOUT & THE MYSTERIOUS VOICE ----
      const blackU = sm(at('battiya_bujh'), at('battiya_bujh') + 0.3, t);

      // Deep dark blackout room: Only Server 42 glows with cyan/spectral light
      pup(st, {}, (p, g, rods) => {
        serverRack(p, g, {
          x: 640, y: 620, s: 1.3, label: 'SERVER 42',
          awake: true, pulse: 1.0,
          screen: true, screenGel: CYAN,
          screenText: 'AARAV, DARO MAT...',
          textGel: '#000'
        }, rods);
      });

      // AI voice soundwave emanating from Server 42
      if (t > at('awaaz')) {
        pup(st, {}, (p, g) => {
          aiWaveform(p, g, { x: 640, y: 320, s: 1.1, t });
        });
      }

      // Aarav's trembling silhouette in the dark, bathed in cyan screen glow
      pup(st, { alpha: 0.9 }, (p, g, rods) => {
        aaravPuppet(p, g, {
          x: 280, y: 650, s: 0.95,
          headTilt: -0.18 + Math.sin(t * 30) * 0.02,
          armAngle: -0.2, forearm: 0.5,
          cup: false,
          awakeReflect: true
        }, rods);
      });

      // Final Dialogue Ribbon & Cliffhanger
      if (t > at('daro_mat')) {
        const u = cl((t - at('daro_mat')) / 0.16);
        pup(st, {}, (p, g) => {
          titleCard(p, g, {
            x: 640, y: 160, w: 720, h: 140, s: lerp(1.4, 1.0, EO(u)),
            lines: [
              { text: '"AARAV, DARO MAT. MAIN TUMHEIN..."', size: 38, y: -8, italic: true },
              { text: 'TO BE CONTINUED · PART 2 COMING SOON', size: 24, y: 36, italic: false }
            ]
          });
        });
      }
    }

    // Explainer depth fern cue at borders
    nearFern(st, t, -1, 0.22);
    nearFern(st, t, 1, 0.22);

    // End frame: rods composite, colored gels, cloth weave, grain, vignette
    end(ctx, st, t);
  }
