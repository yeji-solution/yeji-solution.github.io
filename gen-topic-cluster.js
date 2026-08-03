#!/usr/bin/env node
/**
 * 블로그 토픽 클러스터(주제별 상호 링크) 생성기
 *
 * 배경: 19편 각각에 "다른 인사이트" 카드가 2개씩만 걸려 있어, 같은 주제의 글들이
 *       서로 이어지지 않고 흩어져 있었다. 검색엔진은 한 주제로 촘촘히 묶인 글 뭉치를
 *       "그 분야를 깊이 다루는 사이트"로 인식하므로, 같은 태그끼리 전부 연결해준다.
 *
 * 동작: 각 글의 첫 post-tag를 기준으로 같은 주제의 형제 글 목록을 만들어
 *       </article> 직후에 <nav class="topic-cluster"> 블록을 삽입/갱신한다.
 *       재실행해도 기존 블록을 교체하므로 중복되지 않는다.
 *
 * 사용법: node gen-topic-cluster.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BLOG = path.join(ROOT, 'blog');

const TOPICS = {
  naver:    { title: '네이버 광고 가이드',      desc: '검색광고 구조·품질지수·전환 추적까지 순서대로 읽어보세요.' },
  zigzag:   { title: '지그재그·에이블리 가이드', desc: 'AI 광고 구조와 썸네일 운영을 한 흐름으로 정리했습니다.' },
  coupang:  { title: '쿠팡 광고 가이드',        desc: '쿠팡 광고 시작부터 ROAS 개선까지 이어서 읽어보세요.' },
  ohouse:   { title: '오늘의집 광고 가이드',    desc: '가구·인테리어 카테고리 광고 운영 자료입니다.' },
  strategy: { title: '광고 전략 가이드',        desc: '매체를 가리지 않고 통하는 운영 원칙들입니다.' },
  kakao:    { title: '카카오모먼트 가이드',      desc: '비즈보드·피드 광고 등 카카오 광고 운영 자료입니다.' },
};

const MARK_START = '<!-- topic-cluster:start -->';
const MARK_END   = '<!-- topic-cluster:end -->';

function readPosts() {
  return fs.readdirSync(BLOG, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(slug => {
      const file = path.join(BLOG, slug.name, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      return {
        slug: slug.name,
        file,
        html,
        topic: (html.match(/post-tag\s+([a-z]+)/) || [])[1] || 'strategy',
        title: (html.match(/og:title"\s+content="([^"]+)"/) || [])[1] || slug.name,
        date:  (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || '',
      };
    });
}

function buildBlock(post, siblings) {
  const meta = TOPICS[post.topic] || TOPICS.strategy;

  const items = siblings.map(s =>
    `        <li><a href="/blog/${s.slug}/">${s.title}</a></li>`
  ).join('\n');

  return `${MARK_START}
  <nav class="topic-cluster" aria-label="${meta.title}">
    <div class="tc-head">
      <span class="tc-tag ${post.topic}">${meta.title}</span>
      <p class="tc-desc">${meta.desc}</p>
    </div>
    <ul class="tc-list">
${items}
    </ul>
    <a class="tc-all" href="/blog/">인사이트 전체 보기 →</a>
  </nav>
  ${MARK_END}`;
}

const CSS = `
/* ===== 토픽 클러스터 (주제별 상호 링크) ===== */
.topic-cluster {
  margin: 40px 0 8px; padding: 26px 28px;
  background: #fff; border: 1px solid var(--line, #E8EAED);
  border-radius: 16px;
}
.tc-head { margin-bottom: 16px; }
.tc-tag {
  display: inline-block; font-size: 12px; font-weight: 800;
  letter-spacing: 0.04em; padding: 5px 12px; border-radius: 999px;
  background: #EEF2FF; color: #1B2A4E;
}
.tc-tag.naver   { background: #E9FBEF; color: #009B2F; }
.tc-tag.zigzag  { background: #FEF1F5; color: #E32869; }
.tc-tag.coupang { background: #FDEEEC; color: #B32B21; }
.tc-tag.ohouse  { background: #EDF5FD; color: #2A6FB3; }
.tc-desc {
  margin: 10px 0 0; font-size: 13.5px; line-height: 1.6;
  color: var(--text-sub, #4B5563);
}
.tc-list { list-style: none; margin: 0; padding: 0; }
.tc-list li { border-top: 1px solid var(--line, #E8EAED); }
.tc-list a {
  display: flex; align-items: center; min-height: 48px;
  padding: 12px 0; font-size: 14.5px; font-weight: 600;
  color: var(--text, #1A1D24); text-decoration: none; line-height: 1.5;
  transition: color 0.15s;
}
.tc-list a:hover { color: #009B2F; }
.tc-list a::before { content: '→'; margin-right: 10px; color: #A3AAB6; flex-shrink: 0; }
.tc-all {
  display: inline-block; margin-top: 16px; font-size: 13.5px;
  font-weight: 700; color: var(--text-sub, #4B5563); text-decoration: none;
  padding: 10px 0; min-height: 44px; display: flex; align-items: center;
}
.tc-all:hover { color: #009B2F; }
@media (max-width: 640px) {
  .topic-cluster { padding: 22px 20px; border-radius: 14px; }
  .tc-list a { font-size: 14px; }
}
`;

function main() {
  const posts = readPosts();
  const byTopic = {};
  posts.forEach(p => { (byTopic[p.topic] = byTopic[p.topic] || []).push(p); });

  let updated = 0;

  for (const post of posts) {
    const siblings = byTopic[post.topic]
      .filter(p => p.slug !== post.slug)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // 형제 글이 없으면(단독 주제) 클러스터를 만들 이유가 없다
    if (!siblings.length) { console.log(`- ${post.slug}: 같은 주제 글 없음, 건너뜀`); continue; }

    let html = post.html;

    // 기존 블록이 있으면 교체 (재실행 안전)
    const existing = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`);
    const block = buildBlock(post, siblings);

    if (existing.test(html)) {
      html = html.replace(existing, block);
    } else if (html.includes('</article>')) {
      html = html.replace('</article>', `</article>\n\n  ${block}\n`);
    } else {
      console.warn(`- ${post.slug}: </article> 를 찾지 못해 건너뜀`);
      continue;
    }

    fs.writeFileSync(post.file, html);
    updated++;
    console.log(`✓ ${post.slug} — 같은 주제 ${siblings.length}편 연결`);
  }

  // 공통 CSS 는 blog/blog.css 에 한 번만 추가
  const cssFile = path.join(BLOG, 'blog.css');
  let css = fs.readFileSync(cssFile, 'utf8');
  const cssMark = '/* ===== 토픽 클러스터 (주제별 상호 링크) ===== */';
  if (css.includes(cssMark)) {
    css = css.slice(0, css.indexOf(cssMark)).trimEnd() + '\n' + CSS;
  } else {
    css = css.trimEnd() + '\n' + CSS;
  }
  fs.writeFileSync(cssFile, css);

  console.log(`\n총 ${updated}편에 토픽 클러스터 삽입 · blog.css 갱신 완료`);
}

main();
