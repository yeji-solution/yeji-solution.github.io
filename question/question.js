(function () {
  'use strict';
  var service = window.MailplugInquiry;
  if (!service) return;
  var form = document.getElementById('question-form'), topic = '';
  if (!form) return;
  var presets = {
    conversion: '클릭은 있는데 구매가 적어요. 무엇부터 확인하면 좋을까요?',
    budget: '광고비를 늘려도 될까요? 예산을 늘리기 전에 무엇을 확인하면 좋을까요?',
    start: '광고를 어디서부터 시작하면 좋을까요?'
  };
  var text = document.getElementById('question-text');
  var hints = {
    conversion: ['광고 클릭 이후 구매까지 기록이 연결되는지 확인해보세요.', '전체 평균보다 상품·검색어별로 차이가 있는지 살펴보세요.', '가격·배송·재고 등 구매를 망설이게 하는 조건도 함께 보세요.'],
    budget: ['현재 광고비에서 남는 이익을 먼저 확인해보세요.', '예산이 부족해 노출이 끊기는 구간인지 살펴보세요.', '예산을 늘린 뒤 비교할 기간과 기준을 미리 정해두세요.'],
    start: ['지금 집중할 상품이나 판매 목표를 먼저 정해보세요.', '주문을 어떤 경로에서 확인할 수 있는지 살펴보세요.', '처음 시험할 예산과 감당할 수 있는 범위를 정해보세요.']
  };
  var linked = false;
  var emailInput = document.getElementById('reply-email');
  emailInput.required = true;
  if (service.attribution.utm_source === 'mailplug' && /^[a-f0-9]{8}$/.test(service.attribution.utm_term || '') && service.attribution.batch) {
    document.getElementById('reply-help').textContent = '메일 수신 주소를 확인하고 있습니다. 확인되지 않으면 답변받을 이메일을 입력해주세요.';
    fetch(service.api + '/recipient-context', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attribution: service.attribution }) })
      .then(function (response) { if (!response.ok) throw new Error('확인 실패'); return response.json(); })
      .then(function (data) {
        linked = data.can_reply_without_email === true;
        emailInput.required = !linked;
        document.getElementById('email-requirement').textContent = linked ? '(선택)' : '(필수)';
        document.getElementById('reply-help').textContent = linked ? '이메일을 생략하면 안내받은 메일 수신 주소로 답변드립니다. 다른 주소로 답변받으려면 입력해주세요.' : '메일 수신 주소를 확인하지 못했습니다. 답변받을 이메일을 입력해주세요.';
      }).catch(function () { document.getElementById('reply-help').textContent = '메일 수신 주소를 확인하지 못했습니다. 답변받을 이메일을 입력해주세요.'; });
  }
  var inlineQuestion = document.getElementById('quick-question');
  if (inlineQuestion) {
    inlineQuestion.addEventListener('toggle', function () { if (inlineQuestion.open) service.event('question_view'); });
  } else {
    service.event('question_view');
  }
  document.querySelectorAll('[data-topic]').forEach(function (button) {
    button.addEventListener('click', function () {
      topic = topic === button.dataset.topic ? '' : button.dataset.topic;
      document.querySelectorAll('[data-topic]').forEach(function (el) { el.setAttribute('aria-pressed', String(el.dataset.topic === topic)); });
      text.required = !presets[topic];
      document.getElementById('question-label').textContent = presets[topic] ? '더 알려주실 내용' : '직접 질문하기';
      document.getElementById('question-requirement').textContent = presets[topic] ? '(선택)' : '(질문 선택 또는 직접 입력)';
      document.getElementById('question-help').textContent = presets[topic] ? '선택한 질문으로 바로 접수할 수 있습니다. 추가 설명은 선택입니다.' : '질문을 고르거나 직접 적어주세요. 계정 비밀번호나 고객 정보는 필요하지 않습니다.';
      if (topic === 'other') text.focus();
      var checks = document.getElementById('checks');
      checks.replaceChildren();
      if (hints[topic]) {
        var label = document.createElement('strong'); label.textContent = '먼저 살펴볼 세 가지'; checks.appendChild(label);
        var list = document.createElement('ul');
        hints[topic].forEach(function (text) { var item = document.createElement('li'); item.textContent = text; list.appendChild(item); });
        checks.appendChild(list);
      }
      checks.hidden = !hints[topic];
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var detail = text.value.trim();
    var question = presets[topic] ? presets[topic] + (detail ? '\n\n추가 설명: ' + detail : '') : detail;
    var error = document.getElementById('error'); error.hidden = true;
    if (!question) { error.textContent = '질문을 고르거나 직접 적어주세요.'; error.hidden = false; return; }
    if (question.length > 3000) { error.textContent = '질문과 추가 설명을 합해 3,000자 이내로 줄여주세요.'; error.hidden = false; return; }
    var email = emailInput.value.trim();
    if (!email && !linked) { error.textContent = '답변받을 이메일을 입력해주세요.'; error.hidden = false; emailInput.focus(); return; }
    var button = form.querySelector('button[type=submit]');
    button.disabled = true; button.textContent = '질문을 전달하고 있습니다…'; form.setAttribute('aria-busy', 'true');
    fetch(service.api + '/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, topic: topic, reply_email: email, website: document.getElementById('question-website').value, attribution: service.attribution })
    }).then(function (response) {
      return response.json().then(function (data) { if (!response.ok || !data.ok) throw new Error(data.error || '접수하지 못했습니다. 다시 시도해주세요.'); return data; });
    }).then(function (data) {
      form.hidden = true; form.removeAttribute('aria-busy');
      var success = document.getElementById('success'); success.hidden = false;
      document.getElementById('receipt').textContent = '접수 번호: ' + data.id;
      document.getElementById('success-message').textContent = email ? '남겨주신 이메일로 답변드리겠습니다.' : linked ? '메일 수신 주소와 연결되는지 확인한 뒤 해당 주소로 답변드리겠습니다.' : '답변 주소를 남기지 않으셨습니다. 답변을 받고 싶으시면 접수 번호와 함께 카카오톡으로 알려주세요.';
      success.focus();
    }).catch(function (err) {
      error.textContent = (err instanceof TypeError ? '연결이 원활하지 않습니다. 작성한 내용은 유지됩니다. 잠시 후 다시 시도해주세요.' : err.message);
      error.hidden = false; button.disabled = false; button.textContent = '질문 남기기 →'; form.removeAttribute('aria-busy');
    });
  });
})();
