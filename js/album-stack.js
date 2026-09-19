// Official albums ordered by release year. Cover art and links: Apple Music.
(() => {
  const catalogs = {
    khalil: [
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
    ],
    'soft-lipa': [
      { title: '收敛水', year: '2009', url: 'https://music.apple.com/us/album/%E6%94%B6%E6%96%82%E6%B0%B4/1178538439' },
      { title: 'Winter Sweet', year: '2009', url: 'https://music.apple.com/us/album/winter-sweet/1172719989' },
      { title: '月光', year: '2010', url: 'https://music.apple.com/us/album/%E6%9C%88%E5%85%89/1069241103' },
      { title: 'Old School!', year: '2011', url: 'https://music.apple.com/us/album/old-school/1440328723' },
      { title: '踩.脚.踏.车', year: '2011', url: 'https://music.apple.com/us/album/%E8%B8%A9-%E8%85%B3-%E8%B8%8F-%E8%BB%8A/677031309' },
      { title: '你所不知道的杜振熙之内部整修', year: '2013', url: 'https://music.apple.com/us/album/%E4%BD%A0%E6%89%80%E4%B8%8D%E7%9F%A5%E9%81%93%E7%9A%84%E6%9D%9C%E6%8C%AF%E7%86%99%E4%B9%8B%E5%85%A7%E9%83%A8%E6%95%B4%E4%BF%AE/1448339502' },
      { title: '家常音乐', year: '2020', url: 'https://rsdr.online/news/90' }
    ]
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initShelf(scroll) {
    const albums = catalogs[scroll.dataset.albumShelf];
    const stack = scroll.querySelector('.album-stack');
    if (!albums || !stack) return;
    const covers = [...stack.querySelectorAll('.album-cover')];
    const indexButtons = [...scroll.querySelectorAll('.album-index button')];
    const count = scroll.querySelector('.album-count');
    const year = scroll.querySelector('.album-year');
    const title = scroll.querySelector('.album-title');
    const link = scroll.querySelector('.album-link');
    const previous = scroll.querySelector('.album-previous');
    const next = scroll.querySelector('.album-next');
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
      count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(albums.length).padStart(2, '0')}`;
      year.textContent = album.year;
      title.textContent = album.title;
      link.href = album.url;
    }

    function goTo(index) {
      const target = Math.max(0, Math.min(albums.length - 1, index));
      stack.classList.remove('is-scrolling');
      show(target);
      scroll.scrollTo({ top: target * pageHeight, behavior: 'auto' });
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
      const upcoming = covers[index + 1];
      front.style.transform = `translateY(${-115 * fraction}px) rotate(${-2 - 9 * fraction}deg) scale(${1 - .1 * fraction})`;
      front.style.opacity = String(1 - .92 * fraction);
      upcoming.style.transform = `translate(${20 * (1 - fraction)}px, ${-14 * (1 - fraction)}px) rotate(${5 * (1 - fraction)}deg) scale(${.96 + .04 * fraction})`;
      upcoming.style.opacity = '1';
    }

    function resizePages() {
      pageHeight = scroll.clientHeight || 620;
      scroll.style.setProperty('--album-page-height', `${pageHeight}px`);
      scroll.scrollTop = current * pageHeight;
    }

    covers.forEach((cover, index) => cover.addEventListener('click', () => goTo(index === current ? current + 1 : index)));
    indexButtons.forEach((button, index) => button.addEventListener('click', () => goTo(index)));
    previous.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
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
  }

  document.querySelectorAll('[data-album-shelf]').forEach(initShelf);
})();
