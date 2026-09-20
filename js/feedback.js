(() => {
  const dialog = document.getElementById('feedbackDialog');
  const openButton = document.getElementById('feedbackOpen');
  const closeButton = document.getElementById('feedbackClose');
  const cancelButton = document.getElementById('feedbackCancel');
  const form = document.getElementById('feedbackForm');
  const submitButton = document.getElementById('feedbackSubmit');
  const message = document.getElementById('feedbackMessage');
  const count = document.getElementById('feedbackCount');
  const status = document.getElementById('feedbackStatus');
  const device = document.getElementById('feedbackDevice');
  const publicOption = document.getElementById('feedbackPublic');
  const list = document.getElementById('feedbackList');
  const summary = document.getElementById('feedbackSummary');
  const refreshButton = document.getElementById('feedbackRefresh');
  if (!dialog || !openButton || !form) return;

  const config = window.SUPABASE_CONFIG || {};
  const configured = /^https:\/\/.+\.supabase\.co\/?$/i.test(config.url || '')
    && typeof config.publishableKey === 'string'
    && !config.publishableKey.startsWith('YOUR_');
  const client = configured && window.supabase
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;
  let lastSuccessfulSubmit = 0;

  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function renderFeedback(entries) {
    list.replaceChildren();
    summary.textContent = entries.length
      ? `共展示最近 ${entries.length} 条公开留言`
      : '还没有公开留言，欢迎留下第一张纸条。';

    if (!entries.length) {
      list.append(createTextElement('p', 'feedback-list-state', '留言簿还是空的，等你来留下第一句话 ✦'));
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
      const article = document.createElement('article');
      article.className = 'feedback-entry';

      const head = document.createElement('div');
      head.className = 'feedback-entry-head';
      head.append(
        createTextElement('span', 'feedback-entry-name', entry.name?.trim() || '匿名访客'),
        createTextElement('time', 'feedback-entry-date', formatDate(entry.created_at))
      );
      article.append(head, createTextElement('p', 'feedback-entry-message', entry.message));

      if (entry.reply?.trim()) {
        const reply = document.createElement('div');
        reply.className = 'feedback-reply';
        const replyHead = document.createElement('div');
        replyHead.className = 'feedback-reply-head';
        replyHead.append(
          createTextElement('span', '', '景怡的回复'),
          createTextElement('span', 'feedback-reply-date', formatDate(entry.reply_at))
        );
        reply.append(replyHead, createTextElement('p', '', entry.reply));
        article.append(reply);
      }
      fragment.append(article);
    }
    list.append(fragment);
  }

  async function loadPublicFeedback() {
    if (!list || !summary || !refreshButton) return;
    if (!client) {
      summary.textContent = '留言簿暂时无法连接';
      list.replaceChildren(createTextElement('p', 'feedback-list-state', '数据库还在配置中，请稍后再来看看。'));
      return;
    }

    list.setAttribute('aria-busy', 'true');
    refreshButton.disabled = true;
    refreshButton.textContent = '读取中…';
    try {
      const { data, error } = await client
        .from('feedback')
        .select('id,name,message,created_at,reply,reply_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      renderFeedback(data || []);
    } catch (error) {
      console.error('Public feedback loading failed:', error);
      summary.textContent = '公开留言读取失败';
      list.replaceChildren(createTextElement('p', 'feedback-list-state', '暂时没能打开留言簿，请稍后刷新。'));
    } finally {
      list.setAttribute('aria-busy', 'false');
      refreshButton.disabled = false;
      refreshButton.textContent = '刷新留言';
    }
  }

  function detectDevice() {
    const agent = navigator.userAgent.toLowerCase();
    if (/ipad|tablet|playbook|silk/.test(agent)) return '平板';
    if (/mobi|android|iphone|ipod/.test(agent)) return '手机';
    return '电脑';
  }

  function setStatus(text, type = '') {
    status.textContent = text;
    status.className = `feedback-status${type ? ` is-${type}` : ''}`;
  }

  function openDialog() {
    document.getElementById('navLinks')?.classList.remove('open');
    const navToggle = document.getElementById('navToggle');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', '打开菜单');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    window.setTimeout(() => document.getElementById('feedbackName')?.focus(), 0);
  }

  function closeDialog() {
    if (form.getAttribute('aria-busy') === 'true') return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    openButton.focus();
  }

  function resetFormAfterSuccess() {
    form.reset();
    device.value = detectDevice();
    count.textContent = '0 / 1000';
  }

  device.value = detectDevice();
  refreshButton?.addEventListener('click', loadPublicFeedback);
  openButton.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);
  cancelButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  message.addEventListener('input', () => {
    count.textContent = `${message.value.length} / 1000`;
    if (status.classList.contains('is-error')) setStatus('');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (document.getElementById('feedbackWebsite').value) {
      resetFormAfterSuccess();
      setStatus('谢谢你的反馈！已经收到啦 ✦', 'success');
      return;
    }

    if (!client) {
      setStatus('反馈数据库还在配置中，请稍后再来看看。', 'error');
      return;
    }

    if (Date.now() - lastSuccessfulSubmit < 15000) {
      setStatus('上一条已经送达，请稍等一会儿再提交。', 'error');
      return;
    }

    const payload = {
      name: document.getElementById('feedbackName').value.trim() || null,
      relation: document.getElementById('feedbackRelation').value,
      device: device.value,
      message: message.value.trim(),
      version: 'V3',
      is_public: Boolean(publicOption?.checked)
    };

    form.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
    submitButton.firstChild.textContent = '正在送出… ';
    setStatus('正在把纸条送进工作室…');

    try {
      const { error } = await client.from('feedback').insert(payload);
      if (error) throw error;
      lastSuccessfulSubmit = Date.now();
      const requestedPublicDisplay = payload.is_public;
      resetFormAfterSuccess();
      setStatus(
        requestedPublicDisplay
          ? '谢谢你的留言！审核通过后会出现在留言簿里 ✦'
          : '谢谢你的反馈！这条内容只会由站长查看 ✦',
        'success'
      );
    } catch (error) {
      console.error('Feedback submission failed:', error);
      setStatus('这次没有成功送达，请检查网络后重试。你的内容还保留着。', 'error');
    } finally {
      form.setAttribute('aria-busy', 'false');
      submitButton.disabled = false;
      submitButton.firstChild.textContent = '送出反馈 ';
    }
  });

  loadPublicFeedback();
})();
