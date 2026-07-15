(() => {
  const form = document.getElementById('hold-form');

  if (!form) {
    return;
  }

  const statusBox = document.getElementById('reservation-status');
  const submitButton = form.querySelector('.reservation-submit');
  const consentCheckbox = document.getElementById('consent-checkbox');
  const productError = document.getElementById('product-error');
  const productSelects = [
    ...form.querySelectorAll('[data-product]')
  ];

  /*
   * 店舗側で商品を受付終了にする場合は、
   * falseをtrueへ変更してください。
   */
  const soldOut = {
    plain: false,
    lemon: false,
    fruit: false
  };

  /*
   * 商品のプルダウンを0〜4個で作成します。
   */
  productSelects.forEach((select) => {
    const isSoldOut = soldOut[select.dataset.product];

    for (let i = 0; i <= 4; i += 1) {
      const option = document.createElement('option');

      option.value = String(i);
      option.textContent =
        isSoldOut && i > 0
          ? `${i}（受付終了）`
          : String(i);

      option.disabled = isSoldOut && i > 0;

      select.appendChild(option);
    }

    if (isSoldOut) {
      const currentLabel =
        select.getAttribute('aria-label') || '';

      select.setAttribute(
        'aria-label',
        `${currentLabel}（受付終了）`
      );
    }
  });

  /*
   * 日本時間を取得します。
   */
  const nowInJapan = () => {
    return new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tokyo'
      })
    );
  };

  /*
   * 日曜日0:00〜金曜日11:59まで受付します。
   * 金曜日12:00以降と土曜日は受付終了です。
   */
  const isWithinReceptionHours = (date) => {
    const day = date.getDay();
    const hour = date.getHours();

    if (day === 6) {
      return false;
    }

    if (day === 5 && hour >= 12) {
      return false;
    }

    return true;
  };

  /*
   * 次の土曜日を取得します。
   */
  const nextSaturday = (date) => {
    const result = new Date(date);
    const daysUntilSaturday =
      (6 - result.getDay() + 7) % 7;

    result.setDate(
      result.getDate() + daysUntilSaturday
    );

    return result;
  };

  const formatDate = (date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日（土）`;
  };

  const current = nowInJapan();
  const receptionIsOpen =
    isWithinReceptionHours(current);
  const targetSaturday =
    nextSaturday(current);

  /*
   * 同意チェックの状態に合わせて
   * 送信ボタンを有効・無効にします。
   */
  const updateSubmitButton = () => {
    if (!receptionIsOpen) {
      submitButton.disabled = true;
      return;
    }

    submitButton.disabled =
      !consentCheckbox.checked;
  };

  /*
   * 受付中・受付終了の表示を切り替えます。
   */
  if (receptionIsOpen) {
    statusBox.className =
      'reservation-status is-open';

    statusBox.innerHTML =
      `<strong>${formatDate(targetSaturday)}分を受付中です。</strong>` +
      '<br>締切は前日の金曜日12:00です。';
  } else {
    statusBox.className =
      'reservation-status is-closed';

    statusBox.innerHTML =
      '<strong>今回のお取り置き受付は終了しました。</strong>' +
      '<br>次回分の受付開始までお待ちください。';

    form.classList.add('is-closed');

    [...form.elements].forEach((element) => {
      if (element.type !== 'hidden') {
        element.disabled = true;
      }
    });

    submitButton.disabled = true;
  }

  /*
   * チェックを入れたときだけ
   * 送信ボタンを押せるようにします。
   */
  consentCheckbox.addEventListener(
    'change',
    updateSubmitButton
  );

  updateSubmitButton();

  /*
   * 送信時に商品が1点以上選ばれているか確認します。
   */
  form.addEventListener('submit', (event) => {
    const total = productSelects.reduce(
      (sum, select) => {
        return sum + Number(select.value || 0);
      },
      0
    );

    if (total < 1) {
      event.preventDefault();

      productError.hidden = false;
      productSelects[0].focus();

      return;
    }

    if (!consentCheckbox.checked) {
      event.preventDefault();

      consentCheckbox.focus();

      return;
    }

    productError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = '送信中です…';
  });

  /*
   * 商品を選んだらエラー表示を消します。
   */
  productSelects.forEach((select) => {
    select.addEventListener('change', () => {
      const total = productSelects.reduce(
        (sum, item) => {
          return sum + Number(item.value || 0);
        },
        0
      );

      if (total > 0) {
        productError.hidden = true;
      }
    });
  });
})();