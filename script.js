/* ==========================================================================
   MASHA'S NEW YEAR 2027 FAIRYTALE BOOK • SCRIPT.JS
   Slow Volumetric Three.js Snow, Chapter Tracking, Accurate Sparkler Friction
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSlowThreeSnow();
  initChapterScrollTracker();
  initGlobeInteraction();
  initFrictionSparkler();
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

  // Volumetric Snow Particles (Gentle, peaceful count)
  const particleCount = 450;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800;      // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 800;  // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600;  // Z

    velocities[i * 3] = (Math.random() - 0.5) * 0.15;    // very gentle horizontal drift
    velocities[i * 3 + 1] = -(Math.random() * 0.45 + 0.25); // SLOW falling speed (3x slower!)
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08; // subtle depth drift
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Soft Radial Flake Texture
  const snowCanvas = document.createElement('canvas');
  snowCanvas.width = 64;
  snowCanvas.height = 64;
  const sCtx = snowCanvas.getContext('2d');
  const gradient = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.3, 'rgba(240, 248, 255, 0.7)');
  gradient.addColorStop(0.65, 'rgba(212, 175, 55, 0.2)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
  sCtx.fillStyle = gradient;
  sCtx.beginPath();
  sCtx.arc(32, 32, 32, 0, Math.PI * 2);
  sCtx.fill();

  const snowTexture = new THREE.CanvasTexture(snowCanvas);

  const material = new THREE.PointsMaterial({
    size: 5.5,
    map: snowTexture,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.75
  });

  const snowSystem = new THREE.Points(geometry, material);
  scene.add(snowSystem);

  // Parallax tracking
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.04;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.04;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    mouseX += (targetMouseX - mouseX) * 0.03;
    mouseY += (targetMouseY - mouseY) * 0.03;
    camera.position.x = mouseX;
    camera.position.y = -mouseY;
    camera.lookAt(scene.position);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += velocities[i * 3 + 1]; // Slow downward motion
      pos[i * 3] += velocities[i * 3] + Math.sin(Date.now() * 0.0006 + i) * 0.12; // Slow gentle sway

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
   2. CHAPTER SCROLL TRACKER
   ========================================================================== */
function initChapterScrollTracker() {
  const labelEl = document.getElementById('chapter-label');
  const chapters = [
    { id: 'chapter-prologue', name: 'Пролог: Зимняя Москва' },
    { id: 'chapter-1', name: 'Глава I: Оверсайз и Музыка' },
    { id: 'chapter-2', name: 'Глава II: Физика и Космос' },
    { id: 'chapter-3', name: 'Глава III: Книги и Пицца' },
    { id: 'chapter-4', name: 'Глава IV: Заявка в Друзья' },
    { id: 'chapter-5', name: 'Глава V: Мечта о Таксе' },
    { id: 'chapter-epilogue', name: 'Эпилог: Письмо и Огонь' }
  ];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + window.innerHeight * 0.45;
    for (let i = chapters.length - 1; i >= 0; i--) {
      const el = document.getElementById(chapters[i].id);
      if (el && el.offsetTop <= scrollPos) {
        if (labelEl && labelEl.textContent !== chapters[i].name) {
          labelEl.textContent = chapters[i].name;
        }
        break;
      }
    }
  });
}

/* ==========================================================================
   3. SNOWGLOBE SWIRL INTERACTION
   ========================================================================== */
