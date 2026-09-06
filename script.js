/* ==========================================================================
   MASHA'S 1-MONTH CELEBRATION WEBSITE • SCRIPT.JS
   Interactive Features, Web Audio Synthesizer, Blade Ball Arena, Physics Sandbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initLiveTimer();
  initModeSwitcher();
  initBladeBallMiniGame();
  initPhysicsSandbox();
  initDachshundMascot();
  initJukebox();
  initSecretLetter();
});

/* ==========================================================================
   1. COSMIC BACKGROUND STARFIELD CANVAS
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let stars = [];
  const STAR_COUNT = 90;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        color: ['#ffffff', '#00f2fe', '#ffd166', '#f72585'][Math.floor(Math.random() * 4)]
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let s of stars) {
      s.y -= s.speed;
      if (s.y < 0) {
        s.y = height;
        s.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(Date.now() * 0.002 + s.x));
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. LIVE COUNTER (SINCE AUGUST 5, 2026)
   ========================================================================== */
function initLiveTimer() {
  // Start date: August 5, 2026 12:00:00 (Blade ball match)
  const startDate = new Date('2026-08-05T12:00:00');
  
  const dEl = document.getElementById('cnt-days');
  const hEl = document.getElementById('cnt-hours');
  const mEl = document.getElementById('cnt-mins');
  const sEl = document.getElementById('cnt-secs');

  function update() {
    const now = new Date();
    let diff = now - startDate;
    if (diff < 0) diff = 0; // fallback if client clock differs

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (dEl) dEl.textContent = days;
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
    if (sEl) sEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   3. 2-IN-1 MODE SWITCHER (PHOTO-MEMORIES VS ART-GALLERY)
   ========================================================================== */
function initModeSwitcher() {
  const photoBtn = document.getElementById('mode-photo-btn');
  const artBtn = document.getElementById('mode-art-btn');
  const body = document.body;

  if (!photoBtn || !artBtn) return;

  photoBtn.addEventListener('click', () => {
    body.dataset.mode = 'photo';
    photoBtn.classList.add('active');
    artBtn.classList.remove('active');
    playTone(440, 0.1);
  });

  artBtn.addEventListener('click', () => {
    body.dataset.mode = 'art';
    artBtn.classList.add('active');
    photoBtn.classList.remove('active');
    playTone(660, 0.15);
  });
}

/* ==========================================================================
   4. WEB AUDIO SYNTHESIZER (LO-FI CHORDS & GAME EFFECTS)
   ========================================================================== */
let audioCtx = null;
let isSynthPlaying = false;
let synthInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play single chime / tone
function playTone(freq, duration = 0.15, type = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context may be blocked before interaction
  }
}

// Play Blade Ball Parry Clank Effect
function playBladeBallParry() {
  try {
    const ctx = getAudioContext();
    // Metal impact
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch(e) {}
}

// Play Lo-fi Space Progression
const LOFI_CHORDS = [
  [261.63, 329.63, 392.00, 493.88], // Cmaj7
  [220.00, 261.63, 329.63, 392.00], // Am7
  [174.61, 220.00, 261.63, 329.63], // Fmaj7
  [196.00, 246.94, 293.66, 349.23]  // G7
];
let chordIndex = 0;

function toggleLofiMusic() {
  const audioBtn = document.getElementById('audio-toggle');
  const playSynthBtn = document.getElementById('btn-play-synth');
  const vinylDisc = document.getElementById('vinyl-disc');

  if (isSynthPlaying) {
    // Stop
    isSynthPlaying = false;
    clearInterval(synthInterval);
    if (audioBtn) {
      audioBtn.classList.remove('playing');
      audioBtn.querySelector('.audio-status').textContent = 'Звук: Выкл';
    }
    if (playSynthBtn) playSynthBtn.textContent = '▶ Играть космический лоу-фай';
    if (vinylDisc) vinylDisc.classList.remove('vinyl-spinning');
  } else {
    // Start
    isSynthPlaying = true;
    getAudioContext();
    if (audioBtn) {
      audioBtn.classList.add('playing');
      audioBtn.querySelector('.audio-status').textContent = 'Звук: Вкл 🎶';
    }
    if (playSynthBtn) playSynthBtn.textContent = '⏸ Пауза';
    if (vinylDisc) vinylDisc.classList.add('vinyl-spinning');

    playLofiChord();
    synthInterval = setInterval(playLofiChord, 2600);
  }
}

function playLofiChord() {
  if (!isSynthPlaying) return;
  try {
    const ctx = getAudioContext();
    const chord = LOFI_CHORDS[chordIndex % LOFI_CHORDS.length];
    chordIndex++;

    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (!isSynthPlaying) return;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }, idx * 70);
    });

    // Random visualizer bounce
    bounceVisualizer();
  } catch(e) {}
}

