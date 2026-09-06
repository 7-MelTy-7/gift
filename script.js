/* ==========================================================================
   MASHA'S NEW YEAR 2027 MAGICAL LETTER • SCRIPT.JS
   Three.js 3D Volumetric Snow, Interactive Burgundy Envelope, Sparkler Simulation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThreeSnow();
  initEnvelopeInteraction();
  initSnowglobeSwirl();
  initInteractiveSparkler();
});

/* ==========================================================================
   1. THREE.JS 3D VOLUMETRIC SNOWFALL & PARALLAX CAMERA
   ========================================================================== */
function initThreeSnow() {
  const canvas = document.getElementById('webgl-snow');
  if (!canvas) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Volumetric Snow Particles
  const particleCount = 650;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    // Spread in wide 3D space
    positions[i * 3] = (Math.random() - 0.5) * 800;     // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 800; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600; // Z

    velocities[i * 3] = (Math.random() - 0.5) * 0.4;     // drift X
    velocities[i * 3 + 1] = -(Math.random() * 1.4 + 0.6);// falling speed Y
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // depth sway Z

    scales[i] = Math.random() * 4.5 + 2.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Snowflake Texture generated via Canvas
  const snowCanvas = document.createElement('canvas');
  snowCanvas.width = 64;
  snowCanvas.height = 64;
  const sCtx = snowCanvas.getContext('2d');
  const gradient = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(235, 245, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(200, 230, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
  sCtx.fillStyle = gradient;
  sCtx.beginPath();
  sCtx.arc(32, 32, 32, 0, Math.PI * 2);
  sCtx.fill();

  const snowTexture = new THREE.CanvasTexture(snowCanvas);

  const material = new THREE.PointsMaterial({
    size: 6,
    map: snowTexture,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.85
  });

  const snowSystem = new THREE.Points(geometry, material);
  scene.add(snowSystem);

  // Gentle Mouse/Gyro Parallax
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.08;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.08;
  });

  // Responsive Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Smooth camera drift
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    camera.position.x = mouseX;
    camera.position.y = -mouseY;
    camera.lookAt(scene.position);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += velocities[i * 3 + 1]; // Fall down
      pos[i * 3] += velocities[i * 3] + Math.sin(Date.now() * 0.001 + i) * 0.2; // Gentle flutter

      // Reset when below floor
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
   2. 3D BURGUNDY ENVELOPE INTERACTION & UNLOCK
   ========================================================================== */
function initEnvelopeInteraction() {
  const envelopeCard = document.getElementById('envelope-card');
  const sealBtn = document.getElementById('wax-seal-btn');
  const sceneLetter = document.getElementById('scene-letter');
  const scrollPrompt = document.getElementById('scroll-to-envelope');
  const openHint = document.getElementById('open-hint');

  if (!envelopeCard || !sealBtn || !sceneLetter) return;

  // 3D Tilt Effect on mouse movement
  envelopeCard.addEventListener('mousemove', (e) => {
    const rect = envelopeCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotX = -(y / (rect.height / 2)) * 12;
    const rotY = (x / (rect.width / 2)) * 14;

    envelopeCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  envelopeCard.addEventListener('mouseleave', () => {
    envelopeCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });

  // Scroll to envelope shortcut
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', () => {
      document.getElementById('scene-envelope').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Open Envelope Trigger
  function openEnvelope() {
    // 1. Break wax seal & spawn celebratory golden confetti
    fireHolidayConfetti();

    // 2. Animate envelope opening
    envelopeCard.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    envelopeCard.style.transform = 'translateY(-20px) scale(0.96)';
    envelopeCard.style.opacity = '0.3';
    if (openHint) openHint.style.display = 'none';

    // 3. Show letter smoothly
    setTimeout(() => {
      sceneLetter.classList.remove('hidden-letter');
      sceneLetter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }

  sealBtn.addEventListener('click', openEnvelope);
}

function fireHolidayConfetti() {
  if (typeof confetti !== 'function') return;

  // Center golden & rose blast
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ffd700', '#d4af37', '#ffffff', '#ff4d6d', '#70d6ff']
  });

  // Side fireworks bursts
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#ffd700', '#ffffff', '#b22234']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#ffd700', '#ffffff', '#70d6ff']
    });
  }, 250);
}

/* ==========================================================================
   3. INTERACTIVE 3D SNOWGLOBE SWIRL
   ========================================================================== */
