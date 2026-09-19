#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const errors = [];
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '_src'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
}

function fail(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function localTargetExists(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return true;
  const relative = clean.startsWith('/') ? clean.slice(1) : clean;
  const target = path.join(root, relative);
  return fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
}

walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<html\b[^>]*lang="ko"/i.test(html)) fail(file, 'html lang="ko" 누락');
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(file, 'title 누락');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) fail(file, 'description 누락');
  if (!/<link\s+rel="canonical"\s+href="https:\/\/yeji-solution\.github\.io\//i.test(html)) fail(file, 'canonical 누락 또는 도메인 불일치');
  if (/pretendard(?:-dynamic-subset)?\.min\.css/i.test(html)) fail(file, '렌더링 차단 외부 폰트 CSS 잔존');

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(file, `중복 id: ${duplicateIds.join(', ')}`);

  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    if (!localTargetExists(href)) fail(file, `존재하지 않는 내부 링크: ${href}`);
  }

  for (const match of html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)) {
    const script = match[1].trim();
    if (!script) continue;
    try { new vm.Script(script, { filename: path.relative(root, file) }); }
    catch (error) { fail(file, `인라인 스크립트 문법 오류: ${error.message}`); }
  }

  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); }
    catch (error) { fail(file, `JSON-LD 문법 오류: ${error.message}`); }
  }
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
[
  ['<main id="content">', 'main 랜드마크'],
  ['id="resultsToggle"', '성과 접기/펼치기'],
  ['role="tab" aria-selected=', '접근 가능한 성과 탭'],
  ['aria-controls="qa-answer-1"', '접근 가능한 Q&A'],
  ["timeZone: 'Asia/Seoul'", '한국시간 기준 접수 가능 시점'],
  ["var SLOT_PERIOD = datePart.year", '동적 접수 가능 월 표시'],
].forEach(([needle, label]) => { if (!home.includes(needle)) fail(path.join(root, 'index.html'), `${label} 누락`); });

const sharedBlogScript = path.join(root, 'blog', 'blog.js');
try { new vm.Script(fs.readFileSync(sharedBlogScript, 'utf8'), { filename: 'blog/blog.js' }); }
catch (error) { fail(sharedBlogScript, `공통 스크립트 문법 오류: ${error.message}`); }

if (errors.length) {
  console.error(`검증 실패 (${errors.length}건)`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`검증 완료: HTML ${htmlFiles.length}개 · 내부 링크 · 중복 ID · JSON-LD · JavaScript 문법 통과`);
