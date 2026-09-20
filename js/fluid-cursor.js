// Lightweight native fluid cursor for the desktop version of the site.
(() => {
  const canvas = document.getElementById('fluidCursor');
  const core = document.getElementById('fluidCursorCore');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!canvas || !core || reducedMotion.matches) return;

  // Mobile uses a separate, short 30 FPS trail: no particles, blur, gradients,
  // or always-on animation loop. Native scrolling remains fully passive.
  if (!finePointer.matches) {
    if (coarsePointer.matches) initMobileTrail(canvas);
    return;
  }

  function initMobileTrail(target) {
    const mobileContext = target.getContext('2d');
    if (!mobileContext) return;
    const colors = [
      [255, 218, 156],
      [216, 168, 193],
      [184, 211, 181],
      [200, 182, 237]
    ];
    const points = [];
    let mobileFrame = 0;
    let previousFrame = 0;
    let lastPointTime = 0;
    let lastX = -40;
    let lastY = -40;
    let colorIndex = 0;

    function resizeMobile() {
      target.width = window.innerWidth;
      target.height = window.innerHeight;
      mobileContext.setTransform(1, 0, 0, 1, 0, 0);
    }

    function startMobileFrame() {
      if (!mobileFrame) mobileFrame = requestAnimationFrame(drawMobileTrail);
    }

    function addPoint(x, y, time) {
      points.push({ x, y, life: 1, color: colors[colorIndex] });
      colorIndex = (colorIndex + 1) % colors.length;
      if (points.length > 10) points.shift();
      lastX = x;
      lastY = y;
      lastPointTime = time;
      target.classList.add('is-active');
      startMobileFrame();
    }

    function drawMobileTrail(time) {
      mobileFrame = 0;
      if (previousFrame && time - previousFrame < 32) {
        startMobileFrame();
        return;
      }
      const elapsed = previousFrame ? Math.min(time - previousFrame, 50) : 16;
      previousFrame = time;
      mobileContext.clearRect(0, 0, target.width, target.height);
      mobileContext.lineCap = 'round';
      mobileContext.lineJoin = 'round';

      if (points.length === 1) {
        const point = points[0];
        const [r, g, b] = point.color;
        mobileContext.beginPath();
        mobileContext.arc(point.x, point.y, 2.6, 0, Math.PI * 2);
        mobileContext.fillStyle = `rgba(${r}, ${g}, ${b}, ${point.life * .34})`;
        mobileContext.fill();
      } else {
        for (let index = 1; index < points.length; index++) {
          const previous = points[index - 1];
          const point = points[index];
          const [r, g, b] = point.color;
          mobileContext.beginPath();
          mobileContext.moveTo(previous.x, previous.y);
          mobileContext.lineTo(point.x, point.y);
          mobileContext.lineWidth = 5;
          mobileContext.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(previous.life, point.life) * .28})`;
          mobileContext.stroke();
        }
      }

      for (const point of points) point.life -= elapsed / 260;
      while (points[0]?.life <= 0) points.shift();
      if (points.length) startMobileFrame();
      else {
        previousFrame = 0;
        target.classList.remove('is-active');
      }
    }

    window.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      points.length = 0;
      addPoint(event.clientX, event.clientY, performance.now());
    }, { passive: true });
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'touch') return;
      const now = performance.now();
      if (now - lastPointTime < 33 || Math.hypot(event.clientX - lastX, event.clientY - lastY) < 6) return;
      addPoint(event.clientX, event.clientY, now);
    }, { passive: true });
    window.addEventListener('resize', resizeMobile, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      points.length = 0;
      if (mobileFrame) cancelAnimationFrame(mobileFrame);
      mobileFrame = 0;
      previousFrame = 0;
      target.classList.remove('is-active');
    });
    resizeMobile();
  }

  const context = canvas.getContext('2d');
  if (!context) return;
  const palette = [
    [255, 218, 156], // warm gold
    [216, 168, 193], // dusty pink
    [184, 211, 181], // sage
    [200, 182, 237]  // lavender
  ];
  const particles = [];
  const ribbon = [];
  const ripples = [];
  const particleLimit = 96;
  const ribbonLimit = 16;
  const ribbonWidth = 12;
  const pointer = { x: -40, y: -40, targetX: -40, targetY: -40, lastX: -40, lastY: -40, visible: false };
  let width = 0;
  let height = 0;
  let frame = 0;
  let colorIndex = 0;
  let lastMove = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function makeParticle(x, y, moveX, moveY, offset) {
    const color = palette[(colorIndex + offset) % palette.length];
    const speed = Math.hypot(moveX, moveY);
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x, y, px: x, py: y,
      vx: moveX * .045 + Math.cos(angle) * (.22 + Math.random() * .42),
      vy: moveY * .045 + Math.sin(angle) * (.22 + Math.random() * .42),
      life: 1,
      decay: .032 + Math.random() * .016,
      radius: 4 + Math.min(8, speed * .04) + Math.random() * 3,
      color,
      phase: Math.random() * Math.PI * 2
    });
  }

  function splat(x, y, moveX, moveY) {
    const distance = Math.hypot(moveX, moveY);
    const count = Math.max(1, Math.min(4, Math.ceil(distance / 10)));
    for (let i = 0; i < count; i++) {
      const progress = count === 1 ? 1 : i / (count - 1);
      makeParticle(x - moveX * (1 - progress), y - moveY * (1 - progress), moveX, moveY, i);
    }
    colorIndex = (colorIndex + 1) % palette.length;
    if (particles.length > particleLimit) particles.splice(0, particles.length - particleLimit);
  }

  function drawParticle(particle, time) {
    particle.px = particle.x;
    particle.py = particle.y;
    const speed = Math.hypot(particle.vx, particle.vy) || 1;
    const curl = Math.sin(time * .002 + particle.phase) * .038;
    particle.vx += (-particle.vy / speed) * curl;
    particle.vy += (particle.vx / speed) * curl - .002;
    particle.vx *= .965;
    particle.vy *= .965;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= particle.decay;

    const [r, g, b] = particle.color;
    const alpha = Math.max(0, particle.life) * .22;
    context.beginPath();
    context.moveTo(particle.px, particle.py);
    context.quadraticCurveTo(
      (particle.px + particle.x) / 2 - particle.vy * 1.8,
      (particle.py + particle.y) / 2 + particle.vx * 1.8,
      particle.x,
      particle.y
    );
    context.lineCap = 'round';
    context.lineWidth = particle.radius * Math.max(.2, particle.life);
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    context.stroke();
  }

  function drawRibbon() {
    if (ribbon.length < 3) return;
    const first = ribbon[0];
    const last = ribbon[ribbon.length - 1];
    const gradient = context.createLinearGradient(first.x, first.y, last.x, last.y);
    gradient.addColorStop(0, 'rgba(200, 182, 237, 0)');
    gradient.addColorStop(.38, 'rgba(184, 211, 181, .16)');
    gradient.addColorStop(.72, 'rgba(216, 168, 193, .24)');
    gradient.addColorStop(1, 'rgba(255, 218, 156, .38)');

    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let i = 1; i < ribbon.length - 1; i++) {
      const point = ribbon[i];
      const next = ribbon[i + 1];
      context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
    }
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = Math.min(1, last.life);
    context.lineWidth = ribbonWidth;
    context.strokeStyle = gradient;
    context.stroke();
    context.globalAlpha = Math.min(1, last.life) * .9;
    context.lineWidth = 3.5;
    context.strokeStyle = 'rgba(255, 239, 207, .34)';
    context.stroke();
    context.globalAlpha = 1;
  }

  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      ripple.progress += .055;
      const radius = 10 + ripple.progress * 48;
      const alpha = Math.max(0, 1 - ripple.progress);
      const gradient = context.createRadialGradient(ripple.x, ripple.y, radius * .28, ripple.x, ripple.y, radius);
      gradient.addColorStop(0, 'rgba(255, 218, 156, 0)');
      gradient.addColorStop(.68, `rgba(255, 218, 156, ${alpha * .22})`);
      gradient.addColorStop(.84, `rgba(216, 168, 193, ${alpha * .38})`);
      gradient.addColorStop(1, 'rgba(200, 182, 237, 0)');
      context.beginPath();
      context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      context.lineWidth = 3;
      context.strokeStyle = gradient;
      context.stroke();
      if (ripple.progress >= 1) ripples.splice(i, 1);
    }
  }

  function render(time) {
    frame = requestAnimationFrame(render);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    drawRibbon();
    drawRipples();
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      drawParticle(particle, time);
      if (particle.life <= 0) particles.splice(i, 1);
    }
    for (let i = ribbon.length - 1; i >= 0; i--) {
      ribbon[i].life -= .045;
      if (ribbon[i].life <= 0) ribbon.splice(i, 1);
    }
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;

  }

  function setVisible(visible) {
    pointer.visible = visible;
    canvas.classList.toggle('is-active', visible);
    core.classList.toggle('is-active', visible);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const now = performance.now();
    const x = event.clientX;
    const y = event.clientY;
    if (!pointer.visible) {
      pointer.x = pointer.targetX = pointer.lastX = x;
      pointer.y = pointer.targetY = pointer.lastY = y;
      setVisible(true);
    }
    const moveX = x - pointer.lastX;
    const moveY = y - pointer.lastY;
    pointer.x = pointer.targetX = x;
    pointer.y = pointer.targetY = y;
    core.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    ribbon.push({ x, y, life: 1 });
    if (ribbon.length > ribbonLimit) ribbon.shift();
    if (now - lastMove > 18 || Math.hypot(moveX, moveY) > 10) {
      splat(x, y, moveX, moveY);
      lastMove = now;
    }
    pointer.lastX = x;
    pointer.lastY = y;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => setVisible(false));
  window.addEventListener('blur', () => setVisible(false));
  window.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') core.classList.add('is-pressed');
  }, { passive: true });
  window.addEventListener('pointerup', () => core.classList.remove('is-pressed'), { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setVisible(false);
  });

  resize();
  window.addEventListener('resize', resize, { passive: true });
  frame = requestAnimationFrame(render);
})();
