#!/usr/bin/env node
/**
 * 사이트 전체 핵심 수치 정합성 검사
 *
 * 배경: 같은 지표(누적 관리 광고비)가 index.html 3곳에 각각 하드코딩되어 있었고,
 *       그중 하나가 50억 → 500억으로 어긋난 채 배포되어 있었다.
 *       숫자를 다루는 마케터의 사이트에서 대표 수치가 10배 틀리면 신뢰가 무너진다.
 *
 * 사용법: node check-consistency.js   (배포 전 실행 / 종료코드 1이면 불일치)
 */

const fs = require('fs');
const path = require('path');

/* ── 정답 정의: 수치를 바꿀 땐 여기만 고치고 검사를 돌린다 ────────────── */
const FACTS = {
  누적광고비:   { value: '50억+',  patterns: [/(\d[\d,]*)\s*<(?:span|i)>억\+<\/(?:span|i)>/g, /누적 관리 광고비 (\d[\d,]*)억\+/g] },
  누적브랜드:   { value: '1,000+', patterns: [/(1,000)\s*<(?:span|i)>\+<\/(?:span|i)>/g] },
  경력연차:     { value: '7',      patterns: [/(\d+)년차/g] },
};

const ROOT = __dirname;
let failed = 0;

function readIndex() {
  return fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
}

/* ── 1. 누적 관리 광고비: HTML·JSON-LD 전체에서 단일 값인지 ───────────── */
function checkAdSpend(html) {
  const found = new Set();

  // <div class="stat-num">50<span>억+</span></div> / <span class="kpi-num">50<i>억+</i></span>
  for (const m of html.matchAll(/>(\d[\d,]*)<(?:span|i)>억\+<\/(?:span|i)>/g)) found.add(m[1]);
  // JSON-LD description 등 평문 표기
  for (const m of html.matchAll(/누적 관리 광고비 (\d[\d,]*)억\+/g)) found.add(m[1]);

  const expected = FACTS.누적광고비.value.replace('억+', '');

  if (found.size === 0) {
    console.error('✗ 누적 관리 광고비 표기를 찾지 못했습니다. 마크업이 바뀌었는지 확인하세요.');
    failed++;
  } else if (found.size > 1) {
    console.error(`✗ 누적 관리 광고비가 서로 다르게 표기되어 있습니다: ${[...found].join('억+, ')}억+`);
    failed++;
  } else if (![...found][0].includes(expected)) {
    console.error(`✗ 누적 관리 광고비가 기준값과 다릅니다. 기준 ${expected}억+ / 실제 ${[...found][0]}억+`);
    failed++;
  } else {
    console.log(`✓ 누적 관리 광고비 ${[...found][0]}억+ — ${found.size}종 표기 일치`);
  }
}

/* ── 2. 누적 운영 브랜드 ───────────────────────────────────────────── */
function checkBrands(html) {
  const found = new Set();
  for (const m of html.matchAll(/>(\d[\d,]*)<(?:span|i)>\+<\/(?:span|i)><\/span><span class="kpi-lbl">누적 운영 브랜드/g)) found.add(m[1]);
  for (const m of html.matchAll(/>(\d[\d,]*)<span>\+<\/span>\s*<\/div>\s*<div class="stat-label">누적 운영 브랜드/g)) found.add(m[1]);

  if (found.size > 1) {
    console.error(`✗ 누적 운영 브랜드가 서로 다르게 표기되어 있습니다: ${[...found].join(', ')}`);
    failed++;
  } else {
    console.log(`✓ 누적 운영 브랜드 ${[...found][0] || FACTS.누적브랜드.value} — 일치`);
  }
}

/* ── 3. 시뮬레이터: 회복 잠재력이 손실액에 종속되는지 ─────────────────── */
function checkSimulator(html) {
  if (/recoverMW\s*=\s*lossMW\s*\*/.test(html)) {
    console.log('✓ 시뮬레이터 회복 잠재력이 손실액에 종속됨 (손실 0 → 회복 0)');
  } else {
    console.error('✗ 시뮬레이터 회복 잠재력이 손실액과 무관하게 계산됩니다. "손실 0원인데 회복 잠재력 있음" 모순이 재발합니다.');
    failed++;
  }
}

/* ── 4. 개인정보 동의 절차가 살아있는지 ─────────────────────────────── */
function checkPrivacy(html) {
  const hasConsent = /name="privacy_consent"[^>]*required/.test(html);
  const hasPage = fs.existsSync(path.join(ROOT, 'privacy.html'));

  if (hasConsent && hasPage) {
    console.log('✓ 개인정보 수집·이용 동의 체크박스(필수) + 처리방침 페이지 존재');
  } else {
    if (!hasConsent) console.error('✗ 폼에 필수 개인정보 동의 체크박스가 없습니다 (개인정보보호법 제15조).');
    if (!hasPage)    console.error('✗ privacy.html 이 없습니다.');
    failed++;
  }
}

/* ── 5. 죽은 엔드포인트 호출이 남아있는지 ───────────────────────────── */
function checkDeadEndpoints(html) {
  if (/fetch\(\s*['"]\/notify['"]/.test(html)) {
    console.error("✗ GitHub Pages에서 항상 404인 fetch('/notify') 호출이 남아 있습니다.");
    failed++;
  } else {
    console.log('✓ 죽은 /notify 엔드포인트 호출 없음');
  }
}

/* ── 6. 사이트맵이 실제 페이지를 모두 담고 있는지 ────────────────────── */
function checkSitemap() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const posts = fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const missing = posts.filter(p => !sitemap.includes(`/blog/${p}/`));
  const hasPrivacy = sitemap.includes('privacy.html');

  if (missing.length) {
    console.error(`✗ 사이트맵 누락 ${missing.length}건: ${missing.join(', ')}`);
    failed++;
  } else {
    console.log(`✓ 사이트맵에 블로그 ${posts.length}편 모두 포함`);
  }

  if (!hasPrivacy) {
    console.error('✗ 사이트맵에 privacy.html 이 없습니다.');
    failed++;
  } else {
    console.log('✓ 사이트맵에 개인정보 처리방침 포함');
  }
}

/* ── 7. 블로그별 OG 이미지 존재 여부 ────────────────────────────────── */
function checkBlogOg() {
  const posts = fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);

  const missing = posts.filter(p => {
    const html = fs.readFileSync(path.join(ROOT, 'blog', p, 'index.html'), 'utf8');
    const m = html.match(/og:image"\s+content="([^"]+)"/);
    if (!m) return true;
    const file = m[1].replace('https://yeji-solution.github.io/', '');
    return !fs.existsSync(path.join(ROOT, file));
  });

  if (missing.length) {
    console.error(`✗ OG 이미지 누락 ${missing.length}건: ${missing.join(', ')}`);
    failed++;
  } else {
    console.log(`✓ 블로그 ${posts.length}편 OG 이미지 모두 존재`);
  }
}

/* ── 실행 ──────────────────────────────────────────────────────────── */
console.log('── YEJI SOLUTION 배포 전 정합성 검사 ──\n');
const html = readIndex();
checkAdSpend(html);
checkBrands(html);
checkSimulator(html);
checkPrivacy(html);
checkDeadEndpoints(html);
checkSitemap();
checkBlogOg();

console.log('');
if (failed) {
  console.error(`✗ ${failed}건의 문제가 발견되었습니다. 배포 전 수정하세요.`);
  process.exit(1);
}
console.log('✓ 전체 통과 — 배포 가능합니다.');
