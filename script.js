/* ==========================================================================
   MASHA'S NEW YEAR 2027 3D FLIP-BOOK • SCRIPT.JS
   3D Page Flip Engine, Controlled Sentence Reveal, Web Audio Paper Rustle, Sparkler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSlowThreeSnow();
  init3DFlipBookEngine();
  initProgressiveTextReveal();
  initBookSparkler();
});

/* ==========================================================================
   1. THREE.JS SLOW VOLUMETRIC SNOWFALL
   ========================================================================== */
function initSlowThreeSnow() {
  const canvas = document.getElementById('fairytale-snow');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = 420;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

    velocities[i * 3] = (Math.random() - 0.5) * 0.12;
    velocities[i * 3 + 1] = -(Math.random() * 0.4 + 0.2); // Slow, peaceful fall
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Snowflake Texture
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 64;
  sCanvas.height = 64;
  const sCtx = sCanvas.getContext('2d');
  const gradient = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.35, 'rgba(240, 248, 255, 0.7)');
  gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
  sCtx.fillStyle = gradient;
  sCtx.beginPath();
  sCtx.arc(32, 32, 32, 0, Math.PI * 2);
  sCtx.fill();

  const snowTexture = new THREE.CanvasTexture(sCanvas);

  const material = new THREE.PointsMaterial({
    size: 5.5,
    map: snowTexture,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.8
  });

  const snowSystem = new THREE.Points(geometry, material);
  scene.add(snowSystem);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3] += velocities[i * 3] + Math.sin(Date.now() * 0.0006 + i) * 0.1;

      if (pos[i * 3 + 1] < -400) {
        pos[i * 3 + 1] = 400;
        pos[i * 3] = (Math.random() - 0.5) * 800;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   2. WEB AUDIO SYNTHESIZER: PAPER RUSTLE SOUND
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function playPaperRustle() {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Generate gentle white noise burst filtered like paper sliding
    const bufferSize = audioCtx.sampleRate * 0.18;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.8, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    whiteNoise.start();
  } catch (e) {}
}

/* ==========================================================================
   3. 3D FLIPBOOK ENGINE
   ========================================================================== */
let currentSheetIndex = 0;
const TOTAL_SHEETS = 5; // Sheet 0, 1, 2, 3, 4

const SHEET_NAMES = [
  'Обложка книги',
  'Разворот 1: Пролог & Глава I',
  'Разворот 2: Глава II & Глава III',
  'Разворот 3: Глава IV & Глава V',
  'Разворот 4: Эпилог & Бенгальский огонь'
];

function init3DFlipBookEngine() {
  const bookEl = document.getElementById('book-element');
  const prevBtn = document.getElementById('btn-prev-page');
  const nextBtn = document.getElementById('btn-next-page');
  const pageCounter = document.getElementById('page-counter');
  const dots = document.querySelectorAll('.page-indicator-dots .dot');
  const soundToggleBtn = document.getElementById('btn-sound-toggle');

  // Initial Z-Index Layering so sheet 0 is on top
  for (let i = 0; i < TOTAL_SHEETS; i++) {
    const sheet = document.getElementById(`sheet-${i}`);
    if (sheet) sheet.style.zIndex = TOTAL_SHEETS - i;
  }

  function updateBookState() {
    // Center double-spread when book is opened (sheet > 0)
    if (currentSheetIndex > 0) {
      bookEl.classList.add('book-opened');
    } else {
      bookEl.classList.remove('book-opened');
    }

    // Update Nav Buttons
    prevBtn.disabled = (currentSheetIndex === 0);
    nextBtn.disabled = (currentSheetIndex === TOTAL_SHEETS);

    // Update Counter
    if (pageCounter) {
      pageCounter.textContent = SHEET_NAMES[Math.min(currentSheetIndex, TOTAL_SHEETS - 1)];
    }

    // Update Dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSheetIndex);
    });

    // Auto-reveal first sentence of new visible pages
    revealCurrentPageContent();
  }

  function flipForward() {
    if (currentSheetIndex >= TOTAL_SHEETS) return;

    const sheetToFlip = document.getElementById(`sheet-${currentSheetIndex}`);
    if (sheetToFlip) {
      sheetToFlip.classList.add('flipped');
      sheetToFlip.style.zIndex = currentSheetIndex + 1; // Stack properly on left side
      playPaperRustle();
    }

    currentSheetIndex++;
    updateBookState();
  }

  function flipBackward() {
    if (currentSheetIndex <= 0) return;

    currentSheetIndex--;
    const sheetToUnflip = document.getElementById(`sheet-${currentSheetIndex}`);
    if (sheetToUnflip) {
      sheetToUnflip.classList.remove('flipped');
      sheetToUnflip.style.zIndex = TOTAL_SHEETS - currentSheetIndex; // Stack properly on right side
      playPaperRustle();
    }

    updateBookState();
  }

  // Navigation button listeners
  nextBtn.addEventListener('click', flipForward);
  prevBtn.addEventListener('click', flipBackward);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      flipForward();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      flipBackward();
    }
  });

  // Dot navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetSheet = parseInt(dot.dataset.sheet, 10);
      while (currentSheetIndex < targetSheet) flipForward();
      while (currentSheetIndex > targetSheet) flipBackward();
    });
  });

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.classList.toggle('active', soundEnabled);
      soundToggleBtn.querySelector('.btn-label').textContent = soundEnabled ? 'Шелест' : 'Без звука';
    });
  }

  // Cover click directly opens book
  const coverSheet = document.getElementById('sheet-0');
  if (coverSheet) {
    coverSheet.querySelector('.page-front').addEventListener('click', flipForward);
  }

  updateBookState();
}

