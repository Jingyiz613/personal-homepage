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
      version: 'V3'
    };

    form.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
    submitButton.firstChild.textContent = '正在送出… ';
    setStatus('正在把纸条送进工作室…');

    try {
      const { error } = await client.from('feedback').insert(payload);
      if (error) throw error;
      lastSuccessfulSubmit = Date.now();
      resetFormAfterSuccess();
      setStatus('谢谢你的反馈！已经收到啦 ✦', 'success');
    } catch (error) {
      console.error('Feedback submission failed:', error);
      setStatus('这次没有成功送达，请检查网络后重试。你的内容还保留着。', 'error');
    } finally {
      form.setAttribute('aria-busy', 'false');
      submitButton.disabled = false;
      submitButton.firstChild.textContent = '送出反馈 ';
    }
  });
})();
