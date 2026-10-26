const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const source = html.split('<!-- DIAGNOSIS SIMULATOR LOGIC -->')[1].match(/<script>([\s\S]*?)<\/script>/)[1];

function page(query = '') {
  const elements = new Map();
  let checks = [];
  class Element {
    constructor(id = '') {
      this.id = id; this.value = ''; this.hidden = false; this.checked = false;
      this.handlers = {}; this.dataset = {}; this._html = '';
      this.classList = { add() {}, toggle() {} };
    }
    addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }
    fire(name) { (this.handlers[name] || []).forEach(fn => fn.call(this)); }
    set innerHTML(value) {
      this._html = value;
      if (this.id === 'simIndustry') this.value = value.match(/value="([^"]*)"/)?.[1] || '';
      if (this.id === 'simChecks') checks = [...value.matchAll(/data-issue="([^"]+)"/g)].map(match => {
        const input = new Element(); input.dataset.issue = match[1]; return input;
      });
    }
    get innerHTML() { return this._html; }
    insertAdjacentHTML(_, value) { this._html = value + this._html; this.value = ''; }
    closest() { return this.label ||= new Element(); }
    querySelector(selector) { return get(selector); }
    querySelectorAll() { return checks; }
  }
  const get = id => { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); };
  ['simEntry', 'simRelated', 'simRefine'].forEach(id => { get(id).hidden = true; });
  get('simCtaBtn').href = '#contact';
  get('simCtaBtn').nextElementSibling = new Element();
  const media = ['naver_search', 'naver_gfa', 'zigzag', 'coupang', 'ohouse', 'kakao'].map(value => {
    const input = new Element(); input.value = value; input.checked = value === 'naver_search'; return input;
  });
  const document = {
    documentElement: new Element(),
    getElementById: get,
    querySelector: selector => selector.includes(':checked') ? media.find(input => input.checked) : get(selector),
    querySelectorAll: selector => {
      if (selector === 'input[name="simMedium"]') return media;
      if (selector === '#simChecks input:checked') return checks.filter(input => input.checked);
      if (selector === '.sim-check') return checks.map(input => ({ classList: { toggle() {} }, querySelector: () => input }));
      return [];
    }
  };
  vm.runInNewContext(source, { document, window: {}, location: { search: query, href: 'https://yeji-solution.github.io/' + query }, URL, URLSearchParams });
  return {
    get, media, checks: () => checks,
    inquiry: () => new URL(get('simCtaBtn').href),
  };
}

test('메일의 네 상황은 네이버 검색으로 고정하고 업종·운영 상태를 추정하지 않는다', () => {
  for (const key of ['start', 'clicks', 'cost', 'unsure']) {
    const p = page('?situation=' + key + '&utm_source=mailplug&utm_term=1234abcd&batch=preview&experiment=question_v1');
    assert.equal(p.get('simEntry').hidden, false);
    assert.equal(p.get('simSituation').value, key);
    assert.equal(p.get('simPriorities').innerHTML.match(/class="sp-num"/g).length, 3);
    assert.equal(p.media.find(input => input.checked).value, 'naver_search');
    assert.equal(p.media.filter(input => !input.closest().hidden).length, 1);
    assert.equal(p.media.every(input => input.disabled), true);
    assert.equal(p.get('simIndustry').value, '');
    assert.equal(p.checks().length, 5);
    assert.equal(p.checks().some(input => input.checked), false);
    const url = p.inquiry();
    assert.equal(url.pathname, '/question/');
    assert.equal(url.searchParams.get('selfcheck'), key);
    assert.equal(url.searchParams.get('batch'), 'preview');
    assert.equal(url.searchParams.get('utm_term'), '1234abcd');
    assert.match(url.searchParams.get('question'), /광고 유형: 네이버 검색\n업종: 미선택/);
    assert.doesNotMatch(p.get('simPriorities').innerHTML, /undefined/);
  }
});

test('업종 선택이 검색광고 문의 내용에 반영되고 상황 변경 시 이전 결과를 지운다', () => {
  const p = page('?situation=clicks');
  assert.match(p.get('simPriorities').innerHTML, /실제 유입된 검색어/);
  assert.equal(p.get('simIndustry').value, '');
  assert.equal(p.checks().some(input => input.checked), false);
  p.get('simIndustry').value = 'health'; p.get('simIndustry').fire('change');
  assert.match(p.inquiry().searchParams.get('question'), /광고 유형: 네이버 검색\n업종: 건강/);
  p.get('simSituation').value = 'cost'; p.get('simSituation').fire('change');
  assert.equal(p.inquiry().searchParams.get('selfcheck'), 'cost');
  assert.match(p.get('simPriorities').innerHTML, /상품·광고 그룹별 비용과 전환/);
  assert.doesNotMatch(p.get('simPriorities').innerHTML, /구매를 망설이게/);
  p.checks()[0].checked = true; p.checks()[0].fire('change');
  assert.match(p.get('simPriorities').innerHTML, /추가로 선택한 운영 상태/);
});

test('일반 방문과 잘못된 상황 값은 기존 자가진단으로 동작한다', () => {
  for (const query of ['', '?situation=invalid', '?situation=__proto__', '?situation=constructor', '?situation=%3Cscript%3E']) {
    const p = page(query);
    assert.equal(p.get('simEntry').hidden, true);
    assert.equal(p.get('simCtaBtn').href, '#contact');
    assert.equal(p.media.find(input => input.checked).value, 'naver_search');
    assert.equal(p.checks().length, 5);
    p.checks()[0].checked = true; p.checks()[0].fire('change');
    assert.match(p.get('simPriorities').innerHTML, /검색어 정제/);
    assert.equal(p.get('simResultHeading').textContent, '먼저 확인할 항목 1개');
  }
});

test('지그재그 메일 상황 링크는 지그재그 매체로 열리고 추가 선택 아래에서도 문의할 수 있다',()=>{
  const p=page('?situation=clicks&ad_platform=zigzag&utm_source=mailplug&utm_term=1234abcd&batch=fixture');
  assert.equal(p.media.find(input=>input.checked).value,'zigzag');
  assert.equal(p.get('simRefineContact').hidden,false);
  assert.equal(p.get('simRefineCta').href,p.get('simCtaBtn').href);
  assert.match(p.inquiry().searchParams.get('question'),/지그재그 광고 10초 셀프 점검/);
  p.get('simIndustry').value='fashion';p.get('simIndustry').fire('change');
  assert.equal(p.get('simRefineCta').href,p.get('simCtaBtn').href);
});
