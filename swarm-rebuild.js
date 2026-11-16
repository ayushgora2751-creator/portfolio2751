// swarm-rebuild.js – self‑contained visual rebuild effect
// Drop this script as the first <script> inside <body> on any page.
// It reads configuration from its own <script> tag via data‑attributes.
// No external dependencies.

(function () {
  // ----- Helper utilities ---------------------------------------------------
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const create = (tag, opts = {}) => {
    const el = document.createElement(tag);
    if (opts.id) el.id = opts.id;
    if (opts.cls) el.className = opts.cls;
    if (opts.html) el.innerHTML = opts.html;
    return el;
  };
  const now = () => performance.now();
  const lerp = (a, b, t) => a + (b - a) * t;
  const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // ----- Respect prefers‑reduced‑motion ------------------------------------
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    window.SwarmRebuild = {};
    return;
  }

  // ----- Configuration ------------------------------------------------------
  const scriptEl = document.currentScript;
  const dataset = scriptEl ? scriptEl.dataset : {};
  const cfg = {
    agents: Number(dataset.agents) || 14,
    speed: Number(dataset.speed) || 1, // 1|2|4
    line: Number(dataset.line) || 0.88, // fraction of vh
    bg: dataset.bg || '#000',
    accent: dataset.accent || '#3D8BFF'
  };
  // clamp agents for narrow viewports
  if (window.innerWidth < 640) cfg.agents = Math.min(cfg.agents, 8);

  // ----- CSS injection ------------------------------------------------------
  const style = create('style', { html: `
    /* Prefix all classes/ids with sr- to avoid collisions */
    #sr-root, #sr-scan, #sr-agents, #sr-hud { position: fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; }
    #sr-root { z-index: 2147483000; }
    #sr-scan { z-index: 2147483001; display:flex; align-items:center; justify-content:center; }
    #sr-agents { z-index: 2147483002; }
    #sr-hud { z-index: 2147483003; }
    .sr-lock { overflow:hidden !important; }
    .sr-agent { position:absolute; width:24px; height:24px; transform-origin:0 0; }
    .sr-arrow { fill:currentColor; stroke:white; stroke-width:1.5px; filter: drop-shadow(0 0 2px rgba(0,0,0,0.6)); }
    .sr-ibeam { display:none; }
    .sr-name { position:absolute; top:-20px; left:0; background:rgba(0,0,0,0.7); color:white; padding:2px 6px; border-radius:8px; font-size:10.5px; white-space:nowrap; }
    .sr-hide-paint { background:none !important; background-image:none !important; border-color:transparent !important; box-shadow:none !important; outline:none !important; }
    .sr-hide-media { opacity:0 !important; }
    .sr-w { display:inline; }
    .sr-typed { color:inherit; }
    .sr-rest { color:transparent; -webkit-text-fill-color:transparent !important; }
    /* Scan overlay */
    #sr-scan { background:${cfg.bg}; }
    #sr-scan .sr-glass { width:64px; height:64px; background:rgba(255,255,255,0.15); backdrop-filter:blur(8px); border-radius:12px; animation:sr-pulse 1.6s infinite; }
    @keyframes sr-pulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
  `});
  document.documentElement.appendChild(style);

  // ----- Root elements ------------------------------------------------------
  const root = create('div', { id: 'sr-root' });
  const scan = create('div', { id: 'sr-scan', html: '<div class="sr-glass"></div>' });
  const agentsLayer = create('div', { id: 'sr-agents' });
  const hud = create('div', { id: 'sr-hud' });
  document.documentElement.appendChild(root);
  document.documentElement.appendChild(scan);
  document.documentElement.appendChild(agentsLayer);
  document.documentElement.appendChild(hud);
  document.documentElement.classList.add('sr-lock');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // ----- Agent definitions --------------------------------------------------
  const colors = [
    '#FF5C8A', '#FFC233', '#A970FF', '#2DD4BF', '#4ADE80', '#FF8A3D', '#38BDF8', '#F43F5E',
    '#C084FC', '#FACC15', '#34D399', '#60A5FA', '#FB7185', '#F97316', '#22D3EE', '#A3E635'
  ];
  const names = [
    'Ada','Bo','Cyd','Dex','Eli','Fen','Gus','Hal','Ivy','Jun','Kai','Lux','Mo','Nia','Oz','Pip'
  ];

  const agents = [];
  for (let i = 0; i < cfg.agents; i++) {
    const el = create('div', { cls: 'sr-agent', id: `sr-agent-${i}` });
    const color = colors[i % colors.length];
    const name = names[i % names.length];
    el.style.color = color;
    // Arrow SVG – tip at (0,0)
    const arrow = `<svg class="sr-arrow" width="12" height="20" viewBox="0 0 12 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0V16.5L4.6 12.4L7.6 19L10.4 17.8L7.5 11.3H13.4Z"/></svg>`;
    // I‑beam SVG – hidden, will be shown when typing (not implemented fully)
    const ibeam = `<svg class="sr-ibeam" width="2" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="2" height="20" fill="white"/></svg>`;
    const nameTag = `<div class="sr-name" style="background:${color};">${name}</div>`;
    el.innerHTML = arrow + ibeam + nameTag;
    agentsLayer.appendChild(el);
    agents.push({ el, color, name, pos:{x:0,y:0}, target:{x:0,y:0} });
  }

  // ----- Scan animation -----------------------------------------------------
  const startTime = now();
  const speedFactor = cfg.speed; // 1,2,4
  const ellipse = {
    cx: window.innerWidth / 2,
    cy: window.innerHeight * cfg.line,
    rx: Math.min(window.innerWidth * 0.32, 230),
    ry: Math.min(window.innerHeight * 0.28, 170)
  };

  // assign each agent to a flock (0,1,2) and a phase offset
  agents.forEach((ag, idx) => {
    const flock = idx % 3;
    const direction = flock === 1 ? -1 : 1; // flock 1 opposite direction
    ag.flock = flock;
    ag.dir = direction;
    ag.phase = (idx / agents.length) * Math.PI * 2; // spread evenly
  });

  // Mouse tracking state
  const mouse = {
    x: 0,
    y: 0,
    dirX: 0,
    dirY: 0,
    lastMove: 0,
    present: false,
    lastScroll: now()
  };

  function updateMouseDir(dx, dy) {
    const dist = Math.hypot(dx, dy);
    const blend = Math.min(1, dist / 40);
    const ndx = dx / (dist || 1);
    const ndy = dy / (dist || 1);
    mouse.dirX = (1 - blend) * mouse.dirX + blend * ndx;
    mouse.dirY = (1 - blend) * mouse.dirY + blend * ndy;
    const norm = Math.hypot(mouse.dirX, mouse.dirY) || 1;
    mouse.dirX /= norm;
    mouse.dirY /= norm;
  }

  // pointermove listener (mouse only)
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const dx = e.clientX - mouse.x;
    const dy = e.clientY - mouse.y;
    const dmove = Math.hypot(dx, dy);
    if (dmove > 2) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastMove = now();
      updateMouseDir(dx, dy);
    }
  });
  // mouse leave / blur handling
  document.documentElement.addEventListener('mouseleave', () => { mouse.present = false; });
  window.addEventListener('blur', () => { mouse.present = false; });
  document.documentElement.addEventListener('mouseenter', () => { mouse.present = true; });
  // scroll tracking
  window.addEventListener('scroll', () => { mouse.lastScroll = now(); });

  // Build‑phase state (unchanged, extended later)
  const buildState = {
    layers: [],            // All layers from collection
    pending: [],           // Layers not yet triggered
    active: [],            // Agents currently working
    free: [],              // Agents idle
    lastUpdate: 0,
    speed: cfg.speed,
    line: cfg.line,
    toolbar: null,
    hudVisible: false,
    mouseFree: false // whether swarm is free to follow mouse
  };

  // Helper to create a selection frame around a layer (unchanged)
