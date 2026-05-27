const sharp = require('sharp');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7F8FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="dualGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00C73C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF3F7E;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00C73C;stop-opacity:0.12" />
      <stop offset="100%" style="stop-color:#FF3F7E;stop-opacity:0.08" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Decorative circles -->
  <circle cx="980" cy="120" r="320" fill="url(#circleGrad)"/>
  <circle cx="200" cy="540" r="200" fill="#00C73C" fill-opacity="0.04"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="url(#dualGrad)"/>

  <!-- Top gradient bar -->
  <rect x="6" y="0" width="1194" height="4" fill="url(#dualGrad)" opacity="0.3"/>

  <!-- Brand -->
  <text x="72" y="100" font-family="Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="3" fill="#00C73C">YEJI SOLUTION</text>

  <!-- Name -->
  <text x="72" y="148" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1A1D24" letter-spacing="-1">이명수 마케터</text>

  <!-- Divider line -->
  <rect x="72" y="168" width="56" height="4" rx="2" fill="url(#dualGrad)"/>

  <!-- Main headline -->
  <text x="72" y="240" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="#1A1D24" letter-spacing="-1.5">결과가 나지 않는 광고엔,</text>
  <text x="72" y="308" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="#1A1D24" letter-spacing="-1.5">반드시 이유가 있습니다.</text>

  <!-- Sub -->
  <text x="72" y="372" font-family="Arial, sans-serif" font-size="26" fill="#4B5563" letter-spacing="-0.5">네이버 · 지그재그 광고 1:1 전담 운영</text>

  <!-- Badges row -->
  <!-- Badge 1: 네이버 프리미어 -->
  <rect x="72" y="416" width="242" height="42" rx="21" fill="#F1FBF4" stroke="#00C73C" stroke-width="1.5" stroke-opacity="0.6"/>
  <circle cx="99" cy="437" r="5" fill="#00C73C"/>
  <text x="114" y="443" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#009B2F">네이버 프리미어 파트너사</text>

  <!-- Badge 2: 지그재그 -->
  <rect x="326" y="416" width="250" height="42" rx="21" fill="#FEF1F5" stroke="#FF3F7E" stroke-width="1.5" stroke-opacity="0.6"/>
  <circle cx="353" cy="437" r="5" fill="#FF3F7E"/>
  <text x="368" y="443" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#E32869">지그재그 프리미어 에이전시</text>

  <!-- Badge 3: 자격증 -->
  <rect x="72" y="472" width="168" height="42" rx="21" fill="#F7F8FA" stroke="#D5D8DD" stroke-width="1.5"/>
  <text x="97" y="498" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#4B5563">검색광고마케터 1급</text>

  <!-- Badge 4: GAIQ -->
  <rect x="252" y="472" width="110" height="42" rx="21" fill="#F7F8FA" stroke="#D5D8DD" stroke-width="1.5"/>
  <text x="277" y="498" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#4B5563">구글 GAIQ</text>

  <!-- CTA bar at bottom -->
  <rect x="0" y="560" width="1200" height="70" fill="#1A1D24"/>
  <text x="72" y="603" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.65)" letter-spacing="0">무료 광고 진단 신청</text>
  <text x="290" y="603" font-family="Arial, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.3)">  ·  </text>
  <text x="318" y="603" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.9)">ye-ji.pages.dev</text>

  <!-- Right side: stat blocks -->
  <rect x="820" y="200" width="130" height="96" rx="14" fill="white" stroke="#E8EAED" stroke-width="1.5"/>
  <text x="885" y="254" font-family="Arial, sans-serif" font-size="38" font-weight="800" text-anchor="middle" fill="url(#dualGrad)">7</text>
  <text x="885" y="280" font-family="Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#8B92A0">년차 경력</text>

  <rect x="968" y="200" width="130" height="96" rx="14" fill="white" stroke="#E8EAED" stroke-width="1.5"/>
  <text x="1033" y="254" font-family="Arial, sans-serif" font-size="38" font-weight="800" text-anchor="middle" fill="url(#dualGrad)">1:1</text>
  <text x="1033" y="280" font-family="Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#8B92A0">전담 운영</text>

  <rect x="820" y="310" width="130" height="96" rx="14" fill="white" stroke="#E8EAED" stroke-width="1.5"/>
  <text x="885" y="364" font-family="Arial, sans-serif" font-size="38" font-weight="800" text-anchor="middle" fill="url(#dualGrad)">7일</text>
  <text x="885" y="390" font-family="Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#8B92A0">1차 리포트</text>

  <rect x="968" y="310" width="130" height="96" rx="14" fill="white" stroke="#E8EAED" stroke-width="1.5"/>
  <text x="1033" y="364" font-family="Arial, sans-serif" font-size="38" font-weight="800" text-anchor="middle" fill="url(#dualGrad)">0원</text>
  <text x="1033" y="390" font-family="Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#8B92A0">관리비 위약금</text>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('og-image.png')
  .then(() => console.log('og-image.png 생성 완료'))
  .catch(err => console.error('오류:', err));
