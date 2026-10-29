'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/inquiry.js', 'utf8');

function run(search, storage = new Map()) {
  const context = {
    location: { search, pathname: '/', origin: 'https://yeji-solution.github.io' }, window: {}, URL, URLSearchParams, Date, crypto, navigator: {maxTouchPoints:0},
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

function trackedVisit(referrer, navigator) {
  const context={location:{search:'',pathname:'/',origin:'https://yeji-solution.github.io'},window:{},URL,URLSearchParams,Date,crypto,navigator,
    localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    document:{readyState:'loading',referrer,addEventListener(){}},fetch:async()=>({ok:true})};
  vm.runInNewContext(source,context);return context.window.MailplugInquiry.tracking();
}
test('iPad의 터치 정보는 방문마다 서버로 전달된다',()=>{
  assert.equal(trackedVisit('',{maxTouchPoints:5}).client.touchPoints,5);
  assert.equal(trackedVisit('',{maxTouchPoints:0}).client.touchPoints,0);
});
test('전달된 네이버·구글 검색어는 수집하고 비공개 검색어를 만들어내지 않는다',()=>{
  const naver=trackedVisit('https://search.naver.com/search.naver?query=%EB%A7%88%EC%BC%80%ED%8C%85',{maxTouchPoints:0});
  assert.equal(naver.last.source,'naver');assert.equal(naver.last.keyword,'마케팅');
  assert.equal(trackedVisit('https://www.google.com/search?q=marketing',{maxTouchPoints:0}).last.keyword,'marketing');
  assert.equal(trackedVisit('https://www.google.com/',{maxTouchPoints:0}).last.keyword,'');
});