function bounceVisualizer() {
  const bars = document.querySelectorAll('.visualizer-bars .bar');
  bars.forEach(bar => {
    const height = Math.floor(Math.random() * 26 + 6);
    bar.style.height = `${height}px`;
  });
}

/* ==========================================================================
   5. BLADE BALL INTERACTIVE ARENA
   ========================================================================== */
function initBladeBallMiniGame() {
  const canvas = document.getElementById('bb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const blockBtn = document.getElementById('bb-block-btn');
  const startBtn = document.getElementById('bb-start-btn');
  const scoreEl = document.getElementById('bb-score');
  const comboEl = document.getElementById('bb-combo');
  const bestEl = document.getElementById('bb-best');
  const floatTextEl = document.getElementById('bb-floating-text');

  let width, height;
  let ball = { x: 50, y: 130, vx: 5, vy: 0, radius: 14, state: 'idle' };
  let particles = [];
  let score = 0;
  let combo = 1;
  let best = 0;
  let shieldEffect = 0;

  const PHRASES = [
    'Чуйка спасла! 🔥',
    'Ты тигрица! ⚡',
    'Идеальный блок! 🛡️',
    '15k киллов дают о себе знать! 👑',
    'Какое парирование! ✨'
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    ball.y = height / 2;
  }

  window.addEventListener('resize', resize);
  resize();

  function spawnBall() {
    ball.x = 40;
    ball.y = height / 2;
    ball.vx = Math.min(6 + score * 0.4, 18);
    ball.state = 'flying';
  }

  function triggerBlock() {
    shieldEffect = 1.0;
    playTone(300, 0.08, 'square');
    blockBtn.classList.add('active-flash');
    setTimeout(() => blockBtn.classList.remove('active-flash'), 120);

    // Check hit zone: player shield is around width - 70
    const shieldX = width - 75;
    const dist = Math.abs(ball.x - shieldX);

    if (ball.state === 'flying' && dist < 55) {
      // Perfect Block!
      ball.state = 'deflected';
      ball.vx = -ball.vx * 1.5;
      score++;
      combo++;
      if (score > best) best = score;

      scoreEl.textContent = score;
      comboEl.textContent = `x${combo}`;
      bestEl.textContent = best;

      playBladeBallParry();

      // Show phrase
      const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      showFloatText(randomPhrase, '#00f2fe');

      // Sparks explosion
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: ball.x,
          y: ball.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          radius: Math.random() * 4 + 2,
          alpha: 1,
          color: ['#00f2fe', '#ffd166', '#f72585', '#ffffff'][Math.floor(Math.random() * 4)]
        });
      }

      // Automatically spawn next ball after deflection leaves
      setTimeout(() => {
        if (ball.state === 'deflected') spawnBall();
      }, 700);

    } else if (ball.state === 'flying' && dist >= 55) {
      // Early block or miss
      showFloatText('Тайминг! Ещё разок 💫', '#ffd166');
    }
  }

  function showFloatText(text, color) {
    if (!floatTextEl) return;
    floatTextEl.textContent = text;
    floatTextEl.style.color = color;
    floatTextEl.style.opacity = '1';
    floatTextEl.style.transform = 'translate(-50%, -50%) scale(1.15)';
    setTimeout(() => {
      floatTextEl.style.opacity = '0';
      floatTextEl.style.transform = 'translate(-50%, -80%) scale(0.9)';
    }, 900);
  }

  // Keyboard shortcut: Spacebar
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'INPUT') return;
      e.preventDefault();
      triggerBlock();
    }
  });

  if (blockBtn) blockBtn.addEventListener('click', triggerBlock);
  if (startBtn) startBtn.addEventListener('click', spawnBall);

  // Game Loop
  function gameLoop() {
    ctx.clearRect(0, 0, width, height);

    // Draw Arena Grid Lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw Target Shield Area (Player Zone)
    const shieldX = width - 75;
    ctx.fillStyle = `rgba(6, 214, 160, ${0.12 + shieldEffect * 0.35})`;
    ctx.fillRect(shieldX - 35, 20, 70, height - 40);

    ctx.strokeStyle = shieldEffect > 0 ? `rgba(0, 242, 254, ${shieldEffect})` : 'rgba(6, 214, 160, 0.4)';
    ctx.lineWidth = shieldEffect > 0 ? 3 : 1.5;
    ctx.strokeRect(shieldX - 35, 20, 70, height - 40);

    // Draw Player Shield Icon / Arc
    ctx.beginPath();
    ctx.arc(shieldX + 10, height / 2, 45, -Math.PI / 2.5, Math.PI / 2.5);
    ctx.strokeStyle = shieldEffect > 0 ? '#00f2fe' : 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 6;
    ctx.stroke();

    if (shieldEffect > 0) shieldEffect -= 0.05;

    // Update and Draw Ball
    if (ball.state === 'flying' || ball.state === 'deflected') {
      ball.x += ball.vx;

      // Check if ball passed shield without being deflected
      if (ball.state === 'flying' && ball.x > width + 20) {
        ball.state = 'missed';
        combo = 1;
        comboEl.textContent = 'x1';
        showFloatText('Не успела! Нажми "Новая подача"', '#f72585');
      }

      // Draw Ball Glow
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = ball.state === 'deflected' ? 'rgba(0, 242, 254, 0.3)' : 'rgba(247, 37, 133, 0.3)';
      ctx.fill();

      // Draw Ball Core
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.state === 'deflected' ? '#00f2fe' : '#f72585';
      ctx.fill();
    }

    // Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(gameLoop);
  }

  // Start with a gentle ball
  setTimeout(spawnBall, 1000);
  gameLoop();
}

