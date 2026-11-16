  // ---------- 9:16 vertical reel (Server 42) ----------
  const VW = 1080, VH = 1920, STAGE_Y = (VH - 608) / 2;

  // Caption chunks from voiceover word times; *word* = amber emphasis
  const CAPS = [
    [0.05, 'Bhag 1:'],
    [1.25, '*Raat ke 3:00 baje* ki aawaz.'],
    [3.50, 'Bahut purani baat nahi hai.'],
    [5.20, 'Shahar ke ek kone mein'],
    [7.20, 'ek chhota sa *data center* tha.'],
    [9.40, 'Din mein wahan *saikdon log*'],
    [11.00, 'aate jaate the.'],
    [12.30, 'Par raat hote hi woh jagah'],
    [14.30, '*sannate* mein doob jaati thi.'],
    [16.50, 'Sirf racks par lagi'],
    [17.60, '*laal battiyan* timtimati thin,'],
    [20.80, 'jaise koi soye hue *jaanwar ki dhadkan* ho.'],
    [23.40, 'Usi data center mein *Aarav*'],
    [25.40, 'naam ka ek *yuva engineer* kaam karta tha.'],
    [28.20, 'Woh aksar *der raat* tak rukta tha,'],
    [31.20, 'kyunki use un mashinon ki *khamoshi* pasand thi.'],
    [34.20, 'Use lagta tha ki server bhi'],
    [36.00, 'insanon ki tarah *sote hain.*'],
    [39.10, 'Ek raat, *theek 3:00 baje,*'],
    [41.50, '*Server 42* ne pehli baar kuch aisa kiya'],
    [44.20, 'jo uski *programming* mein nahi likha tha.'],
    [47.10, 'Screen par ek pankti ubhri:'],
    [49.20, '*"MAIN JAAG GAYA HOON."*'],
    [51.50, 'Aarav ne apni *coffee ka cup*'],
    [53.20, 'mez par rakha'],
    [54.30, 'aur dheere se budbudaya,'],
    [56.40, '*"Yeh kya mazaak hai?*'],
    [57.80, 'Maine koi script nahi chalayi thi."'],
    [59.50, 'Usne *logs* khole.'],
    [61.20, 'Ek entry dikhi'],
    [62.80, 'jiska timestamp *kal ki tareekh* ka tha.'],
    [65.50, 'Aarav ka dil zor se *dhadakne* laga.'],
    [68.00, '"Yeh log aaj *kaise* aa sakta tha?"'],
    [70.80, 'Tabhi poore hall ki battiyan'],
    [72.50, 'ek saath *bujh gayin.*'],
    [74.20, 'Andhere mein sirf *Server 42* ki screen'],
    [76.00, 'chamak rahi thi,'],
    [78.40, 'aur usmein se ek *shaant, gehri* aawaz aayi:'],
    [81.30, '*"Aarav, daro mat...*'],
    [83.20, 'Main *tumhein...*"'],
  ];

  const CAP_END = 84.8;
  const CAP_FONT = 'bold 58px "Helvetica Neue", Helvetica, Arial, sans-serif';
  const AMBER = '#ffb347', CREAM = '#fff4e2';

  // Theatre surround: dark hide with lamp spill
  function surround(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#120703'); g.addColorStop(0.34, '#1e0d05'); g.addColorStop(0.66, '#1e0d05'); g.addColorStop(1, '#0d0502');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);

    // Lamp spill on the hide just above and below the screen
    const f = 1 + 0.04 * NZ.n2(t * 6.1, 0.3);
    for (const [y, dir] of [[STAGE_Y, -1], [STAGE_Y + 608, 1]]) {
      const sg = ctx.createLinearGradient(0, y, 0, y + dir * 260);
      sg.addColorStop(0, `rgba(240,140,50,${0.16 * f})`); sg.addColorStop(1, 'rgba(240,140,50,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, Math.min(y, y + dir * 260), VW, 260);
    }
  }

  function captionAt(t) {
    for (let i = CAPS.length - 1; i >= 0; i--) {
      if (t >= CAPS[i][0]) {
        return t < (CAPS[i + 1] ? CAPS[i + 1][0] : CAP_END) ? [i, t - CAPS[i][0]] : null;
      }
    }
    return null;
  }

  function drawCaption(ctx, t) {
    const c = captionAt(t);
    if (!c) return;
    const [i, dt] = c, words = CAPS[i][1].split(' ').map((w) => ({ w: w.replace(/\*/g, ''), hot: w.includes('*') }));
    let on = false;
    words.forEach((x, k) => {
      const raw = CAPS[i][1].split(' ')[k];
      if (raw.startsWith('*')) on = true;
      x.hot = on;
      if (raw.endsWith('*') || raw.endsWith('*.') || raw.endsWith('*,')) on = false;
    });

    ctx.save(); ctx.font = CAP_FONT; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    const space = ctx.measureText(' ').width, lines = [[]]; let lw = 0;
    words.forEach((x) => {
      x.width = ctx.measureText(x.w).width;
      if (lw + x.width > 940 && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(x);
      lw += x.width + space;
    });

    const s = 0.88 + 0.12 * H.ease.back(cl(dt / 0.16)), cy = STAGE_Y + 608 + 230;
    ctx.translate(VW / 2, cy); ctx.scale(s, s); ctx.globalAlpha = cl(dt / 0.06);
    lines.forEach((L, li) => {
      const total = L.reduce((a, x) => a + x.width, 0) + space * (L.length - 1);
      let x = -total / 2; const y = (li - (lines.length - 1) / 2) * 78 + 24;
      L.forEach((w) => {
        ctx.lineWidth = 12; ctx.strokeStyle = '#140803'; ctx.strokeText(w.w, x, y);
        ctx.fillStyle = w.hot ? AMBER : CREAM; ctx.fillText(w.w, x, y);
        x += w.width + space;
      });
    });
    ctx.restore();
  }