function createFrame(targetEl) {
  const f = document.createElement('div');
  f.className = 'sr-frame';
-  f.style.position = 'fixed';
+  // Use absolute positioning so the frame moves with page scroll
+  f.style.position = 'absolute';
   f.style.border = `1px solid ${cfg.accent}`;
   f.style.pointerEvents = 'none';
   const handleStyle = `position:absolute;width:7px;height:7px;background:white;border:1px solid ${cfg.accent};`;
   ['tl','tr','bl','br'].forEach(c => {
     const h = document.createElement('div');
@@
  function createFrame(targetEl) {
    const frame = document.createElement('div');
    frame.className = 'sr-frame';
    frame.style.position = 'fixed';
    frame.style.border = `1px solid ${cfg.accent}`;
    frame.style.pointerEvents = 'none';
    // handles
    const handleStyle = `position:absolute;width:7px;height:7px;background:white;border:1px solid ${cfg.accent};`;
    ['tl','tr','bl','br'].forEach(c => {
      const h = document.createElement('div');
      h.className = `sr-handle sr-${c}`;
      h.style.cssText = handleStyle;
      frame.appendChild(h);
    });
    // size label
    const label = document.createElement('div');
    label.className = 'sr-size-label';
    label.style.position = 'absolute';
    label.style.bottom = '-20px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.background = cfg.accent;
    label.style.color = 'white';
    label.style.font = '10px monospace';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '4px';
    frame.appendChild(label);
    document.body.appendChild(frame);
    return frame;
  }

  // Main animation loop – reads then writes (dt capped at 50 ms)
  function buildLoop(timestamp) {
    const dt = Math.min(timestamp - buildState.lastUpdate, 50);
    buildState.lastUpdate = timestamp;

    // Determine if swarm is free to follow mouse
    const idleNoTask = buildState.active.length === 0 && buildState.free.length > 0;
    const noPending = buildState.pending.filter(l => !l.finished && l.triggered).length === 0;
    const scrollIdle = now() - mouse.lastScroll > 500;
    const mouseActive = mouse.present && now() - mouse.lastMove < 350;
    const wasFree = buildState.mouseFree;
    buildState.mouseFree = mouseActive && scrollIdle && idleNoTask && noPending;

    // READ phase ------------------------------------------------------------
    const vh = window.innerHeight;
    buildState.pending.forEach(l => {
      if (l.finished) return;
      const r = l.el.getBoundingClientRect();
      l.rect = r;
      if (!l.triggered && r.top < vh * buildState.line) {
        l.triggered = true;
      }
      if (r.bottom < -60 || (l.triggered && (r.width === 0 && r.height === 0)) || r.right < 0 || r.left > window.innerWidth) {
        l.finished = true;
        l.el.classList.remove('sr-hide-paint', 'sr-hide-media');
        l.el.classList.remove('sr-reveal');
      }
    });

    // Agent picking – free agents take pending layers (unchanged logic)
    if (!buildState.mouseFree) {
      buildState.free.forEach(agent => {
        const eligible = buildState.pending.filter(l => !l.assigned && l.triggered && (!l.parent || l.parent.started));
        if (eligible.length === 0) return;
        let best = null; let bestScore = Infinity;
        eligible.forEach(l => {
          const dx = l.rect.left - agent.pos.x;
          const dy = l.rect.top - agent.pos.y;
          const dist = Math.hypot(dx, dy);
          const score = l.rect.top + 0.3 * dist;
          if (score < bestScore) { bestScore = score; best = l; }
        });
        if (best) {
          best.assigned = agent;
          agent.task = { layer: best, phase: 'travel' };
          const idx = buildState.free.indexOf(agent);
          if (idx >= 0) buildState.free.splice(idx, 1);
          buildState.active.push(agent);
        }
      });
    }

    // Active agents update ---------------------------------------------------
    buildState.active.forEach(agent => {
      const t = agent.task;
      const layer = t.layer;
      const rect = layer.rect;
      const k = 6 + 3 * buildState.speed;
      switch (t.phase) {
        case 'travel': {
          const targetX = rect.left;
          const targetY = rect.top;
          const dtSec = dt / 1000;
          agent.pos.x = lerp(agent.pos.x, targetX, 1 - Math.exp(-k * dtSec));
          agent.pos.y = lerp(agent.pos.y, targetY, 1 - Math.exp(-k * dtSec));
          const vx = targetX - agent.pos.x;
          const vy = targetY - agent.pos.y;
          const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
          const arrow = agent.el.querySelector('.sr-arrow');
          if (arrow) arrow.style.transform = `rotate(${angle}deg)`;
          if (Math.abs(agent.pos.x - targetX) < 2 && Math.abs(agent.pos.y - targetY) < 2) {
            const frame = createFrame(layer.el);
            layer.frame = frame;
            layer.started = true;
            t.phase = 'draw';
            t.startTime = timestamp;
          }
          break;
        }
        case 'draw': {
          const elapsed = timestamp - t.startTime;
          const dur = 220 + Math.min(340, Math.sqrt(rect.width * rect.height) / 1600 * 1000);
          const prog = Math.min(elapsed / dur, 1);
          const eased = 1 - Math.pow(1 - prog, 3);
          const w = rect.width * eased;
          const h = rect.height * eased;
          const f = layer.frame;
          f.style.left = rect.left + 'px';
          f.style.top = rect.top + 'px';
          f.style.width = w + 'px';
          f.style.height = h + 'px';
          agent.el.style.transform = `translate(${rect.left + w}px, ${rect.top + h}px)`;
          f.querySelector('.sr-size-label').textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
          if (prog >= 1) {
            t.phase = 'fill';
            t.startTime = timestamp;
          }
          break;
        }
        case 'fill': {
          const elapsed = timestamp - t.startTime;
          if (!layer.revealed) { layer.el.classList.add('sr-reveal'); layer.revealed = true; }
          if (elapsed > 800) {
            const wiggle = Math.sin((elapsed - 800) / 100) * 4;
            agent.el.style.transform = `translate(${layer.rect.left + layer.rect.width + wiggle}px, ${layer.rect.top + layer.rect.height}px)`;
            if (elapsed > 1120) {
              if (layer.type === 'text') {
                t.phase = 'type';
                t.startTime = timestamp;
                const ibeam = agent.el.querySelector('.sr-ibeam');
                const arrow = agent.el.querySelector('.sr-arrow');
                if (ibeam && arrow) { arrow.style.display = 'none'; ibeam.style.display = '' ; }
                const caret = document.createElement('div');
                caret.className = 'sr-caret';
                caret.style.position = 'fixed';
                caret.style.width = '2px';
                caret.style.height = '1em';
                caret.style.background = cfg.accent;
                caret.style.pointerEvents = 'none';
                document.body.appendChild(caret);
                layer.caret = caret;
              } else {
                t.phase = 'hold';
                t.startTime = timestamp;
              }
            }
          }
          break;
        }
        case 'type': {
          const elapsed = timestamp - t.startTime;
          const totalChars = layer.el.querySelector('.sr-rest').textContent.length;
          const duration = Math.min(Math.max(totalChars * 18, 250), 1300);
          const prog = Math.min(elapsed / duration, 1);
          const typedCount = Math.floor(prog * totalChars);
          const typedSpan = layer.el.querySelector('.sr-typed');
          const restSpan = layer.el.querySelector('.sr-rest');
          const full = restSpan.textContent;
          typedSpan.textContent = full.slice(0, typedCount);
          restSpan.textContent = full.slice(typedCount);
          const rects = typedSpan.getClientRects();
          let caretX, caretY;
          if (rects.length) { const r = rects[rects.length - 1]; caretX = r.right; caretY = r.top; }
          else { const r = restSpan.getClientRects()[0]; caretX = r.left; caretY = r.top; }
          layer.caret.style.left = caretX + 'px';
          layer.caret.style.top = caretY + 'px';
          if (prog >= 1) { t.phase = 'hold'; t.startTime = timestamp; }
          break;
        }
        case 'hold': {
          if (timestamp - t.startTime > 160) {
            const w = layer.el.querySelector('.sr-w');
            if (w) {
              const full = w.querySelector('.sr-rest').textContent;
              layer.el.textContent = full;
            }
            const f = layer.frame;
            f.style.transition = 'opacity 0.25s';
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 260);
            if (layer.caret) layer.caret.remove();
            layer.finished = true;
            const idx = buildState.active.indexOf(agent);
            if (idx >= 0) buildState.active.splice(idx, 1);
            buildState.free.push(agent);
            const nameTag = agent.el.querySelector('.sr-name');
            if (nameTag) nameTag.style.display = 'none';
          }
          break;
        }
      }
    });

    // FREE agents behavior ---------------------------------------------------
    if (buildState.mouseFree) {
      // Follow mouse tail or circle
      const tNow = now() / 1000;
      buildState.free.forEach((agent, i) => {
        const lag = 34 + (i % 5) * 11;
        const spread = (((i * 37) % 60) - 30) * 0.9;
        const k = 3.2 + (i % 4) * 0.9;
        if (mouseActive) {
          // aim behind mouse
          const targetX = mouse.x - mouse.dirX * lag + (-mouse.dirY) * spread;
          const targetY = mouse.y - mouse.dirY * lag + (mouse.dirX) * spread;
          const dtSec = dt / 1000;
          agent.pos.x = lerp(agent.pos.x, targetX, 1 - Math.exp(-k * dtSec));
          agent.pos.y = lerp(agent.pos.y, targetY, 1 - Math.exp(-k * dtSec));
          const vx = targetX - agent.pos.x;
          const vy = targetY - agent.pos.y;
          const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
          agent.el.querySelector('.sr-arrow').style.transform = `rotate(${angle}deg)`;
        } else {
          // circle around mouse
          const n = buildState.free.length;
          const radius = Math.max(46, n * 4.4);
          const angle = (2 * Math.PI * i) / n + tNow * 0.35;
          const targetX = mouse.x + Math.cos(angle) * radius;
          const targetY = mouse.y + Math.sin(angle) * radius;
          const kC = 5;
          const dtSec = dt / 1000;
          agent.pos.x = lerp(agent.pos.x, targetX, 1 - Math.exp(-kC * dtSec));
          agent.pos.y = lerp(agent.pos.y, targetY, 1 - Math.exp(-kC * dtSec));
          agent.el.querySelector('.sr-arrow').style.transform = `rotate(${angle * 180 / Math.PI + 90}deg)`;
        }
        agent.el.style.transform = `translate(${agent.pos.x}px, ${agent.pos.y}px)`;
      });
    } else {
      // wandering when not free
      buildState.free.forEach(agent => {
        if (!agent.wanderTarget || timestamp - agent.wanderStart > (1200 + Math.random() * 2000)) {
          agent.wanderTarget = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight * 0.88 };
          agent.wanderStart = timestamp;
        }
        const k = 1.4;
        const dtSec = dt / 1000;
        agent.pos.x = lerp(agent.pos.x, agent.wanderTarget.x, 1 - Math.exp(-k * dtSec));
        agent.pos.y = lerp(agent.pos.y, agent.wanderTarget.y, 1 - Math.exp(-k * dtSec));
        agent.el.style.transform = `translate(${agent.pos.x}px, ${agent.pos.y}px)`;
        const arrow = agent.el.querySelector('.sr-arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
      });
    }

    // HUD visibility ---------------------------------------------------------
    const anyWorking = buildState.active.length > 0 || buildState.mouseFree;
    if (anyWorking && !buildState.hudVisible) { showHUD(); buildState.hudVisible = true; }
    else if (!anyWorking && buildState.hudVisible) { hideHUD(); buildState.hudVisible = false; }

    requestAnimationFrame(buildLoop);
  }

  // Toolbar creation (unchanged, but add skip handling at done state)
  function createHUD() {
    const hud = document.createElement('div');
    hud.id = 'sr-hud';
    hud.style.position = 'fixed';
    hud.style.left = '50%';
    hud.style.bottom = `calc(18px + env(safe-area-inset-bottom))`;
    hud.style.transform = 'translateX(-50%)';
    hud.style.background = 'rgba(22,23,27,.9)';
    hud.style.backdropFilter = 'blur(14px)';
    hud.style.borderRadius = '13px';
    hud.style.padding = '6px 12px';
    hud.style.display = 'flex';
    hud.style.alignItems = 'center';
    hud.style.gap = '8px';
    hud.style.zIndex = '2147483005';
    const avatars = document.createElement('div');
    avatars.style.display = 'flex';
    avatars.style.gap = '2px';
    for (let i = 0; i < Math.min(5, agents.length); i++) {
      const dot = document.createElement('div');
      dot.textContent = agents[i].name.charAt(0);
      dot.style.width = dot.style.height = '12px';
      dot.style.borderRadius = '50%';
      dot.style.background = agents[i].color;
      dot.style.color = 'white';
      dot.style.fontSize = '8px';
      dot.style.display = 'flex';
      dot.style.alignItems = 'center';
      dot.style.justifyContent = 'center';
      avatars.appendChild(dot);
    }
    hud.appendChild(avatars);
    const status = document.createElement('span');
    status.id = 'sr-status';
    status.textContent = `Scanning page… ${buildState.layers.length || 0} layers`;
    hud.appendChild(status);
    const progress = document.createElement('div');
    progress.id = 'sr-progress';
    progress.style.width = '64px';
    progress.style.height = '6px';
    progress.style.background = '#444';
    progress.style.position = 'relative';
    const bar = document.createElement('div');
    bar.style.width = '0%';
    bar.style.height = '100%';
    bar.style.background = cfg.accent;
    progress.appendChild(bar);
    hud.appendChild(progress);
    const btnTour = document.createElement('button');
    btnTour.textContent = 'Tour';
    btnTour.style.background = 'none';
    btnTour.style.border = 'none';
    btnTour.style.color = 'white';
    btnTour.style.cursor = 'pointer';
    hud.appendChild(btnTour);
    const btnSpeed = document.createElement('button');
    btnSpeed.textContent = `${buildState.speed}×`;
    btnSpeed.style.background = 'none';
    btnSpeed.style.border = 'none';
    btnSpeed.style.color = 'white';
    btnSpeed.style.cursor = 'pointer';
    hud.appendChild(btnSpeed);
    const btnClose = document.createElement('button');
    btnClose.textContent = '×';
    btnClose.style.background = 'none';
    btnClose.style.border = 'none';
    btnClose.style.color = 'white';
    btnClose.style.cursor = 'pointer';
    hud.appendChild(btnClose);
    document.body.appendChild(hud);
    btnTour.addEventListener('click', () => startTour());
    btnSpeed.addEventListener('click', () => {
      buildState.speed = buildState.speed === 1 ? 2 : buildState.speed === 2 ? 4 : 1;
      btnSpeed.textContent = `${buildState.speed}×`;
    });
    btnClose.addEventListener('click', () => skip());
    buildState.toolbar = hud;
  }

  function showHUD() { if (!buildState.toolbar) createHUD(); buildState.toolbar.style.opacity = '1'; }
  function hideHUD() { if (buildState.toolbar) buildState.toolbar.style.opacity = '0'; }

  // Tour implementation (unchanged)
  let tourActive = false;
  function startTour() {
    if (tourActive) return;
    tourActive = true;
    const scrollStep = () => {
      if (!tourActive) return;
      const pending = buildState.pending.filter(l => !l.finished).length;
      const total = buildState.pending.length;
      if (pending / total < 0.4) { tourActive = false; return; }
      window.scrollBy(0, 240 * buildState.speed);
      requestAnimationFrame(scrollStep);
    };
    requestAnimationFrame(scrollStep);
  }

  function skip() {
    // finish instantly and then animate agents off-screen
    buildState.pending.forEach(l => {
      if (!l.finished) { l.el.classList.remove('sr-hide-paint', 'sr-hide-media'); l.finished = true; }
    });
    // animate agents off nearest side over 1.8s
    const width = window.innerWidth;
    const height = window.innerHeight;
    agents.forEach(agent => {
      const toLeft = agent.pos.x < width / 2;
      const targetX = toLeft ? -50 : width + 50;
      const targetY = agent.pos.y;
      const start = now();
      const animateOff = (t) => {
        const progress = Math.min((t - start) / 1800, 1);
        agent.pos.x = lerp(agent.pos.x, targetX, progress);
        agent.el.style.transform = `translate(${agent.pos.x}px, ${agent.pos.y}px)`;
        if (progress < 1) requestAnimationFrame(animateOff);
        else agent.el.remove();
      };
      requestAnimationFrame(animateOff);
    });
    if (buildState.toolbar) {
      const status = buildState.toolbar.querySelector('#sr-status');
      status.textContent = `Rebuilt ${buildState.pending.length} layers in ${(now() - startTime)/1000:.1f}s`;
      const btns = buildState.toolbar.querySelectorAll('button');
      btns.forEach(b => b.style.display = 'none');
    }
  }

  function replay() {
    window.location.reload();
  }

  // Expose API
  window.SwarmRebuild = { replay, skip, setSpeed: v=>{buildState.speed=v;}, tour:startTour, get layers(){return buildState.pending;} };

  // After scan fade out, start layer collection then build loop
  function afterScan() {
    scan.remove();
    document.documentElement.classList.remove('sr-lock');
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    collectLayers().then(() => {
      // rebuild pending array by walking DOM
      const all = [];
      const skipTags = new Set(['SCRIPT','STYLE','TEMPLATE','META','BR','HEAD','HTML']);
      const srRootIds = new Set(['sr-root','sr-scan','sr-agents','sr-hud']);
      function walk(node,parent){
        if(!node||node.nodeType!==Node.ELEMENT_NODE) return;
        const el=node;
        if(srRootIds.has(el.id)||el.id?.startsWith('sr-')||skipTags.has(el.tagName)) return;
        const style=getComputedStyle(el);
        if(style.display==='none'||el.hasAttribute('data-sr-skip')) return;
        let type=null;
        const mediaTags=['IMG','SVG','CANVAS','VIDEO','AUDIO','PICTURE','INPUT','TEXTAREA','SELECT','IFRAME','HR','PROGRESS','METER','OBJECT','EMBED'];
        if(mediaTags.includes(el.tagName)) type='media';
        else if(style.backgroundColor && style.backgroundColor!=='rgba(0, 0, 0, 0)' && style.backgroundColor!=='transparent') type='box';
        else if(style.boxShadow && style.boxShadow!=='none') type='box';
        else if(style.borderTopWidth!=='0px' && style.borderTopStyle!=='none') type='box';
        const hasChildren=el.children.length>0;
        const txt=el.textContent.trim();
        if(!hasChildren && txt) type='text';
        if(type){
          const layer={el,type,parent,triggered:false,finished:false,assigned:null};
          all.push(layer);
          parent=layer;
        }
        Array.from(el.childNodes).forEach(c=>walk(c,parent));
      }
      walk(document.body,null);
      buildState.pending = all;
      buildState.free = agents.slice();
      requestAnimationFrame(buildLoop);
    });
  }

  // replace previous animation start
  requestAnimationFrame(() => { animate(); });

  const originalAnimate = animate;
  function animate() {
    const t = (now() - startTime) / 1000 * speedFactor;
    agents.forEach(ag => {
      const ang = ag.phase + ag.dir * t * 0.8;
      const tx = ellipse.cx + ellipse.rx * Math.cos(ang) + (Math.random() - 0.5) * 20;
      const ty = ellipse.cy + ellipse.ry * Math.sin(ang) + (Math.random() - 0.5) * 20;
      const dt = 0.016; const k = 4;
      ag.pos.x = lerp(ag.pos.x, tx, 1 - Math.exp(-k * dt));
      ag.pos.y = lerp(ag.pos.y, ty, 1 - Math.exp(-k * dt));
      ag.el.style.transform = `translate(${ag.pos.x}px, ${ag.pos.y}px)`;
      const vx = tx - ag.pos.x; const vy = ty - ag.pos.y;
      const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
      const arrow = ag.el.querySelector('.sr-arrow');
      if (arrow) arrow.style.transform = `rotate(${angle}deg)`;
    });
    if (t < 1.9) {
      requestAnimationFrame(animate);
    } else {
      scan.style.transition = 'opacity 0.55s';
      scan.style.opacity = '0';
      setTimeout(afterScan, 550);
    }
  }
})();
  const startTime = now();
  const speedFactor = cfg.speed; // 1,2,4
  const ellipse = {
    cx: window.innerWidth / 2,
    cy: window.innerHeight * cfg.line,
    rx: Math.min(window.innerWidth * 0.32, 230),
    ry: Math.min(window.innerHeight * 0.28, 170)
  };

  // assign each agent to a flock (0,1,2) and a phase offset
  agents.forEach((ag, idx) => {
    const flock = idx % 3;
    const direction = flock === 1 ? -1 : 1; // flock 1 opposite direction
    ag.flock = flock;
    ag.dir = direction;
    ag.phase = (idx / agents.length) * Math.PI * 2; // spread evenly
  });

  // Build‑phase state
  const buildState = {
    layers: [],            // All layers from collection
    pending: [],           // Layers not yet triggered
    active: [],            // Agents currently working
    free: [],              // Agents idle
    lastUpdate: 0,
    speed: cfg.speed,
    line: cfg.line,
    toolbar: null,
    hudVisible: false
  };

  // Helper to create a selection frame around a layer
  function createFrame(targetEl) {
    const frame = document.createElement('div');
    frame.className = 'sr-frame';
    frame.style.position = 'fixed';
    frame.style.border = `1px solid ${cfg.accent}`;
    frame.style.pointerEvents = 'none';
    // handles
    const handleStyle = `position:absolute;width:7px;height:7px;background:white;border:1px solid ${cfg.accent};`;
    ['tl','tr','bl','br'].forEach(c => {
      const h = document.createElement('div');
      h.className = `sr-handle sr-${c}`;
      h.style.cssText = handleStyle;
      frame.appendChild(h);
    });
    // size label
    const label = document.createElement('div');
    label.className = 'sr-size-label';
    label.style.position = 'absolute';
    label.style.bottom = '-20px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.background = cfg.accent;
    label.style.color = 'white';
    label.style.font = '10px monospace';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '4px';
    frame.appendChild(label);
    document.body.appendChild(frame);
    return frame;
  }

  // Main animation loop – reads then writes (dt capped at 50 ms)
  function buildLoop(timestamp) {
    const dt = Math.min(timestamp - buildState.lastUpdate, 50);
    buildState.lastUpdate = timestamp;

    // READ phase ------------------------------------------------------------
    // 1. Update pending layer rects, trigger conditions
    const vh = window.innerHeight;
    buildState.pending.forEach(l => {
      if (l.finished) return;
      const r = l.el.getBoundingClientRect();
      l.rect = r;
      // trigger when top passes build line
      if (!l.triggered && r.top < vh * buildState.line) {
        l.triggered = true;
      }
      // instant finish conditions
      if (r.bottom < -60 || (l.triggered && (r.width === 0 && r.height === 0)) || r.right < 0 || r.left > window.innerWidth) {
        l.finished = true;
        l.el.classList.remove('sr-hide-paint', 'sr-hide-media');
        l.el.classList.remove('sr-reveal'); // just ensure visible
      }
    });

    // 2. Agent picking – each free agent grabs lowest‑score pending layer whose parent has started
    buildState.free.forEach(agent => {
      // filter eligible layers
      const eligible = buildState.pending.filter(l => !l.assigned && l.triggered && (!l.parent || l.parent.started));
      if (eligible.length === 0) return;
      // compute score
      let best = null; let bestScore = Infinity;
      eligible.forEach(l => {
        const dx = l.rect.left - agent.pos.x;
        const dy = l.rect.top - agent.pos.y;
        const dist = Math.hypot(dx, dy);
        const score = l.rect.top + 0.3 * dist;
        if (score < bestScore) { bestScore = score; best = l; }
      });
      if (best) {
        best.assigned = agent;
        agent.task = { layer: best, phase: 'travel' };
        // remove from free list
        const idx = buildState.free.indexOf(agent);
        if (idx >= 0) buildState.free.splice(idx, 1);
        buildState.active.push(agent);
      }
    });

    // 3. Update active agents according to their current phase
    buildState.active.forEach(agent => {
      const t = agent.task;
      const layer = t.layer;
      const rect = layer.rect;
      const k = 6 + 3 * buildState.speed;
      const maxTravel = 1200; // ms
      switch (t.phase) {
        case 'travel': {
          // move toward target point (box/media: top‑left, text: start of text)
          const targetX = rect.left;
          const targetY = rect.top;
          const dtSec = dt / 1000;
          agent.pos.x = lerp(agent.pos.x, targetX, 1 - Math.exp(-k * dtSec));
          agent.pos.y = lerp(agent.pos.y, targetY, 1 - Math.exp(-k * dtSec));
          // rotate arrow toward velocity (simple approximation)
          const vx = targetX - agent.pos.x;
          const vy = targetY - agent.pos.y;
          const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
          agent.el.querySelector('.sr-arrow').style.transform = `rotate(${angle}deg)`;
          // check arrival (within 2px)
          if (Math.abs(agent.pos.x - targetX) < 2 && Math.abs(agent.pos.y - targetY) < 2) {
            // create frame
            const frame = createFrame(layer.el);
            layer.frame = frame;
            layer.started = true;
            t.phase = 'draw';
            t.startTime = timestamp;
          }
          break;
        }
        case 'draw': {
          // grow frame from 0 size to full over duration
          const elapsed = timestamp - t.startTime;
          const dur = 220 + Math.min(340, Math.sqrt(rect.width * rect.height) / 1600 * 1000);
          const prog = Math.min(elapsed / dur, 1);
          // cubic ease‑out
          const eased = 1 - Math.pow(1 - prog, 3);
          const w = rect.width * eased;
          const h = rect.height * eased;
          const f = layer.frame;
          f.style.left = rect.left + 'px';
          f.style.top = rect.top + 'px';
          f.style.width = w + 'px';
          f.style.height = h + 'px';
          // position cursor at bottom‑right corner
          agent.el.style.transform = `translate(${rect.left + w}px, ${rect.top + h}px)`;
          // update size label
          f.querySelector('.sr-size-label').textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
          if (prog >= 1) {
            t.phase = 'fill';
            t.startTime = timestamp;
          }
          break;
        }
        case 'fill': {
          const elapsed = timestamp - t.startTime;
          if (!layer.revealed) {
            layer.el.classList.add('sr-reveal');
            layer.revealed = true;
          }
          if (elapsed > 800) {
            // wiggle cursor for 0.32s
            const wiggle = Math.sin((elapsed - 800) / 100) * 4;
            agent.el.style.transform = `translate(${layer.rect.left + layer.rect.width + wiggle}px, ${layer.rect.top + layer.rect.height}px)`;
            if (elapsed > 1120) {
              // transition to type if text layer
              if (layer.type === 'text') {
                t.phase = 'type';
                t.startTime = timestamp;
                // switch to I‑beam
                const ibeam = agent.el.querySelector('.sr-ibeam');
                const arrow = agent.el.querySelector('.sr-arrow');
                if (ibeam && arrow) { arrow.style.display = 'none'; ibeam.style.display = '' ; }
                // caret bar as a pseudo‑element via style
                const caret = document.createElement('div');
                caret.className = 'sr-caret';
                caret.style.position = 'fixed';
                caret.style.width = '2px';
                caret.style.height = '1em';
                caret.style.background = cfg.accent;
                caret.style.pointerEvents = 'none';
                document.body.appendChild(caret);
                layer.caret = caret;
              } else {
                t.phase = 'hold';
                t.startTime = timestamp;
              }
            }
          }
          break;
        }
        case 'type': {
          const elapsed = timestamp - t.startTime;
          const totalChars = layer.el.textContent.length; // original length stored in sr-rest
          const duration = Math.min(Math.max(totalChars * 18, 250), 1300);
          const prog = Math.min(elapsed / duration, 1);
          const typedCount = Math.floor(prog * totalChars);
          const typedSpan = layer.el.querySelector('.sr-typed');
          const restSpan = layer.el.querySelector('.sr-rest');
          const full = restSpan.textContent;
          typedSpan.textContent = full.slice(0, typedCount);
          restSpan.textContent = full.slice(typedCount);
          // update caret position
          const rects = typedSpan.getClientRects();
          let caretX, caretY;
          if (rects.length) {
            const r = rects[rects.length - 1];
            caretX = r.right; caretY = r.top;
          } else {
            const r = restSpan.getClientRects()[0];
            caretX = r.left; caretY = r.top;
          }
          layer.caret.style.left = caretX + 'px';
          layer.caret.style.top = caretY + 'px';
          if (prog >= 1) {
            t.phase = 'hold';
            t.startTime = timestamp;
          }
          break;
        }
        case 'hold': {
          if (timestamp - t.startTime > 160) {
            // restore original text
            const w = layer.el.querySelector('.sr-w');
            if (w) {
              const full = w.querySelector('.sr-rest').textContent;
              layer.el.textContent = full;
            }
            // fade out frame
            const f = layer.frame;
            f.style.transition = 'opacity 0.25s';
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 260);
            // clean up caret if any
            if (layer.caret) layer.caret.remove();
            // mark layer done
            layer.finished = true;
            // free agent
            const idx = buildState.active.indexOf(agent);
            if (idx >= 0) buildState.active.splice(idx, 1);
            buildState.free.push(agent);
            // hide name tag
            const nameTag = agent.el.querySelector('.sr-name');
            if (nameTag) nameTag.style.display = 'none';
          }
          break;
        }
        default:
          break;
      }
    });

    // FREE agents wandering (if no task)
    buildState.free.forEach(agent => {
      // simple wandering with new target every 1.5‑3 s
      if (!agent.wanderTarget || timestamp - agent.wanderStart > (1200 + Math.random() * 2000)) {
        agent.wanderTarget = {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.88
        };
        agent.wanderStart = timestamp;
      }
      const k = 1.4;
      const dtSec = dt / 1000;
      agent.pos.x = lerp(agent.pos.x, agent.wanderTarget.x, 1 - Math.exp(-k * dtSec));
      agent.pos.y = lerp(agent.pos.y, agent.wanderTarget.y, 1 - Math.exp(-k * dtSec));
      agent.el.style.transform = `translate(${agent.pos.x}px, ${agent.pos.y}px)`;
      // rotate back upright
      const arrow = agent.el.querySelector('.sr-arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    });

    // WRITE phase -----------------------------------------------------------
    // update agent DOM positions (already done in read above via transforms)

    // HUD visibility – show while any agent active
    const anyWorking = buildState.active.length > 0;
    if (anyWorking && !buildState.hudVisible) {
      showHUD();
      buildState.hudVisible = true;
    } else if (!anyWorking && buildState.hudVisible) {
      hideHUD();
      buildState.hudVisible = false;
    }

    // continue loop
    requestAnimationFrame(buildLoop);
  }

  // Toolbar creation
  function createHUD() {
    const hud = document.createElement('div');
    hud.id = 'sr-hud';
    hud.style.position = 'fixed';
    hud.style.left = '50%';
    hud.style.bottom = `calc(18px + env(safe-area-inset-bottom))`;
    hud.style.transform = 'translateX(-50%)';
    hud.style.background = 'rgba(22,23,27,.9)';
    hud.style.backdropFilter = 'blur(14px)';
    hud.style.borderRadius = '13px';
    hud.style.padding = '6px 12px';
    hud.style.display = 'flex';
    hud.style.alignItems = 'center';
    hud.style.gap = '8px';
    hud.style.zIndex = '2147483005';
    // avatars (first five agents)
    const avatars = document.createElement('div');
    avatars.style.display = 'flex';
    avatars.style.gap = '2px';
    for (let i = 0; i < Math.min(5, agents.length); i++) {
      const dot = document.createElement('div');
      dot.textContent = agents[i].name.charAt(0);
      dot.style.width = dot.style.height = '12px';
      dot.style.borderRadius = '50%';
      dot.style.background = agents[i].color;
      dot.style.color = 'white';
      dot.style.fontSize = '8px';
      dot.style.display = 'flex';
      dot.style.alignItems = 'center';
      dot.style.justifyContent = 'center';
      avatars.appendChild(dot);
    }
    hud.appendChild(avatars);
    const status = document.createElement('span');
    status.id = 'sr-status';
    status.textContent = `Scanning page… ${buildState.layers.length || 0} layers`;
    hud.appendChild(status);
    const progress = document.createElement('div');
    progress.id = 'sr-progress';
    progress.style.width = '64px';
    progress.style.height = '6px';
    progress.style.background = '#444';
    progress.style.position = 'relative';
    const bar = document.createElement('div');
    bar.style.width = '0%';
    bar.style.height = '100%';
    bar.style.background = cfg.accent;
    progress.appendChild(bar);
    hud.appendChild(progress);
    const btnTour = document.createElement('button');
    btnTour.textContent = 'Tour';
    btnTour.style.background = 'none';
    btnTour.style.border = 'none';
    btnTour.style.color = 'white';
    btnTour.style.cursor = 'pointer';
    hud.appendChild(btnTour);
    const btnSpeed = document.createElement('button');
    btnSpeed.textContent = `${buildState.speed}×`;
    btnSpeed.style.background = 'none';
    btnSpeed.style.border = 'none';
    btnSpeed.style.color = 'white';
    btnSpeed.style.cursor = 'pointer';
    hud.appendChild(btnSpeed);
    const btnClose = document.createElement('button');
    btnClose.textContent = '×';
    btnClose.style.background = 'none';
    btnClose.style.border = 'none';
    btnClose.style.color = 'white';
    btnClose.style.cursor = 'pointer';
    hud.appendChild(btnClose);
    document.body.appendChild(hud);
    // button listeners
    btnTour.addEventListener('click', () => startTour());
    btnSpeed.addEventListener('click', () => {
      buildState.speed = buildState.speed === 1 ? 2 : buildState.speed === 2 ? 4 : 1;
      btnSpeed.textContent = `${buildState.speed}×`;
    });
    btnClose.addEventListener('click', () => skip());
    buildState.toolbar = hud;
  }

  function showHUD() { if (!buildState.toolbar) createHUD(); buildState.toolbar.style.opacity = '1'; }
  function hideHUD() { if (buildState.toolbar) buildState.toolbar.style.opacity = '0'; }

  // Tour implementation (simplified – scroll down automatically)
  let tourActive = false;
  function startTour() {
    if (tourActive) return;
    tourActive = true;
    const scrollStep = () => {
      if (!tourActive) return;
      const pending = buildState.pending.filter(l => !l.finished).length;
      const total = buildState.pending.length;
      if (pending / total < 0.4) { // less than 60% pending
        tourActive = false;
        return;
      }
      window.scrollBy(0, 240 * buildState.speed);
      requestAnimationFrame(scrollStep);
    };
    requestAnimationFrame(scrollStep);
  }

  function skip() {
    // finish everything instantly
    buildState.pending.forEach(l => {
      if (!l.finished) {
        l.el.classList.remove('sr-hide-paint', 'sr-hide-media');
        l.finished = true;
      }
    });
    // remove agents and frames
    agents.forEach(a => a.el.remove());
    document.querySelectorAll('.sr-frame').forEach(f => f.remove());
    // hide HUD, show done state
    if (buildState.toolbar) {
      const status = buildState.toolbar.querySelector('#sr-status');
      status.textContent = `Rebuilt ${buildState.pending.length} layers in ${((now() - startTime)/1000).toFixed(1)}s`;
      const btns = buildState.toolbar.querySelectorAll('button');
      btns.forEach(b => b.style.display = 'none');
    }
  }

  function replay() {
    // reset state and restart whole process
    window.location.reload(); // simple approach – reload page
  }

  // Expose API
  window.SwarmRebuild = {
    replay,
    skip,
    setSpeed: v => { buildState.speed = v; },
    tour: startTour,
    get layers() { return buildState.pending; }
  };

  // After scan fade out, start layer collection then build loop
  function afterScan() {
    scan.remove();
    document.documentElement.classList.remove('sr-lock');
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    collectLayers().then(() => {
      // move collected layers into buildState
      buildState.layers = [];
      // layers were stored in a local variable inside collectLayers – we need to expose them.
      // For simplicity we re‑walk the DOM again to rebuild the array.
      const all = [];
      const skipTags = new Set(['SCRIPT','STYLE','TEMPLATE','META','BR','HEAD','HTML']);
      const srRootIds = new Set(['sr-root','sr-scan','sr-agents','sr-hud']);
      function walk(node, parent) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node;
        if (srRootIds.has(el.id) || el.id?.startsWith('sr-') || skipTags.has(el.tagName)) return;
        const style = getComputedStyle(el);
        if (style.display === 'none' || el.hasAttribute('data-sr-skip')) return;
        let type = null;
        const mediaTags = ['IMG','SVG','CANVAS','VIDEO','AUDIO','PICTURE','INPUT','TEXTAREA','SELECT','IFRAME','HR','PROGRESS','METER','OBJECT','EMBED'];
        if (mediaTags.includes(el.tagName)) type = 'media';
        else if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') type = 'box';
        else if (style.boxShadow && style.boxShadow !== 'none') type = 'box';
        else if (style.borderTopWidth !== '0px' && style.borderTopStyle !== 'none') type = 'box';
        const hasChildren = el.children.length > 0;
        const textContent = el.textContent.trim();
        if (!hasChildren && textContent) type = 'text';
        if (type) {
          const layer = { el, type, parent, triggered:false, finished:false, assigned:null };
          all.push(layer);
          parent = layer;
        }
        Array.from(el.childNodes).forEach(c => walk(c, parent));
      }
      walk(document.body, null);
      buildState.pending = all;
      // initialise free agents list
      buildState.free = agents.slice();
      // start main loop
      requestAnimationFrame(buildLoop);
    });
  }

  // replace previous fade‑out setTimeout with afterScan call
  requestAnimationFrame(() => {
    animate(); // start scan animation
    // when scan ends we will call afterScan from within animate's completion
  });

  // modify animate() to call afterScan when done
  const originalAnimate = animate;
  function animate() {
    const t = (now() - startTime) / 1000 * speedFactor;
    agents.forEach(ag => {
      const ang = ag.phase + ag.dir * t * 0.8; // angular speed
      const tx = ellipse.cx + ellipse.rx * Math.cos(ang) + (Math.random() - 0.5) * 20;
      const ty = ellipse.cy + ellipse.ry * Math.sin(ang) + (Math.random() - 0.5) * 20;
      const dt = 0.016; const k = 4;
      ag.pos.x = lerp(ag.pos.x, tx, 1 - Math.exp(-k * dt));
      ag.pos.y = lerp(ag.pos.y, ty, 1 - Math.exp(-k * dt));
      ag.el.style.transform = `translate(${ag.pos.x}px, ${ag.pos.y}px)`;
      const vx = tx - ag.pos.x; const vy = ty - ag.pos.y;
      const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
      const arrow = ag.el.querySelector('.sr-arrow');
      if (arrow) arrow.style.transform = `rotate(${angle}deg)`;
    });
    if (t < 1.9) {
      requestAnimationFrame(animate);
    } else {
      scan.style.transition = 'opacity 0.55s';
      scan.style.opacity = '0';
      setTimeout(afterScan, 550);
    }
  }

})();
  const startTime = now();
  const speedFactor = cfg.speed; // 1,2,4
  const ellipse = {
    cx: window.innerWidth / 2,
    cy: window.innerHeight * cfg.line,
    rx: Math.min(window.innerWidth * 0.32, 230),
    ry: Math.min(window.innerHeight * 0.28, 170)
  };

  // assign each agent to a flock (0,1,2) and a phase offset
  agents.forEach((ag, idx) => {
    const flock = idx % 3;
    const direction = flock === 1 ? -1 : 1; // flock 1 opposite direction
    ag.flock = flock;
    ag.dir = direction;
    ag.phase = (idx / agents.length) * Math.PI * 2; // spread evenly
  });

  function animate() {
    const t = (now() - startTime) / 1000 * speedFactor;
    agents.forEach(ag => {
      const ang = ag.phase + ag.dir * t * 0.8; // angular speed
      const tx = ellipse.cx + ellipse.rx * Math.cos(ang) + (Math.random() - 0.5) * 20;
      const ty = ellipse.cy + ellipse.ry * Math.sin(ang) + (Math.random() - 0.5) * 20;
      // simple easing towards target
      const dt = 0.016; // approx frame time
      const k = 4; // damping constant
      ag.pos.x = lerp(ag.pos.x, tx, 1 - Math.exp(-k * dt));
      ag.pos.y = lerp(ag.pos.y, ty, 1 - Math.exp(-k * dt));
      // apply transform
      ag.el.style.transform = `translate(${ag.pos.x}px, ${ag.pos.y}px)`;
      // rotate arrow to velocity direction
      const vx = tx - ag.pos.x;
      const vy = ty - ag.pos.y;
      const angle = Math.atan2(vy, vx) * 180 / Math.PI + 90; // because tip points up
      const arrow = ag.el.querySelector('.sr-arrow');
      if (arrow) arrow.style.transform = `rotate(${angle}deg)`;
    });
    // continues until ~1.9s / speedFactor
    if (t < 1.9) {
      requestAnimationFrame(animate);
    } else {
      // fade out scan layer
      scan.style.transition = 'opacity 0.55s';
      scan.style.opacity = '0';
      setTimeout(() => {
        scan.remove();
        // unlock
        document.documentElement.classList.remove('sr-lock');
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
        // start layer collection
        collectLayers();
      }, 550);
    }
  }
  requestAnimationFrame(animate);

  // ----- Layer collection ---------------------------------------------------
  async function collectLayers() {
    // wait for load + fonts (max 1.2s)
    const loadPromise = new Promise(r => {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r, { once: true });
    });
    const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();
    await Promise.race([Promise.all([loadPromise, fontsPromise]), new Promise(r => setTimeout(r, 1200))]);

    const stats = { total:0, texts:0, frames:0, agents:agents.length };
    const layers = [];
    const skipTags = new Set(['SCRIPT','STYLE','TEMPLATE','META','BR','HEAD','HTML']);
    const srRootIds = new Set(['sr-root','sr-scan','sr-agents','sr-hud']);

    function walk(node, parentLayer) {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node;
      if (srRootIds.has(el.id) || el.id?.startsWith('sr-') || skipTags.has(el.tagName)) return;
      const style = getComputedStyle(el);
      if (style.display === 'none' || el.hasAttribute('data-sr-skip')) return;

      // Determine layer type
      const tag = el.tagName;
      let type = null;
      const mediaTags = ['IMG','SVG','CANVAS','VIDEO','AUDIO','PICTURE','INPUT','TEXTAREA','SELECT','IFRAME','HR','PROGRESS','METER','OBJECT','EMBED'];
      if (mediaTags.includes(tag)) {
        type = 'media';
      } else if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
        type = 'box';
      } else if (style.boxShadow && style.boxShadow !== 'none') {
        type = 'box';
      } else if (style.borderTopWidth !== '0px' && style.borderTopStyle !== 'none') {
        type = 'box';
      }

      // Text handling – if no child elements and non‑blank text
      const hasChildren = el.children.length > 0;
      const textContent = el.textContent.trim();
      if (!hasChildren && textContent) {
        type = 'text';
      }

      // Record layer if any type detected
      if (type) {
        const layer = { el, type, parent: parentLayer };
        layers.push(layer);
        stats.total++;
        if (type === 'media' || type === 'box') stats.frames++;
        if (type === 'text') stats.texts++;
        // hide according to type
        hideLayer(layer);
        parentLayer = layer; // children become nested under this layer
      }

      // Recurse
      Array.from(el.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) walk(child, parentLayer);
        else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
          // Text node adjacent to element – wrap in span
          const span = document.createElement('span');
          span.className = 'sr-tn';
          span.textContent = child.textContent;
          el.replaceChild(span, child);
          // treat as its own text layer
          const textLayer = { el: span, type: 'text', parent: parentLayer };
          layers.push(textLayer);
          stats.total++; stats.texts++; stats.frames++; // count as frame as well
          hideLayer(textLayer);
        }
      });
    }

    function hideLayer(layer) {
      const { el, type } = layer;
      if (type === 'box') {
        el.classList.add('sr-hide-paint');
      } else if (type === 'media') {
        el.classList.add('sr-hide-media');
      } else if (type === 'text') {
        const full = el.textContent;
        const wrapper = document.createElement('span');
        wrapper.className = 'sr-w';
        const typed = document.createElement('span');
        typed.className = 'sr-typed';
        const rest = document.createElement('span');
        rest.className = 'sr-rest';
        rest.textContent = full;
        wrapper.appendChild(typed);
        wrapper.appendChild(rest);
        el.textContent = '';
        el.appendChild(wrapper);
      }
    }

    walk(document.body, null);

    // Fill stat elements
    qsa('[data-sr-stat]').forEach(el => {
      const key = el.getAttribute('data-sr-stat');
      const val = stats[key] !== undefined ? stats[key] : '';
      el.textContent = Number(val).toLocaleString();
    });
  }

  // ----- Expose API --------------------------------------------------------
  window.SwarmRebuild = {
    start: () => console.log('SwarmRebuild already started'),
    cancel: () => console.log('Cancel not implemented')
  };
})();