function initSnowglobeSwirl() {
  const interactiveStage = document.getElementById('snowglobe-interactive');
  const globeSnowContainer = document.getElementById('globe-snow');

  if (!interactiveStage || !globeSnowContainer) return;

  function swirlSnow() {
    globeSnowContainer.innerHTML = '';
    const flakeCount = 28;

    for (let i = 0; i < flakeCount; i++) {
      const flake = document.createElement('div');
      flake.style.position = 'absolute';
      flake.style.width = `${Math.random() * 4 + 2}px`;
      flake.style.height = flake.style.width;
      flake.style.backgroundColor = ['#ffffff', '#ffd966', '#d4af37'][Math.floor(Math.random() * 3)];
      flake.style.borderRadius = '50%';
      flake.style.left = `${Math.random() * 80 + 10}%`;
      flake.style.top = `${Math.random() * 70 + 10}%`;
      flake.style.opacity = '1';
      flake.style.pointerEvents = 'none';
      flake.style.transition = 'all 1.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

      globeSnowContainer.appendChild(flake);

      // Animate random swirl
      setTimeout(() => {
        flake.style.transform = `translate(${(Math.random() - 0.5) * 90}px, ${Math.random() * 50 + 20}px) scale(${Math.random() * 0.8 + 0.4})`;
        flake.style.opacity = '0';
      }, 50);

      setTimeout(() => flake.remove(), 1700);
    }
  }

  interactiveStage.addEventListener('click', swirlSnow);
  // Initial gentle swirl
  setTimeout(swirlSnow, 1200);
}

/* ==========================================================================
   4. INTERACTIVE SPARKLER (БЕНГАЛЬСКИЙ ОГОНЬ)
   ========================================================================== */
function initInteractiveSparkler() {
  const canvas = document.getElementById('sparkler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const statusHint = document.getElementById('sparkler-status');
  const wishBox = document.getElementById('wish-box');
  const reigniteBtn = document.getElementById('reignite-btn');

  let width, height;
  let isLit = false;
  let sparklerTip = { x: 0, y: 0 };
  let particles = [];
  let lightIntensity = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    sparklerTip = { x: width / 2, y: height * 0.38 };
  }

  window.addEventListener('resize', resize);
  resize();

  function lightSparkler() {
    if (isLit) return;
    isLit = true;
    lightIntensity = 1.0;

    if (statusHint) statusHint.style.opacity = '0';

    // Show wish box with celebration
    setTimeout(() => {
      if (wishBox) wishBox.classList.add('visible');
      fireHolidayConfetti();
    }, 1500);
  }

  function onPointerInteract(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check distance to tip
    const dx = x - sparklerTip.x;
    const dy = y - sparklerTip.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 60) {
      lightSparkler();
    }
  }

  canvas.addEventListener('mousemove', onPointerInteract);
  canvas.addEventListener('touchmove', onPointerInteract, { passive: true });
  canvas.addEventListener('click', lightSparkler);

  if (reigniteBtn) {
    reigniteBtn.addEventListener('click', () => {
      isLit = false;
      if (wishBox) wishBox.classList.remove('visible');
      if (statusHint) statusHint.style.opacity = '1';
      setTimeout(lightSparkler, 300);
    });
  }

  // Sparkler Render & Physics Loop
  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Draw Sparkler Metal Stick
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, height - 20);
    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Burning Grey Composition Layer
    ctx.beginPath();
    ctx.moveTo(sparklerTip.x, sparklerTip.y);
    ctx.lineTo(sparklerTip.x, sparklerTip.y + 70);
    ctx.strokeStyle = isLit ? '#3a3d40' : '#6c757d';
    ctx.lineWidth = 8;
    ctx.stroke();

    if (isLit) {
      // Warm Radial Glow around burning tip
      const glowGrad = ctx.createRadialGradient(
        sparklerTip.x, sparklerTip.y, 0,
        sparklerTip.x, sparklerTip.y, 90 + Math.random() * 20
      );
      glowGrad.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
      glowGrad.addColorStop(0.3, 'rgba(255, 180, 50, 0.4)');
      glowGrad.addColorStop(0.7, 'rgba(255, 80, 20, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 110, 0, Math.PI * 2);
      ctx.fill();

      // White-hot core
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 8 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Spawn Sizzling Golden Sparks
      for (let i = 0; i < 9; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x: sparklerTip.x,
          y: sparklerTip.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          gravity: 0.18,
          alpha: 1.0,
          decay: Math.random() * 0.035 + 0.02,
          length: Math.random() * 6 + 4,
          color: ['#ffffff', '#fff2b2', '#ffd166', '#ff9f1c', '#ff3838'][Math.floor(Math.random() * 5)]
        });
      }
    } else {
      // Idle pulsing spark prompt
      ctx.beginPath();
      ctx.arc(sparklerTip.x, sparklerTip.y, 6 + Math.sin(Date.now() * 0.005) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Update & Draw Sparks
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
      ctx.lineTo(p.x - p.vx * 0.8, p.y - p.vy * 0.8);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.random() * 1.8 + 1.2;
      ctx.globalAlpha = p.alpha;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  loop();
}
