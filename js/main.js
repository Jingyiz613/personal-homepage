const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', '打开菜单');
}
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-24% 0px -64% 0px' });
  sectionLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionObserver.observe(section);
  });
}

const greeting = document.getElementById('timeGreeting');
function updateGreeting() {
  const hour = new Date().getHours(); // Browser local time, not the owner's live activity.
  greeting.textContent = hour < 6 ? '夜深了，欢迎来这里坐一会儿 ✦'
    : hour < 12 ? '早呀，工作室迎来新的一天 ✦'
    : hour < 18 ? '下午好，来看看最近的灵感吧 ✦'
    : '晚上好，工作室的灯亮着呢 ✦';
}
updateGreeting();
setInterval(updateGreeting, 60 * 1000);

const lamp = document.getElementById('lampToggle');
const scene = document.getElementById('studioScene');
const hero = document.getElementById('home');
const lampFeedback = document.getElementById('lampFeedback');
let lampFeedbackTimer;
lamp.addEventListener('click', () => {
  const off = scene.classList.toggle('lamp-off');
  hero.classList.toggle('lamp-off', off);
  lamp.setAttribute('aria-pressed', String(!off));
  lamp.setAttribute('aria-label', off ? '打开台灯' : '关闭台灯');
  lamp.querySelector('.lamp-button-text span').textContent = off ? '点亮台灯' : '按下开关';
  lampFeedback.textContent = off ? '灯先休息一下，星星还在 ✧' : '好啦，继续待一会儿吧 ✦';
  lampFeedback.classList.add('is-visible');
  clearTimeout(lampFeedbackTimer);
  lampFeedbackTimer = setTimeout(() => lampFeedback.classList.remove('is-visible'), 2200);
});
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.course-card').forEach(card => {
  const button = card.querySelector('.course-flip');
  const front = card.querySelector('.course-front');
  const back = card.querySelector('.course-back');
  const courseName = card.querySelector('.course-title').textContent.replace(/\s+/g, ' ').trim();
  let hovered = false;
  let manuallyFlipped = false;
  function updateFlip() {
    const flipped = hovered || manuallyFlipped;
    card.classList.toggle('is-flipped', flipped);
    button.setAttribute('aria-pressed', String(flipped));
    button.setAttribute('aria-label', `${flipped ? '合上' : '翻开'}${courseName}的课程笔记`);
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
  }
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    manuallyFlipped = false;
    hovered = true;
    updateFlip();
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    updateFlip();
  });
  button.addEventListener('click', event => {
    if (event.pointerType === 'mouse' || (event.detail > 0 && hovered)) return;
    manuallyFlipped = !manuallyFlipped;
    updateFlip();
  });
});

const revealEls = document.querySelectorAll('.card, .timeline-item, .section-title');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .08 });
  revealEls.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
}

