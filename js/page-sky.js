// A quiet night sky behind the content sections. Every visible star changes brightness.
(() => {
  const canvas = document.getElementById('pageSky');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;
  let lastDraw = 0;

  function makeStars(count) {
    let seed = 82537;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: count }, () => ({
      x: random(),
      y: random() * .68,
      size: random() < .1 ? 2.2 : 1.1 + random() * .55,
      phase: random() * Math.PI * 2,
      period: 5 + random() * 5,
      warm: random() < .3
    }));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = makeStars(width < 700 ? 30 : 65);
    draw(0);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const period = reducedMotion.matches ? star.period * 2 : star.period;
      const pulse = .5 + .5 * Math.sin(time / 1000 * Math.PI * 2 / period + star.phase);
      context.globalAlpha = reducedMotion.matches ? .17 + pulse * .22 : .14 + pulse * .44;
      context.fillStyle = star.warm ? '#f6debf' : '#d9e5ff';
      context.shadowColor = star.warm ? '#f6debf' : '#b9d0ff';
      context.shadowBlur = star.size > 2 ? 5 : 2;
      const x = star.x * width;
      const y = star.y * height;
      context.fillRect(x, y, star.size, star.size);
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }

  function loop(time) {
    frame = 0;
    if (document.hidden) return;
    if (time - lastDraw > 40) {
      draw(time);
      lastDraw = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) frame = requestAnimationFrame(loop);
  }

  resize();
  start();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
})();
