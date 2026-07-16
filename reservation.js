(() => {
  const form = document.getElementById('hold-form');

  if (!form) {
    return;
  }

  const statusBox =
    document.getElementById('reservation-status');

  const submitButton =
    form.querySelector('.reservation-submit');

  const consentCheckbox =
    document.getElementById('consent-checkbox');

  const productError =
    document.getElementById('product-error');

  const setError =
    document.getElementById('set-error');

  const setTypeSelect =
    document.getElementById('set-type');

  const setContentField =
    document.getElementById('set-content-field');

  const setContentSelect =
    document.getElementById('set-content');

  const productSelects = [
    ...form.querySelectorAll('[data-product]')
  ];

  const soldOut = {
    plain: false,
    lemon: false,
    fruit: false
  };

  const setChoices = {
    "Queen’s Bouquet 6個セット 2,800円": [
      "プレーンスコーン2個＋フルーツスコーン2個＋レモンドリズルケーキ2個",
      "プレーンスコーン4個＋レモンドリズルケーキ2個",
      "フルーツスコーン4個＋レモンドリズルケーキ2個"
    ],

    "スコーン4個セット 1,350円": [
      "プレーンスコーン2個＋フルーツスコーン2個",
      "プレーンスコーン4個",
      "フルーツスコーン4個"
    ],

    "スコーン6個セット 2,000円": [
      "プレーンスコーン3個＋フルーツスコーン3個",
      "プレーンスコーン6個",
      "フルーツスコーン6個"
    ],

    "英国菓子4個セット 1,450円": [
      "プレーンスコーン2個＋レモンドリズルケーキ2個"
    ],

    "ティータイム4個セット 2,050円": [
      "プレーンスコーン2個＋フルーツスコーン2個",
      "プレーンスコーン4個",
      "フルーツスコーン4個"
    ],

    "ティータイム6個セット 2,700円": [
      "プレーンスコーン3個＋フルーツスコーン3個",
      "プレーンスコーン6個",
      "フルーツスコーン6個"
    ]
  };

  productSelects.forEach((select) => {
    const isSoldOut =
      soldOut[select.dataset.product];

    for (let i = 0; i <= 4; i += 1) {
      const option =
        document.createElement('option');

      option.value = String(i);

      option.textContent =
        isSoldOut && i > 0
          ? `${i}（受付終了）`
          : String(i);

      option.disabled =
        isSoldOut && i > 0;

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

  const resetSetContent = () => {
    setContentSelect.innerHTML = '';

    const firstOption =
      document.createElement('option');

    firstOption.value = '';
    firstOption.textContent =
      'セット内容を選択してください';

    setContentSelect.appendChild(firstOption);
  };

  const updateSetContent = () => {
    const selectedSet =
      setTypeSelect.value;

    resetSetContent();

    if (!selectedSet) {
      setContentField.hidden = true;
      setContentSelect.disabled = true;
      setError.hidden = true;
      return;
    }

    const choices =
      setChoices[selectedSet] || [];

    choices.forEach((choice) => {
      const option =
        document.createElement('option');

      option.value = choice;
      option.textContent = choice;

      setContentSelect.appendChild(option);
    });

    setContentField.hidden = false;
    setContentSelect.disabled = false;

    if (choices.length === 1) {
      setContentSelect.value = choices[0];
    }
  };

  setTypeSelect.addEventListener(
    'change',
    () => {
      updateSetContent();
      productError.hidden = true;
    }
  );

  setContentSelect.addEventListener(
    'change',
    () => {
      if (setContentSelect.value) {
        setError.hidden = true;
        productError.hidden = true;
      }
    }
  );

  updateSetContent();

  const nowInJapan = () => {
    return new Date(
      new Date().toLocaleString(
        'en-US',
        {
          timeZone: 'Asia/Tokyo'
        }
      )
    );
  };

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

  const current =
    nowInJapan();

  const receptionIsOpen =
    isWithinReceptionHours(current);

  const targetSaturday =
    nextSaturday(current);

  const updateSubmitButton = () => {
    if (!receptionIsOpen) {
      submitButton.disabled = true;
      return;
    }

    submitButton.disabled =
      !consentCheckbox.checked;
  };

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

  consentCheckbox.addEventListener(
    'change',
    updateSubmitButton
  );

  updateSubmitButton();

  const getIndividualProductTotal = () => {
    return productSelects.reduce(
      (sum, select) => {
        return sum + Number(select.value || 0);
      },
      0
    );
  };

  form.addEventListener(
    'submit',
    (event) => {
      const individualTotal =
        getIndividualProductTotal();

      const hasSet =
        Boolean(setTypeSelect.value);

      if (!individualTotal && !hasSet) {
        event.preventDefault();

        productError.hidden = false;
        productSelects[0].focus();

        return;
      }

      if (
        hasSet &&
        !setContentSelect.value
      ) {
        event.preventDefault();

        setError.hidden = false;
        setContentSelect.focus();

        return;
      }

      if (!consentCheckbox.checked) {
        event.preventDefault();
        consentCheckbox.focus();
        return;
      }

      productError.hidden = true;
      setError.hidden = true;

      submitButton.disabled = true;
      submitButton.textContent =
        '送信中です…';
    }
  );

  productSelects.forEach((select) => {
    select.addEventListener(
      'change',
      () => {
        const individualTotal =
          getIndividualProductTotal();

        if (
          individualTotal > 0 ||
          setTypeSelect.value
        ) {
          productError.hidden = true;
        }
      }
    );
  });
})();