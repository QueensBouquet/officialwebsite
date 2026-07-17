(() => {
  const form = document.getElementById('hold-form');
  if (!form) return;

  const statusBox = document.getElementById('reservation-status');
  const submitButton = form.querySelector('.reservation-submit');
  const productError = document.getElementById('product-error');
  const productSelects = [...form.querySelectorAll('[data-product]')];

  // 店舗側で売り切れを手動設定する場合は true に変更します。
  const soldOut = {
    plain: false,
    lemon: false,
    fruit: false
  };

  productSelects.forEach(select => {
    const isSoldOut = soldOut[select.dataset.product];
    for (let i = 0; i <= 6; i += 1) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = isSoldOut && i > 0 ? `${i}（受付終了）` : String(i);
      option.disabled = isSoldOut && i > 0;
      select.appendChild(option);
    }
    if (isSoldOut) select.setAttribute('aria-label', `${select.getAttribute('aria-label')}（受付終了）`);
  });

  const nowInJapan = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

  // 日曜0:00〜金曜11:59を受付期間とします。金曜12:00以降と土曜は受付終了です。
  const isWithinReceptionHours = date => {
    const day = date.getDay();
    const hour = date.getHours();
    if (day === 6) return false;
    if (day === 5 && hour >= 12) return false;
    return true;
  };

  const nextSaturday = date => {
    const d = new Date(date);
    const daysUntilSaturday = (6 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    return d;
  };

  const formatDate = date => `${date.getMonth() + 1}月${date.getDate()}日（土）`;

  const current = nowInJapan();
  const open = isWithinReceptionHours(current);
  const targetSaturday = nextSaturday(current);

  if (open) {
    statusBox.className = 'reservation-status is-open';
    statusBox.innerHTML = `<strong>${formatDate(targetSaturday)}分を受付中です。</strong><br>締切は前日の金曜日12:00です。`;
  } else {
    statusBox.className = 'reservation-status is-closed';
    statusBox.innerHTML = '<strong>今回のお取り置き受付は終了しました。</strong><br>次回分の受付開始までお待ちください。';
    form.classList.add('is-closed');
    [...form.elements].forEach(element => {
      if (element.type !== 'hidden') element.disabled = true;
    });
    submitButton.disabled = true;
  }

  form.addEventListener('submit', event => {
    const total = productSelects.reduce((sum, select) => sum + Number(select.value || 0), 0);
    if (total < 1) {
      event.preventDefault();
      productError.hidden = false;
      productSelects[0].focus();
      return;
    }
    productError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = '送信中です…';
  });

  productSelects.forEach(select => {
    select.addEventListener('change', () => {
      const total = productSelects.reduce((sum, item) => sum + Number(item.value || 0), 0);
      if (total > 0) productError.hidden = true;
    });
  });
})();
