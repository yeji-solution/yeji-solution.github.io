#!/usr/bin/env node
/**
 * sitemap.xml 자동 생성
 *
 * 기존 URL은 사이트맵의 lastmod를 유지하고, Git 작업 트리에서 실제로 변경된
 * 파일과 새 URL에만 파일 수정일을 반영한다. 체크아웃 시각만으로 모든 글의
 * 수정일이 바뀌는 일을 막는다.
 *
 * 사용법: node gen-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const BASE = 'https://yeji-solution.github.io';

function mtime(file) {
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
const previous = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const previousDates = new Map(
  [...previous.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
    .map((match) => [match[1], match[2]])
);

function lastmod(file, loc) {
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', relative], { cwd: ROOT });
  const diff = spawnSync('git', ['diff', '--quiet', 'HEAD', '--', relative], { cwd: ROOT });
  if (!previousDates.has(loc) || tracked.status !== 0 || diff.status !== 0) return mtime(file);
  return previousDates.get(loc);
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

entries.push(url(`${BASE}/`, lastmod(path.join(ROOT, 'index.html'), `${BASE}/`), 'weekly', '1.0'));
entries.push(url(`${BASE}/blog/`, lastmod(path.join(ROOT, 'blog', 'index.html'), `${BASE}/blog/`), 'weekly', '0.8'));

const posts = fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

for (const slug of posts) {
  const file = path.join(ROOT, 'blog', slug, 'index.html');
  entries.push(url(`${BASE}/blog/${slug}/`, lastmod(file, `${BASE}/blog/${slug}/`), 'monthly', '0.7'));
}

/* 개인정보 처리방침 — 색인은 되되 우선순위는 낮게 */
entries.push(url(`${BASE}/privacy.html`, lastmod(path.join(ROOT, 'privacy.html'), `${BASE}/privacy.html`), 'yearly', '0.2'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml 생성 완료 — 총 ${entries.length}개 URL (블로그 ${posts.length}편)`);