const messages = document.getElementById('chatMessages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const knowledge = [
  { keys: ['名字', '叫什么', '姓名', '你是谁', '称呼'], answer: '我叫张景怡～ESFJ，开朗活泼性情 😊' },
  { keys: ['学校', '学院', '大学', '未来技术学院'], answer: '我读于天津大学香港理工大学深圳未来技术学院。' },
  { keys: ['专业', '学什么', '计算机'], answer: '我的专业是计算机科学与技术，现在是一名大一新生。' },
  { keys: ['身份', '职业', '做什么的', '现在在做什么', '最近'], answer: '主页记录的是我作为大一新生学习计算机、尝试用 AI 和代码做作品的过程。至于此刻在做什么，我可没有实时消息哦～' },
  { keys: ['兴趣', '爱好', '喜欢', '音乐', 'r&b', 'rnb', 'hiphop', 'hip-hop', '嘻哈', '羽毛球', '社交'], answer: '我喜欢音乐，平时更常听 R&B and hiphop；也喜欢羽毛球和认识新朋友～' },
  { keys: ['擅长', '钻研', '数学', '研究', '厉害'], answer: '我擅长钻研，特别喜欢研究数学～' },
  { keys: ['特点', '虎牙', '记忆点', '特别'], answer: '我最有记忆点的特点，就是我的虎牙啦 😁' },
  { keys: ['网站', '主页', '怎么做', '如何制作'], answer: '这个个人主页是我用自然语言、原生 HTML/CSS/JavaScript 和 AI 协作一点点打磨出来的～' },
  { keys: ['你好', 'hi', 'hello', '嗨', '在吗'], answer: '你好呀！欢迎来到我的小工作室 ✦ 想聊聊音乐、羽毛球、学习，还是这个网站？' },
  { keys: ['谢谢', '感谢'], answer: '不客气呀，工作室随时欢迎你来坐坐～' }
];
const fallbacks = [
  '这个问题我的小脑袋暂时没有存档 👀 换个话题试试？音乐、羽毛球或者学习都可以～',
  '我还不知道这个答案耶。要不要问问我关于专业、音乐或者兴趣的事？ ✦',
  '这题先留在工作室的便签上吧～我现在能聊的是主页里记录的那些事。'
];
const questions = ['你叫什么名字？', '你喜欢什么音乐？', '为什么喜欢方大同？', '最喜欢哪张专辑？', '最喜欢哪首歌？', '你学什么专业？', '你的特点是什么？', '这个网站是怎么做的？', '你喜欢羽毛球吗？'];
let lastFallback = -1;
let lastQuestion = -1;
let lastTopic = null;
let replyQueue = Promise.resolve();
const fangReplies = {
  origin: '是一个喜欢方大同的朋友带着我一起听他的歌，后来我也爱上了～',
  album: '我最爱方大同的《未来》专辑！',
  song: '《未来》里我最喜欢的歌是《公园》～',
  overview: '朋友喜欢方大同，带着我一起听，后来我也爱上了。他的专辑里我最爱《未来》，里面最喜欢《公园》～'
};
function pickDifferent(items, previous) {
  if (previous < 0) return Math.floor(Math.random() * items.length);
  return (previous + 1 + Math.floor(Math.random() * (items.length - 1)) + items.length) % items.length;
}
function getReply(question) {
  const text = question.trim().toLowerCase();
  const mentionsFang = text.includes('方大同') || text.includes('khalil');
  const asksAlbum = /专辑|哪张|哪一张/.test(text);
  const asksSong = /哪首|哪一首|歌曲|公园|最喜欢.{0,5}歌|最爱.{0,5}歌/.test(text);
  const asksOrigin = /为什么|怎么|如何|原因|认识|开始听|谁带|谁推荐/.test(text);
  const followsFang = lastTopic === 'fang' && text.length <= 14 && (asksAlbum || asksSong || asksOrigin);
  if (mentionsFang || followsFang || text.includes('公园') || /最爱.{0,4}专辑|最喜欢.{0,5}专辑|最喜欢.{0,5}歌|最爱.{0,5}歌|哪首歌/.test(text)) {
    lastTopic = 'fang';
    if (asksAlbum) return fangReplies.album;
    if (asksSong) return fangReplies.song;
    if (asksOrigin) return fangReplies.origin;
    return fangReplies.overview;
  }
  lastTopic = null;
  const match = knowledge.find(item => item.keys.some(key => text.includes(key)));
  if (match) return match.answer;
  lastFallback = pickDifferent(fallbacks, lastFallback);
  return fallbacks[lastFallback];
}
function addMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (sender === 'user' ? 'msg-user' : 'msg-bot');
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}
function sendQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  addMessage(clean, 'user');
  replyQueue = replyQueue.then(() => new Promise(resolve => {
    const typing = addMessage('正在输入', 'bot');
    typing.classList.add('msg-typing');
    setTimeout(() => {
      typing.remove();
      addMessage(getReply(clean), 'bot');
      resolve();
    }, 600);
  }));
}
form.addEventListener('submit', e => {
  e.preventDefault();
  sendQuestion(input.value);
  input.value = '';
});
document.querySelectorAll('#chatSuggestions .suggestion:not(.surprise)').forEach(button => {
  button.addEventListener('click', () => sendQuestion(button.textContent));
});
document.getElementById('surpriseQuestion').addEventListener('click', () => {
  lastQuestion = pickDifferent(questions, lastQuestion);
  sendQuestion(questions[lastQuestion]);
});
addMessage('你好呀！我是张景怡的数字分身。这里有关于她的小小问答，也可以点「随机问我」找个话题 ✦', 'bot');
