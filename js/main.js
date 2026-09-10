/* ============================================================
   个人主页交互脚本
   功能：
   1. 移动端菜单开合
   2. 页面滚动时给元素加「出现」动画
   3. 自动填充页脚年份
   4. 数字分身聊天（关键词匹配的简单问答）
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

// 4. 数字分身聊天
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');

// 数字分身「知道」的信息，每条包含：关键词数组 + 对应回答
const twinKnowledge = [
  {
    keywords: ['名字', '叫什么', '姓名', '你是谁', '称呼'],
    answer: '我叫张景怡～一个爱玩、沉迷 R&B 音乐的大一女孩 😊'
  },
  {
    keywords: ['学校', '学院', '大学', '未来技术学院'],
    answer: '我读于天津大学香港理工大学深圳未来技术学院。'
  },
  {
    keywords: ['专业', '学什么', '计算机'],
    answer: '我的专业是计算机科学与技术，现在是一名大一新生。'
  },
  {
    keywords: ['身份', '职业', '做什么的', '现在在做什么', '最近'],
    answer: '我是大一新生，最近主要在认真学习，打牢基础。'
  },
  {
    keywords: ['兴趣', '爱好', '喜欢', '音乐', 'r&b', 'rnb', '羽毛球', '社交'],
    answer: '我喜欢音乐（尤其 R&B）、羽毛球，也喜欢社交认识新朋友～'
  },
  {
    keywords: ['擅长', '钻研', '数学', '研究', '厉害'],
    answer: '我擅长钻研，特别喜欢研究数学～'
  },
  {
    keywords: ['特点', '虎牙', '记忆点', '特别'],
    answer: '我最有记忆点的特点，就是我的虎牙啦 😁'
  },
  {
    keywords: ['你好', 'hi', 'hello', '嗨', '在吗'],
    answer: '你好呀！我是张景怡的数字分身，你可以问我名字、专业、兴趣、爱好之类的～'
  },
  {
    keywords: ['谢谢', '感谢'],
    answer: '不客气呀，能帮到你就好～'
  }
];

// 没匹配到时的兜底回答
const fallbackAnswer =
  '这个问题我还在学习中～你可以问我关于名字、学校、专业、兴趣、爱好、擅长的事哦！';

// 根据用户输入匹配最合适的回答
function getTwinReply(input) {
  const text = input.toLowerCase();
  for (const item of twinKnowledge) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.answer;
    }
  }
  return fallbackAnswer;
}

// 往聊天框里追加一条消息
function addMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (sender === 'user' ? 'msg-user' : 'msg-bot');
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight; // 自动滚动到最新
  return bubble;
}

// 数字分身回复：先显示“正在输入…”，短暂延迟后再回答
function botReply(question) {
  const typing = addMessage('正在输入…', 'bot');
  typing.classList.add('msg-typing');

  const answer = getTwinReply(question);

  setTimeout(() => {
    typing.remove();
    addMessage(answer, 'bot');
  }, 600);
}

if (chatForm && chatInput && chatMessages) {
  // 提交问题
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;
    addMessage(q, 'user');
    chatInput.value = '';
    botReply(q);
  });

  // 点击快捷问题
  if (chatSuggestions) {
    chatSuggestions.querySelectorAll('.suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.textContent.trim();
        addMessage(q, 'user');
        botReply(q);
      });
    });
  }

  // 开场欢迎语
  addMessage(
    '你好呀！我是张景怡的数字分身，你可以问我关于名字、专业、兴趣、爱好之类的问题～',
    'bot'
  );
}
