// Star positions are mapped to the illustration's window, so all visible stars twinkle.
(() => {
  const desktop = document.getElementById('desktopStarfield');
  const mobile = document.getElementById('mobileStarfield');
  const hero = document.getElementById('home');
  const scene = document.getElementById('studioScene');
  if (!desktop || !mobile) return;

  const narrow = window.matchMedia('(max-width: 720px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const imageWidth = 1672;
  const imageHeight = 941;
  let seed = 41827;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stars = [];
  const panes = [
    { x: 835, y: 35, w: 103, h: 35, count: 6 },
    { x: 835, y: 98, w: 103, h: 88, count: 17 },
    { x: 980, y: 16, w: 296, h: 34, count: 10 },
    { x: 1300, y: 9, w: 245, h: 20, count: 5 },
    { x: 984, y: 86, w: 558, h: 190, count: 92 }
  ];
  panes.forEach(pane => {
    for (let i = 0; i < pane.count; i++) {
      const x = pane.x + random() * pane.w;
      const y = pane.y + random() * pane.h;
      if ((x - 1428) ** 2 + (y - 143) ** 2 < 57 ** 2 ||
          (x < 1115 && y > 204) || (x > 1430 && y > 244)) continue;
      stars.push({
        x, y,
        large: random() < .12,
        phase: random() * Math.PI * 2,
        period: 3 + random(),
        warmth: random() < .32
      });
    }
  });

  let canvas;
  let context;
  let width = 0;
  let height = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let frame = 0;
  let lastDraw = 0;
  let inView = true;

  function draw(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const pulse = .5 + .5 * Math.sin(time / 1000 * Math.PI * 2 / star.period + star.phase);
      const x = offsetX + star.x * scale;
      const y = offsetY + star.y * scale;
      if (x < 0 || x > width || y < 0 || y > height) continue;
      const size = Math.max(star.large ? 2.2 : 1.2, scale * (star.large ? 4 : 2));
      context.globalAlpha = reducedMotion.matches
        ? .22 + pulse * .48
        : .08 + pulse * (star.large ? .86 : .75);
      context.fillStyle = star.warmth ? '#fff1cf' : '#e1e2ff';
      context.shadowColor = star.warmth ? '#ffe6b6' : '#d7dcff';
      context.shadowBlur = star.large ? 4 * scale : 2 * scale;
      context.fillRect(x - size / 2, y - size / 2, size, size);
      if (star.large) {
        context.fillRect(x - size * 1.25, y - .5, size * 2.5, 1);
        context.fillRect(x - .5, y - size * 1.25, 1, size * 2.5);
      }
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }

  function resize() {
    canvas = narrow.matches ? mobile : desktop;
    const target = narrow.matches ? scene : hero;
    context = canvas.getContext('2d');
    width = target.clientWidth;
    height = target.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    scale = Math.max(width / imageWidth, height / imageHeight);
    offsetX = (width - imageWidth * scale) * (narrow.matches ? .66 : .5);
    offsetY = (height - imageHeight * scale) * .5;
    draw(0);
  }
  function loop(time) {
    frame = 0;
    if (!inView || document.hidden) return;
    if (time - lastDraw > 35) {
      draw(time);
      lastDraw = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function updateAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (inView && !document.hidden) frame = requestAnimationFrame(loop);
  }

  resize();
  updateAnimation();
  window.addEventListener('resize', () => { resize(); updateAnimation(); });
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener('change', updateAnimation);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updateAnimation();
    }).observe(hero);
  }
})();
