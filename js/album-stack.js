// Ten official albums, ordered by release year. Cover art and links: Apple Music.
(() => {
  const albums = [
    { title: 'Soulboy', year: '2005', url: 'https://music.apple.com/us/album/soulboy/201549018' },
    { title: '爱爱爱', year: '2006', url: 'https://music.apple.com/us/album/%E6%84%9B%E6%84%9B%E6%84%9B/220365864' },
    { title: '未来', year: '2007', url: 'https://music.apple.com/us/album/%E6%9C%AA%E4%BE%86/272875165' },
    { title: '橙月', year: '2008', url: 'https://music.apple.com/us/album/%E6%A9%99%E6%9C%88/313404785' },
    { title: '可啦思刻', year: '2009', url: 'https://music.apple.com/us/album/%E5%8F%AF%E5%95%A6%E6%80%9D%E5%88%BB/537029543' },
    { title: '15', year: '2011', url: 'https://music.apple.com/us/album/15/540055014' },
    { title: '回到未来', year: '2012', url: 'https://music.apple.com/us/album/%E5%9B%9E%E5%88%B0%E6%9C%AA%E4%BE%86/577983280' },
    { title: '危险世界', year: '2014', url: 'https://music.apple.com/us/album/%E5%8D%B1%E9%9A%AA%E4%B8%96%E7%95%8C/1579903639' },
    { title: 'JTW 西游记', year: '2016', url: 'https://music.apple.com/us/album/jtw%E8%A5%BF%E9%81%8A%E8%A8%98/1587171414' },
    { title: 'The Dreamer', year: '2024', url: 'https://music.apple.com/us/album/the-dreamer/1772124855' }
  ];
  const stack = document.getElementById('albumStack');
  const scroll = document.getElementById('albumScroll');
  if (!stack || !scroll) return;
  const covers = [...stack.querySelectorAll('.album-cover')];
  const indexButtons = [...document.querySelectorAll('#albumIndex button')];
  const count = document.getElementById('albumCount');
  const year = document.getElementById('albumYear');
  const title = document.getElementById('albumTitle');
  const link = document.getElementById('albumLink');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let pageHeight = 1;
  let scrollFrame = 0;
  let settleTimer = 0;

  function show(index) {
    current = Math.max(0, Math.min(albums.length - 1, index));
    stack.classList.add('is-enhanced');
    covers.forEach((cover, i) => {
      cover.style.transform = '';
      cover.style.opacity = '';
      const depth = i - current;
      const state = depth === 0 ? 'is-front' : depth > 0 && depth <= 3 ? `is-next-${depth}` : 'is-hidden';
      cover.className = `album-cover ${state}`;
      cover.setAttribute('aria-hidden', String(depth < 0 || depth > 3));
      cover.tabIndex = depth < 0 || depth > 3 ? -1 : 0;
      cover.setAttribute('aria-label', depth === 0 ? '翻到下一张专辑' : `查看 ${albums[i].title}，${albums[i].year} 年`);
    });
    indexButtons.forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
    const album = albums[current];
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${albums.length}`;
    year.textContent = album.year;
    title.textContent = album.title;
    link.href = album.url;
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(albums.length - 1, index));
    stack.classList.remove('is-scrolling');
    show(next);
    scroll.scrollTo({ top: next * pageHeight, behavior: 'auto' });
  }

  function showScrollProgress() {
    const position = Math.max(0, Math.min(albums.length - 1, scroll.scrollTop / pageHeight));
    const index = Math.floor(position);
    const fraction = reducedMotion.matches ? 0 : position - index;
    if (index !== current) show(index);
    if (reducedMotion.matches || index === albums.length - 1) return;
    stack.classList.add('is-scrolling');
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => stack.classList.remove('is-scrolling'), 180);
    const front = covers[index];
    const next = covers[index + 1];
    front.style.transform = `translateY(${-115 * fraction}px) rotate(${-2 - 9 * fraction}deg) scale(${1 - .1 * fraction})`;
    front.style.opacity = String(1 - .92 * fraction);
    next.style.transform = `translate(${20 * (1 - fraction)}px, ${-14 * (1 - fraction)}px) rotate(${5 * (1 - fraction)}deg) scale(${
      .96 + .04 * fraction
    })`;
    next.style.opacity = '1';
  }

  function resizePages() {
    pageHeight = scroll.clientHeight || 620;
    scroll.style.setProperty('--album-page-height', `${pageHeight}px`);
    scroll.scrollTop = current * pageHeight;
  }

  covers.forEach((cover, index) => {
    cover.addEventListener('click', () => goTo(index === current ? current + 1 : index));
  });
  indexButtons.forEach((button, index) => button.addEventListener('click', () => goTo(index)));
  document.getElementById('albumPrevious').addEventListener('click', () => goTo(current - 1));
  document.getElementById('albumNext').addEventListener('click', () => goTo(current + 1));
  stack.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    covers[current].focus();
  });
  scroll.addEventListener('keydown', event => {
    if (event.target !== scroll || !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1));
  });
  scroll.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      showScrollProgress();
    });
  }, { passive: true });
  scroll.classList.add('is-enhanced');
  resizePages();
  if ('ResizeObserver' in window) new ResizeObserver(resizePages).observe(scroll);
  else window.addEventListener('resize', resizePages);
  show(0);
})();