/* ==========================================================================
   4. PROGRESSIVE CONTROLLED TEXT REVEAL ("MAGIC INK")
   ========================================================================== */
function initProgressiveTextReveal() {
  const revealAllBtn = document.getElementById('btn-reveal-all');

  // Reveal sentence on clicking parchment pages
  document.querySelectorAll('.parchment-page').forEach((page) => {
    page.addEventListener('click', (e) => {
      // Don't trigger if clicked interactive widgets or buttons
      if (e.target.closest('#book-sparkler-canvas') || e.target.closest('button')) return;

      const unrevealed = page.querySelectorAll('.prose-sentence:not(.revealed)');
      if (unrevealed.length > 0) {
        unrevealed[0].classList.add('revealed');
      } else {
        // If all revealed on this page, click hints turning next
        const hint = page.querySelector('.page-click-hint');
        if (hint) hint.textContent = 'Страница прочитана! Листай дальше →';
      }
    });
  });

  // "Show all text" button
  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.prose-sentence').forEach((sentence) => {
        sentence.classList.add('revealed');
      });
      revealAllBtn.style.opacity = '0.5';
    });
  }
}

function revealCurrentPageContent() {
  // Whenever user turns to a page, auto-reveal its first 1-2 sentences smoothly
  setTimeout(() => {
    const activePages = document.querySelectorAll('.book-sheet:not(.flipped) .page-front, .book-sheet.flipped .page-back');
    activePages.forEach(page => {
      const sentences = page.querySelectorAll('.prose-sentence');
      if (sentences.length > 0 && !sentences[0].classList.contains('revealed')) {
        sentences[0].classList.add('revealed');
        if (sentences.length > 1) {
          setTimeout(() => sentences[1].classList.add('revealed'), 350);
        }
      }
    });
  }, 400);
}

/* ==========================================================================
   5. BOOK SPARKLER WITH ACCURATE FRICTION IGNITION
   ========================================================================== */
function initBookSparkler() {
  const canvas = document.getElementById('book-sparkler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const tipArrow = document.getElementById('sparkler-tip-arrow');
  const wishBox = document.getElementById('book-wish-box');
  const relightBtn = document.getElementById('book-relight-btn');

  let width, height;
  let isLit = false;
  let sparklerTip = { x: 0, y: 0 };
  let particles = [];
  let frictionCount = 0;
  let lastFrictionPoint = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    sparklerTip = { x: width / 2, y: height * 0.35 };
  }

  window.addEventListener('resize', resize);
  resize();

  function ignite() {
    if (isLit) return;
    isLit = true;

    if (tipArrow) tipArrow.style.opacity = '0';

    setTimeout(() => {
      if (wishBox) wishBox.classList.add('visible');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#ffd700', '#ffffff', '#ffccd5', '#70d6ff']
        });
      }
    }, 1000);
  }

  // ACCURATE FRICTION: Must rub/drag within 25px of the tip
  function checkFriction(x, y) {
    if (isLit) return;
    const dist = Math.hypot(x - sparklerTip.x, y - sparklerTip.y);

    if (dist < 30) {
      if (lastFrictionPoint) {
        const moveDist = Math.hypot(x - lastFrictionPoint.x, y - lastFrictionPoint.y);
        if (moveDist > 3) {
          frictionCount++;

          // Strike spark
          particles.push({
            x: sparklerTip.x + (Math.random() - 0.5) * 6,
            y: sparklerTip.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            gravity: 0.1,
            alpha: 1,
            decay: 0.08,
            color: '#ffd166'
          });

          if (frictionCount >= 4) {
            ignite();
          }
        }
      }
      lastFrictionPoint = { x, y };
    } else {
      lastFrictionPoint = null;
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    checkFriction(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      checkFriction(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }
  }, { passive: true });

  // Direct click right on tip also triggers
  canvas.addEventListener('click', (e) => {
    if (isLit) return;
    const rect = canvas.getBoundingClientRect();
    const dist = Math.hypot((e.clientX - rect.left) - sparklerTip.x, (e.clientY - rect.top) - sparklerTip.y);
    if (dist < 22) {
      ignite();
    }
  });

  if (relightBtn) {
    relightBtn.addEventListener('click', () => {
      isLit = false;
      frictionCount = 0;
      lastFrictionPoint = null;
      if (wishBox) wishBox.classList.remove('visible');
      if (tipArrow) tipArrow.style.opacity = '1';
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Wire
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, height - 10);
    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Coating
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, sparklerTip.y + 60);
    ctx.strokeStyle = isLit ? '#333538' : '#5c636a';
    ctx.lineWidth = 7;
    ctx.stroke();

    if (isLit) {
      // Glow
      const glowGrad = ctx.createRadialGradient(
        sparklerTip.x, sparklerTip.y, 0,
        sparklerTip.x, sparklerTip.y, 75 + Math.random() * 15
      );
      glowGrad.addColorStop(0, 'rgba(255, 240, 190, 0.9)');
      glowGrad.addColorStop(0.3, 'rgba(255, 180, 60, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 90, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 6 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Sparks
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2.5;
        particles.push({
          x: sparklerTip.x,
          y: sparklerTip.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.7,
          gravity: 0.15,
          alpha: 1.0,
          decay: Math.random() * 0.035 + 0.025,
          color: ['#ffffff', '#fff2b2', '#ffd166', '#ff9f1c', '#ff4d6d'][Math.floor(Math.random() * 5)]
        });
      }
    } else {
      // Idle spark point
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 4.5 + Math.sin(Date.now() * 0.005) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.65, p.y - p.vy * 0.65);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.globalAlpha = p.alpha;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  loop();
}
