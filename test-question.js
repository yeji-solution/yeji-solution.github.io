'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(__dirname + '/question/question.js', 'utf8');
class Element {
  value = ''; textContent = ''; hidden = false; required = true; disabled = false;
  listeners = {}; attributes = {}; children = [];
  addEventListener(name, callback) { this.listeners[name] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  replaceChildren() { this.children = []; }
  appendChild(element) { this.children.push(element); }
  focus() { this.focused = true; }
  fire(name) { this.listeners[name]({ preventDefault() {} }); }
}
function page({ linked = false, confirmed = false, failing = false, query = '' } = {}) {
  const elements = new Map(), posted = [], topics = ['conversion', 'budget', 'start', 'other'].map(topic => Object.assign(new Element(), { dataset: { topic } }));
  const events = [];
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  get('question-form').querySelector = () => get('submit');
  const attribution = linked ? { utm_source: 'mailplug', utm_term: '1234abcd', batch: 'batch1' } : {};
  vm.runInNewContext(source, {
    URLSearchParams, location: { search: query },
    window: { MailplugInquiry: { api: 'https://example.test', attribution, event(name) { events.push(name); } } },
    document: { getElementById: get, querySelectorAll: () => topics, createElement: () => new Element() },
    fetch: async (url, options) => {
      if (url.endsWith('/recipient-context')) return { ok: true, json: async () => ({ can_reply_without_email: confirmed }) };
      posted.push(JSON.parse(options.body));
      return { ok: !failing, json: async () => failing ? { error: '접수 서버 연결 실패' } : { ok: true, id: 'fixture-question' } };
    }
  });
  return { get, posted, events, choose: topic => topics.find(button => button.dataset.topic === topic).fire('click'), submit: () => get('question-form').fire('submit') };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('자가진단에서 전달한 상황은 문의 내용에 미리 들어가며 자동 접수되지 않는다', () => {
  const question = '[네이버 광고 10초 셀프 점검]\n현재 상황: 광고비 대비 매출이 아쉬워요';
  const p = page({ query: '?selfcheck=cost&question=' + encodeURIComponent(question) });
  assert.equal(p.get('question-text').value, question);
  assert.equal(p.get('question-label').textContent, '셀프 점검 결과에 대해 질문하기');
  assert.equal(p.posted.length, 0);
  const invalid = page({ query: '?selfcheck=invalid&question=' + encodeURIComponent(question) });
  assert.equal(invalid.get('question-text').value, '');
});

test('질문 페이지에서 질문 화면 방문을 기록한다', () => {
  assert.deepEqual(page().events, ['question_view']);
});
test('질문을 선택하면 직접 글을 쓰지 않고 접수할 수 있다', async () => {
  const p = page(); p.choose('budget'); p.get('reply-email').value = 'visitor@example.test';
  assert.equal(p.get('question-text').required, false);
  p.submit(); await flush();
  assert.equal(p.posted.length, 1); assert.equal(p.posted[0].topic, 'budget'); assert.match(p.posted[0].question, /예산을 늘리기 전/);
});
test('선택 질문에 추가 설명을 붙여 전달한다', async () => {
  const p = page(); p.choose('conversion'); p.get('reply-email').value = 'visitor@example.test'; p.get('question-text').value = '장바구니까지는 많이 들어옵니다.';
  p.submit(); await flush();
  assert.match(p.posted[0].question, /클릭은 있는데 구매/); assert.match(p.posted[0].question, /추가 설명: 장바구니/);
});
test('일반 유입은 이메일이 없으면 접수하지 않고 입력값을 유지한다', async () => {
  const p = page(); p.choose('start'); p.get('question-text').value = '네이버부터 시작하고 싶어요.';
  p.submit(); await flush();
  assert.equal(p.posted.length, 0); assert.equal(p.get('reply-email').required, false); assert.equal(p.get('reply-email').focused, true); assert.match(p.get('error').textContent, /이메일/);
  assert.equal(p.get('question-text').value, '네이버부터 시작하고 싶어요.');
});
test('서버에서 실제 수신 주소가 확인된 메일 유입만 이메일을 생략할 수 있다', async () => {
  const p = page({ linked: true, confirmed: true }); await flush(); p.choose('budget');
  assert.equal(p.get('reply-email').required, false); p.submit(); await flush(); assert.equal(p.posted.length, 1);
  const unknown = page({ linked: true, confirmed: false }); await flush(); unknown.choose('budget'); unknown.submit(); await flush();
  assert.equal(unknown.get('reply-email').required, false); assert.equal(unknown.posted.length, 0);
});
test('직접 질문을 선택하면 질문 내용이 필요하다', async () => {
  const p = page(); p.choose('other'); p.get('reply-email').value = 'visitor@example.test';
  assert.equal(p.get('question-text').required, true); p.submit(); await flush(); assert.equal(p.posted.length, 0);
  p.get('question-text').value = '지금 운영 매체를 바꿔도 괜찮을까요?'; p.submit(); await flush(); assert.equal(p.posted[0].question, '지금 운영 매체를 바꿔도 괜찮을까요?');
});
test('접수 실패 시 선택과 추가 설명을 유지하고 다시 제출할 수 있다', async () => {
  const p = page({ failing: true }); p.choose('start'); p.get('reply-email').value = 'visitor@example.test'; p.get('question-text').value = '처음 시작합니다.';
  p.submit(); await flush(); assert.equal(p.get('question-form').hidden, false); assert.equal(p.get('submit').disabled, false); assert.equal(p.get('question-text').value, '처음 시작합니다.');
});

test('이메일 없이 전화번호만 남겨 답변을 요청할 수 있다', async () => {
  const p=page();p.choose('start');p.get('reply-phone').value='010-1234-5678';p.submit();await flush();
  assert.equal(p.posted.length,1);assert.equal(p.posted[0].reply_phone,'010-1234-5678');assert.equal(p.posted[0].reply_email,'');
});
test('전화번호가 잘못되면 제출하지 않고 작성 내용을 유지한다', async () => {
  const p=page();p.choose('start');p.get('reply-phone').value='잘못된 전화번호';p.submit();await flush();
  assert.equal(p.posted.length,0);assert.equal(p.get('reply-phone').focused,true);
});
