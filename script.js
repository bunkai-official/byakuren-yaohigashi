(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const closeMenu = () => { nav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'メニューを開く'); };
  toggle.addEventListener('click', () => {
    nav.hidden = !nav.hidden;
    toggle.setAttribute('aria-expanded', String(!nav.hidden));
    toggle.setAttribute('aria-label', nav.hidden ? 'メニューを開く' : 'メニューを閉じる');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => {
    if (!nav.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', closeMenu, {passive: true});
  const dialog = document.querySelector('#detail-dialog');
  const title = document.querySelector('#dialog-title');
  const body = document.querySelector('#dialog-body');
  const showDialog = (heading, paragraphs) => {
    title.textContent = heading;
    body.replaceChildren(...paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    dialog.showModal();
  };
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  const news = { renewal: ['HPをリニューアルしました！'], competition: ['全日本大会に出場しました！'], all: ['HPをリニューアルしました！', '全日本大会に出場しました！'] };
  document.querySelectorAll('[data-news]').forEach(button => button.addEventListener('click', () => showDialog('お知らせ', news[button.dataset.news])));
  document.querySelector('#calendar-button').addEventListener('click', () => showDialog('行事予定', ['年少部：毎週木曜 19:00〜20:00', '女子部・壮年部・一般部：毎週木曜 20:00〜21:00', '大会・特別行事についてはお問い合わせください。']));
  document.querySelector('#telephone-button').addEventListener('click', () => showDialog('電話でのお問い合わせ', ['電話番号は現在未設定です。お問い合わせフォームをご利用ください。']));
  const form = document.querySelector('form');
  const fieldNames = {name:'名前',kana:'ふりがな',gender:'性別',age:'年齢',class:'希望クラス',date:'体験希望日',message:'その他'};
  let sending = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    showDialog('お問い合わせ内容の確認', []);
    const list = document.createElement('dl');
    const data = new FormData(form);
    Object.entries(fieldNames).forEach(([key, label]) => {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = data.get(key) || '未入力';
      list.append(dt, dd);
    });
    body.append(list);
    const local = ['','localhost','127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
    if (local || form.dataset.submissionEnabled !== 'true') {
      const note = document.createElement('p'); note.textContent = '現在は送信受付の準備中です。この内容はまだ送信されていません。'; body.append(note);
      return;
    }
    const send = document.createElement('button'); send.type = 'button'; send.className = 'button orange'; send.textContent = 'この内容で送信する'; body.append(send);
    send.addEventListener('click', async () => {
      if (sending) return;
      sending = true; send.disabled = true; send.textContent = '送信中…';
      try {
        const response = await fetch('/', {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()});
        if (!response.ok) throw new Error('送信エラー');
        location.href = form.getAttribute('action');
      } catch {
        sending = false; send.disabled = false; send.textContent = '再送信する';
        let error = body.querySelector('[role="alert"]');
        if (!error) { error = document.createElement('p'); error.setAttribute('role','alert'); body.append(error); }
        error.textContent = '送信できませんでした。時間をおいて再度お試しください。';
      }
    });
  });
})();