/* ==========================================================================
   6. PHYSICS GRAVITY SANDBOX
   ========================================================================== */
function initPhysicsSandbox() {
  const canvas = document.getElementById('gravity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let attractor = { x: 0, y: 0, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1.5,
        color: ['#00f2fe', '#ffd166', '#f72585', '#9d4edd'][Math.floor(Math.random() * 4)]
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    attractor.x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    attractor.y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    attractor.active = true;
  }

  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('touchmove', onPointerMove, { passive: true });
  canvas.addEventListener('mouseleave', () => attractor.active = false);
  canvas.addEventListener('touchend', () => attractor.active = false);

  function animate() {
    ctx.fillStyle = 'rgba(9, 10, 22, 0.2)';
    ctx.fillRect(0, 0, width, height);

    if (attractor.active) {
      // Draw Gravity Well Aura
      ctx.beginPath();
      ctx.arc(attractor.x, attractor.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(157, 78, 221, 0.2)';
      ctx.fill();
    }

    for (let p of particles) {
      if (attractor.active) {
        const dx = attractor.x - p.x;
        const dy = attractor.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(60 / (dist + 20), 1.2);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Drag / friction
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   7. INTERACTIVE CREAM DACHSHUND MASCOT
   ========================================================================== */
function initDachshundMascot() {
  const petBtn = document.getElementById('btn-pet');
  const feedBtn = document.getElementById('btn-feed');
  const barkBtn = document.getElementById('btn-bark');
  const avatarWrap = document.getElementById('dog-avatar');
  const statusEl = document.getElementById('dog-status');

  if (!avatarWrap) return;

  function triggerPet() {
    avatarWrap.classList.add('tail-excited');
    spawnHeartsAround(avatarWrap);
    playTone(587.33, 0.12, 'sine');
    statusEl.textContent = 'Маша погладила меня! Я самый счастливый щенок на свете! 💖';
    setTimeout(() => avatarWrap.classList.remove('tail-excited'), 2000);
  }

  function triggerFeed() {
    avatarWrap.classList.add('tail-excited');
    spawnHeartsAround(avatarWrap);
    playTone(523.25, 0.15, 'triangle');
    statusEl.textContent = 'Ням-ням! Вкуснее любого батончика Fitness Shock! 🦴';
    setTimeout(() => avatarWrap.classList.remove('tail-excited'), 2000);
  }

  function triggerBark() {
    avatarWrap.classList.add('tail-excited');
    playTone(659.25, 0.08, 'sawtooth');
    setTimeout(() => playTone(880, 0.12, 'sine'), 100);
    statusEl.textContent = 'Тяф-тяф! Приветик, Маша! Знай: ты самая классная! ✨';
    setTimeout(() => avatarWrap.classList.remove('tail-excited'), 2000);
  }

  if (petBtn) petBtn.addEventListener('click', triggerPet);
  if (feedBtn) feedBtn.addEventListener('click', triggerFeed);
  if (barkBtn) barkBtn.addEventListener('click', triggerBark);
  avatarWrap.addEventListener('click', triggerPet);
}

function spawnHeartsAround(container) {
  const rect = container.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['💖', '✨', '🐾', '🤍'][Math.floor(Math.random() * 4)];
    heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 80}px`;
    heart.style.top = `${rect.top + rect.height / 2 + (Math.random() - 0.5) * 40}px`;
    heart.style.setProperty('--rand-x', `${(Math.random() - 0.5) * 100}px`);
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
  }
}

/* ==========================================================================
   8. JUKEBOX INTERACTION
   ========================================================================== */
function initJukebox() {
  const playSynthBtn = document.getElementById('btn-play-synth');
  const audioToggle = document.getElementById('audio-toggle');
  const trackChips = document.querySelectorAll('.track-chip');
  const trackTitle = document.getElementById('track-title');

  if (playSynthBtn) playSynthBtn.addEventListener('click', toggleLofiMusic);
  if (audioToggle) audioToggle.addEventListener('click', toggleLofiMusic);

  trackChips.forEach(chip => {
    chip.addEventListener('click', () => {
      trackChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (trackTitle) trackTitle.textContent = `${chip.textContent} 🎧`;
      playTone(520, 0.1);
      bounceVisualizer();
    });
  });
}

/* ==========================================================================
   9. SECRET LETTER WITH CONFETTI & SEAL UNLOCK
   ========================================================================== */
function initSecretLetter() {
  const envelope = document.getElementById('wax-envelope');
  const letterPaper = document.getElementById('letter-paper');
  const heartBtn = document.getElementById('btn-send-heart');
  const heartCountEl = document.getElementById('heart-count');

  let heartCount = 0;

  if (envelope && letterPaper) {
    envelope.addEventListener('click', () => {
      playTone(523.25, 0.2);
      setTimeout(() => playTone(659.25, 0.2), 150);
      setTimeout(() => playTone(783.99, 0.35), 300);

      // Fire festive confetti cannon
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.65 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 300);
      }

      envelope.parentElement.style.display = 'none';
      letterPaper.classList.remove('hidden');
      letterPaper.classList.add('visible');

      letterPaper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (heartBtn) {
    heartBtn.addEventListener('click', (e) => {
      heartCount++;
      if (heartCountEl) heartCountEl.textContent = heartCount;
      playTone(600 + Math.min(heartCount * 20, 600), 0.1);

      // Create floating heart from button
      const rect = heartBtn.getBoundingClientRect();
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = '💖';
      heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
      heart.style.top = `${rect.top}px`;
      heart.style.setProperty('--rand-x', `${(Math.random() - 0.5) * 80}px`);
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2000);
    });
  }
}