function initGlobeInteraction() {
  const globe = document.getElementById('fairytale-globe');
  const particlesContainer = document.getElementById('orb-particles');

  if (!globe || !particlesContainer) return;

  function triggerGlobeSwirl() {
    particlesContainer.innerHTML = '';
    const count = 30;

    for (let i = 0; i < count; i++) {
      const flake = document.createElement('div');
      flake.style.position = 'absolute';
      flake.style.width = `${Math.random() * 3.5 + 2}px`;
      flake.style.height = flake.style.width;
      flake.style.backgroundColor = ['#ffffff', '#ffd966', '#d4af37'][Math.floor(Math.random() * 3)];
      flake.style.borderRadius = '50%';
      flake.style.left = `${Math.random() * 75 + 12}%`;
      flake.style.top = `${Math.random() * 65 + 15}%`;
      flake.style.opacity = '1';
      flake.style.pointerEvents = 'none';
      flake.style.transition = 'all 1.7s cubic-bezier(0.2, 0.8, 0.2, 1)';

      particlesContainer.appendChild(flake);

      setTimeout(() => {
        flake.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${Math.random() * 45 + 15}px) scale(${Math.random() * 0.8 + 0.4})`;
        flake.style.opacity = '0';
      }, 40);

      setTimeout(() => flake.remove(), 1800);
    }
  }

  globe.addEventListener('click', triggerGlobeSwirl);
  setTimeout(triggerGlobeSwirl, 1500);
}

/* ==========================================================================
   4. ACCURATE SPARKLER FRICTION IGNITION (БЕНГАЛЬСКИЙ ОГОНЬ)
   ========================================================================== */
function initFrictionSparkler() {
  const canvas = document.getElementById('fairytale-sparkler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const tipLabel = document.getElementById('sparkler-tip-label');
  const wishCard = document.getElementById('wish-result-card');
  const relightBtn = document.getElementById('sparkler-relight-btn');

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
    // Tip positioned at center top
    sparklerTip = { x: width / 2, y: height * 0.36 };
  }

  window.addEventListener('resize', resize);
  resize();

  function igniteSparkler() {
    if (isLit) return;
    isLit = true;

    if (tipLabel) tipLabel.style.opacity = '0';

    // Show celebratory wish card
    setTimeout(() => {
      if (wishCard) wishCard.classList.add('visible');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.7 },
          colors: ['#ffd700', '#ffffff', '#ffccd5', '#70d6ff']
        });
      }
    }, 1200);
  }

  // ACCURATE FRICTION DETECTION:
  // Requires dragging or rubbing near the tip (within 28px), NOT random clicks!
  function checkFriction(x, y) {
    if (isLit) return;

    const dx = x - sparklerTip.x;
    const dy = y - sparklerTip.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only within exact tip radius (32px)
    if (dist < 32) {
      if (lastFrictionPoint) {
        const moveDist = Math.hypot(x - lastFrictionPoint.x, y - lastFrictionPoint.y);
        if (moveDist > 3) {
          frictionCount++;

          // Spawn tiny strike spark
          particles.push({
            x: sparklerTip.x + (Math.random() - 0.5) * 8,
            y: sparklerTip.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            gravity: 0.1,
            alpha: 1,
            decay: 0.08,
            length: 4,
            color: '#ffd166'
          });

          // After 4-5 deliberate rubbing movements over the tip, it catches fire!
          if (frictionCount >= 4) {
            igniteSparkler();
          }
        }
      }
      lastFrictionPoint = { x, y };
    } else {
      lastFrictionPoint = null;
    }
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX && clientY) {
      checkFriction(clientX - rect.left, clientY - rect.top);
    }
  }

  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('touchmove', onPointerMove, { passive: true });

  // Direct click right on the exact tip (radius < 20px) also triggers
  canvas.addEventListener('click', (e) => {
    if (isLit) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dist = Math.hypot(x - sparklerTip.x, y - sparklerTip.y);
    if (dist < 22) {
      igniteSparkler();
    }
  });

  if (relightBtn) {
    relightBtn.addEventListener('click', () => {
      isLit = false;
      frictionCount = 0;
      lastFrictionPoint = null;
      if (wishCard) wishCard.classList.remove('visible');
      if (tipLabel) tipLabel.style.opacity = '1';
    });
  }

  // Animation Loop
  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Sparkler Metal Wire
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, height - 15);
    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dark grey composition coating
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, sparklerTip.y + 70);
    ctx.strokeStyle = isLit ? '#333538' : '#5c636a';
    ctx.lineWidth = 7.5;
    ctx.stroke();

    if (isLit) {
      // Warm glowing halo
      const glowGrad = ctx.createRadialGradient(
        sparklerTip.x, sparklerTip.y, 0,
        sparklerTip.x, sparklerTip.y, 85 + Math.random() * 20
      );
      glowGrad.addColorStop(0, 'rgba(255, 240, 190, 0.9)');
      glowGrad.addColorStop(0.3, 'rgba(255, 190, 60, 0.4)');
      glowGrad.addColorStop(0.7, 'rgba(255, 90, 30, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 105, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent core
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 7 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Sizzling 360-degree golden sparks
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2.5;
        particles.push({
          x: sparklerTip.x,
          y: sparklerTip.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          gravity: 0.16,
          alpha: 1.0,
          decay: Math.random() * 0.035 + 0.02,
          color: ['#ffffff', '#fff2b2', '#ffd166', '#ff9f1c', '#ff4d6d'][Math.floor(Math.random() * 5)]
        });
      }
    } else {
      // Gentle ready spark indicator on tip
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 5 + Math.sin(Date.now() * 0.004) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Update & Render Sparks
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
      ctx.lineTo(p.x - p.vx * 0.7, p.y - p.vy * 0.7);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.random() * 1.6 + 1;
      ctx.globalAlpha = p.alpha;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  loop();
}
