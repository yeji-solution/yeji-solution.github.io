#!/usr/bin/env node
/**
 * sitemap.xml 자동 생성
 *
 * 배경: 모든 URL의 lastmod 가 2026-06-21 로 고정되어 있었다. 글을 고쳐도 날짜가
 *       그대로면 검색엔진은 "바뀐 게 없는 사이트"로 보고 재수집 주기를 늦춘다.
 *       각 파일의 실제 수정 시각을 읽어 lastmod 에 반영한다.
 *
 * 사용법: node gen-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = 'https://yeji-solution.github.io';

function mtime(file) {
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

function url(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [];

entries.push(url(`${BASE}/`, mtime(path.join(ROOT, 'index.html')), 'weekly', '1.0'));
entries.push(url(`${BASE}/blog/`, mtime(path.join(ROOT, 'blog', 'index.html')), 'weekly', '0.8'));

const posts = fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

for (const slug of posts) {
  const file = path.join(ROOT, 'blog', slug, 'index.html');
  entries.push(url(`${BASE}/blog/${slug}/`, mtime(file), 'monthly', '0.7'));
}

/* 개인정보 처리방침 — 색인은 되되 우선순위는 낮게 */
entries.push(url(`${BASE}/privacy.html`, mtime(path.join(ROOT, 'privacy.html')), 'yearly', '0.2'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml 생성 완료 — 총 ${entries.length}개 URL (블로그 ${posts.length}편)`);
