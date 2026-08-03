#!/usr/bin/env node
/**
 * 블로그 글별 OG 이미지 생성기
 *
 * 배경: 19편 전부가 공용 og-image.png 하나를 공유하고 있었다.
 *       카카오톡·슬랙으로 글 링크를 공유하면 모든 글이 똑같은 카드로 보여서
 *       "무슨 글인지" 구분이 안 되고 클릭률이 떨어진다.
 *
 * 동작: 각 blog/<slug>/index.html 에서 og:title 과 datePublished 를 읽어
 *       제목이 박힌 og/<slug>.png 를 만들고, og:image·twitter:image 를 교체한다.
 *
 * 사용법: node gen-blog-og.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = __dirname;
const BLOG = path.join(ROOT, 'blog');
const OUT  = path.join(ROOT, 'og');

const KO_FONT = "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

/* 매체별 악센트 — 카드만 봐도 어느 매체 글인지 구분되게 */
const ACCENTS = {
  naver:    { color: '#00C73C', dark: '#009B2F', label: 'NAVER'   },
  zigzag:   { color: '#FF3F7E', dark: '#E32869', label: 'ZIGZAG'  },
  coupang:  { color: '#D63A2E', dark: '#B32B21', label: 'COUPANG' },
  ohouse:   { color: '#3A8DDE', dark: '#2A6FB3', label: 'OHOUSE'  },
  strategy: { color: '#1B2A4E', dark: '#111C36', label: 'STRATEGY'},
};

/* HTML 속성에서 읽은 값이라 &#x27; 같은 엔티티가 섞여 있다.
   먼저 실제 문자로 되돌린 뒤 SVG용으로 다시 이스케이프해야
   이미지에 "&#x27;"가 그대로 그려지는 이중 이스케이프를 막을 수 있다. */
function decodeEntities(s) {
  return s
    .replace(/&#x27;/gi, "'").replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"').replace(/&#34;/g, '"')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&');
}

function esc(s) {
  return decodeEntities(s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* 한글은 글자폭이 거의 균일해서 글자 수 기준 줄바꿈이면 충분하다 */
function wrap(text, perLine) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > perLine && cur) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/* 글 본문에는 관련글 카드의 태그도 함께 들어있다.
   ACCENTS를 순회하며 "아무데나 있으면 채택"하면 전략 글이 ZIGZAG로 잡힌다.
   문서에서 가장 먼저 등장하는 post-tag = 그 글 자신의 태그다. */
function pickAccent(html) {
  const m = html.match(/post-tag\s+([a-z]+)/);
  return (m && ACCENTS[m[1]]) || ACCENTS.strategy;
}

function buildSvg({ title, date, accent }) {
  const lines = wrap(title, 17);
  const fontSize = lines.length >= 3 ? 50 : 58;
  const startY   = lines.length >= 3 ? 268 : 300;
  const lineGap  = fontSize + 20;

  const titleTspans = lines.map((l, i) =>
    `<text x="76" y="${startY + i * lineGap}" font-family="${KO_FONT}" font-size="${fontSize}" font-weight="800" fill="#1A1D24" letter-spacing="-2">${esc(l)}</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#F6F8FA"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent.color}"/><stop offset="100%" stop-color="${accent.dark}"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1030" cy="110" r="290" fill="${accent.color}" fill-opacity="0.07"/>
  <circle cx="150" cy="580" r="180" fill="${accent.color}" fill-opacity="0.04"/>
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>

  <text x="76" y="92" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="3" fill="${accent.dark}">YEJI SOLUTION</text>

  <rect x="76" y="122" width="${accent.label.length * 13 + 34}" height="34" rx="17" fill="url(#accent)"/>
  <text x="93" y="145" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF" letter-spacing="1">${accent.label}</text>
  <text x="${76 + accent.label.length * 13 + 52}" y="146" font-family="${KO_FONT}" font-size="17" font-weight="600" fill="#8B92A0">${esc(date)}</text>

  ${titleTspans}

  <rect x="76" y="486" width="6" height="42" rx="3" fill="url(#accent)"/>
  <text x="98" y="504" font-family="${KO_FONT}" font-size="19" font-weight="700" fill="#3A4150">이명수 마케터 · NAVER Ads Expert 공식 인증</text>
  <text x="98" y="528" font-family="${KO_FONT}" font-size="17" font-weight="500" fill="#6B7280">네이버 · 지그재그 · 쿠팡 · 오늘의집 1:1 전담 운영</text>

  <rect x="0" y="562" width="1200" height="68" fill="#1A1D24"/>
  <text x="76" y="604" font-family="${KO_FONT}" font-size="21" font-weight="700" fill="rgba(255,255,255,0.62)">무료 광고 진단 신청</text>
  <text x="272" y="604" font-family="Arial, sans-serif" font-size="21" font-weight="400" fill="rgba(255,255,255,0.28)">·</text>
  <text x="298" y="604" font-family="Arial, sans-serif" font-size="21" font-weight="600" fill="rgba(255,255,255,0.9)">yeji-solution.github.io</text>
</svg>`;
}

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const slugs = fs.readdirSync(BLOG, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);

  let made = 0;

  for (const slug of slugs) {
    const file = path.join(BLOG, slug, 'index.html');
    let html = fs.readFileSync(file, 'utf8');

    const title = (html.match(/og:title"\s+content="([^"]+)"/) || [])[1];
    const date  = (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || '';

    if (!title) { console.warn(`- ${slug}: og:title 없음, 건너뜀`); continue; }

    const svg = buildSvg({
      title: decodeEntities(title),
      date: date.replace(/-/g, '.'),
      accent: pickAccent(html),
    });

    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${slug}.png`));

    const url = `https://yeji-solution.github.io/og/${slug}.png`;
    html = html
      .replace(/(<meta property="og:image" content=")[^"]+(")/,  `$1${url}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]+(")/, `$1${url}$2`);

    fs.writeFileSync(file, html);
    made++;
    console.log(`✓ ${slug} — ${title.slice(0, 30)}`);
  }

  console.log(`\n총 ${made}편 OG 이미지 생성 완료 → og/`);
}

main().catch(e => { console.error('오류:', e); process.exit(1); });
