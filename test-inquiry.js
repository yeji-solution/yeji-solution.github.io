'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/inquiry.js', 'utf8');

function run(search, storage = new Map()) {
  const context = {
    location: { search, pathname: '/', origin: 'https://yeji-solution.github.io' }, window: {}, URL, URLSearchParams, Date, crypto,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    document: { readyState: 'loading', addEventListener() {} },
    fetch: async () => ({ ok: true })
  };
  vm.runInNewContext(source, context);
  return context.window.MailplugInquiry.attribution;
}
test('이미 발송한 링크를 20% 질문 그룹과 기존 그룹으로 구분한다', () => {
  assert.equal(run('?utm_source=mailplug&utm_term=00000000').experiment, 'question_v1');
  assert.equal(run('?utm_source=mailplug&utm_term=00000001').experiment, 'control_v1');
});
test('새 메일에서 정한 그룹과 추적값을 유지한다', () => {
  const attr = run('?utm_source=mailplug&utm_term=1234abcd&batch=b1&experiment=control_v1');
  assert.equal(attr.experiment, 'control_v1'); assert.equal(attr.batch, 'b1'); assert.equal(attr.utm_term, '1234abcd');
});
test('사이트 안에서 이동해도 같은 문의 출처를 유지한다', () => {
  const storage = new Map(); run('?utm_source=mailplug&utm_term=00000000&batch=b1', storage);
  const attr = run('', storage); assert.equal(attr.batch, 'b1'); assert.equal(attr.experiment, 'question_v1');
});
test('다른 캠페인으로 다시 들어오면 예전 이메일 연결값이 섞이지 않는다', () => {
  const storage = new Map(); run('?utm_source=mailplug&utm_term=00000000&batch=b1', storage);
  const attr = run('?utm_source=other', storage); assert.equal(attr.batch, undefined); assert.equal(attr.utm_term, undefined);
});
