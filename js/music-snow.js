// A quiet snowfall inside the music card; no framework or external assets needed.
(() => {
  const card = document.getElementById('musicCard');
  const canvas = document.getElementById('musicSnow');
  const context = canvas?.getContext('2d');
  if (!card || !context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let flakes = [];
  let frame = 0;
  let previousTime = 0;
  let inView = true;

  function makeFlake(initial = false) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -8,
      radius: .8 + Math.random() * 1.7,
      speed: 12 + Math.random() * 20,
      drift: 3 + Math.random() * 8,
      phase: Math.random() * Math.PI * 2,
      crystal: Math.random() < .12,
      opacity: .32 + Math.random() * .36
    };
  }

  function resize() {
    width = card.clientWidth;
    height = card.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(56, Math.max(22, Math.round(width / 17)));
    flakes = Array.from({ length: count }, () => makeFlake(true));
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (const flake of flakes) {
      context.globalAlpha = flake.opacity;
      context.fillStyle = '#e8f1f5';
      context.strokeStyle = '#e8f1f5';
      if (flake.crystal) {
        const arm = flake.radius * 1.7;
        context.lineWidth = .8;
        context.beginPath();
        context.moveTo(flake.x - arm, flake.y);
        context.lineTo(flake.x + arm, flake.y);
        context.moveTo(flake.x, flake.y - arm);
        context.lineTo(flake.x, flake.y + arm);
        context.stroke();
      } else {
        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.globalAlpha = 1;
  }

  function animate(time) {
    frame = 0;
    if (!inView || document.hidden || reducedMotion.matches) return;
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    for (let i = 0; i < flakes.length; i++) {
      const flake = flakes[i];
      flake.y += flake.speed * elapsed;
      flake.x += Math.sin(time / 1400 + flake.phase) * flake.drift * elapsed;
      if (flake.y > height + 8 || flake.x < -8 || flake.x > width + 8) flakes[i] = makeFlake();
    }
    draw();
    frame = requestAnimationFrame(animate);
  }

  function updateAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (inView && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
    else draw();
  }

  resize();
  updateAnimation();
  if ('ResizeObserver' in window) new ResizeObserver(() => resize()).observe(card);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updateAnimation();
    }).observe(card);
  }
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener('change', updateAnimation);
})();
