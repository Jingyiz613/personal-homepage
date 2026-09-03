/* ============================================================
   个人主页交互脚本
   功能：
   1. 移动端菜单开合
   2. 页面滚动时给元素加「出现」动画
   3. 自动填充页脚年份
   ============================================================ */

// 1. 移动端菜单：点击 ☰ 按钮，切换导航链接的显示/隐藏
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // 点击任意导航链接后，自动收起菜单（避免小屏下菜单一直展开）
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// 2. 滚动出现动画：元素进入视口时添加 .visible，触发 CSS 淡入
//    这里用 IntersectionObserver 监听，性能比监听 scroll 更好
const revealEls = document.querySelectorAll(
  '.card, .timeline-item, .section-title, .hero-inner'
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // 出现一次后停止观察，避免重复
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => {
  el.classList.add('reveal'); // 初始设为隐藏（配合 CSS）
  observer.observe(el);
});

// 3. 自动更新页脚年份
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
