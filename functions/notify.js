// Cloudflare Pages Function
// Web3Forms 웹훅 수신 → Resend로 포맷된 이메일 발송
// 환경변수: RESEND_API_KEY (Cloudflare Pages 대시보드 → Settings → Environment Variables)

const RECIPIENTS = ['shoppingall.kr@gmail.com', 'msnism@kakao.com'];
const FROM = 'YEJI SOLUTION <onboarding@resend.dev>';

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    const data = payload.data || payload;

    const company = (data.company || '미입력').toString().slice(0, 40);
    const html = buildHtml(data);
    const text = buildText(data);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: RECIPIENTS,
        subject: `[YEJI] 신규 진단 신청 · ${company}`,
        html,
        text,
        reply_to: data.email || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(`Resend failed: ${err}`, { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}

function buildHtml(d) {
  const get = (k) => esc(d[k] || '');
  const company = get('company') || '미입력';
  const name = get('name') || '미입력';
  const phone = (d.phone || '').toString().replace(/[^\d]/g, '');
  const phoneDisplay = formatPhone(d.phone || '');
  const email = get('email');
  const message = get('message') || '<span style="color:#8B92A0;">입력 없음</span>';
  const budget = d.budget || '';
  const media = parseMedia(d.media);
  const budgetBadge = budgetStyle(budget);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>신규 진단 신청</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F6;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Pretendard',sans-serif;color:#1A1D24;line-height:1.6;-webkit-text-size-adjust:100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F1F3F6;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(26,29,36,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#00C73C 0%,#FF3F7E 100%);padding:30px 28px;color:#fff;">
          <div style="font-size:11px;font-weight:800;letter-spacing:3px;opacity:0.82;margin-bottom:8px;">YEJI&nbsp;SOLUTION</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;">📩&nbsp; 신규 무료 진단 신청</div>
          <div style="font-size:13px;opacity:0.88;margin-top:8px;"><strong>${company}</strong>님이 진단 신청을 남겼습니다.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 28px 8px 28px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:2.5px;color:#8B92A0;margin-bottom:14px;">광고주 정보</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
            ${row('성함', name)}
            ${row('연락처', phone ? `<a href="tel:${phone}" style="color:#1A1D24;font-weight:700;text-decoration:none;border-bottom:1px dashed #D5D8DD;">${phoneDisplay}</a> <span style="font-size:11px;color:#8B92A0;margin-left:4px;">← 탭하면 바로 전화</span>` : '<span style="color:#8B92A0;">입력 없음</span>')}
            ${row('업체명', `<strong>${company}</strong>`)}
            ${row('이메일', email ? `<a href="mailto:${email}" style="color:#1A1D24;font-weight:600;text-decoration:none;border-bottom:1px dashed #D5D8DD;">${email}</a>` : '<span style="color:#8B92A0;">입력 없음</span>')}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 8px 28px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:2.5px;color:#8B92A0;margin-bottom:12px;">운영 매체</div>
          <div>${media.length ? media.map(mediaChip).join('') : '<span style="color:#8B92A0;font-size:14px;">선택 없음</span>'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 8px 28px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:2.5px;color:#8B92A0;margin-bottom:12px;">월 광고비</div>
          ${budget ? `<div style="display:inline-block;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:700;background:${budgetBadge.bg};color:${budgetBadge.color};border:1px solid ${budgetBadge.border};">${esc(budget)}${budgetBadge.label ? ` <span style="font-size:12px;font-weight:600;opacity:0.9;">· ${budgetBadge.label}</span>` : ''}</div>` : '<span style="color:#8B92A0;font-size:14px;">미입력</span>'}
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 28px 28px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:2.5px;color:#8B92A0;margin-bottom:12px;">고민 / 문의 내용</div>
          <div style="background:#F7F8FA;border-left:3px solid #00C73C;border-radius:8px;padding:16px 18px;font-size:14.5px;color:#1A1D24;line-height:1.65;white-space:pre-wrap;">${message}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 28px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${phone ? `<td align="center" style="padding-right:6px;"><a href="tel:${phone}" style="display:block;padding:14px 18px;background:#1A1D24;color:#fff;font-weight:800;font-size:14px;border-radius:10px;text-decoration:none;">📞 ${phoneDisplay} 전화 회신</a></td>` : ''}
              <td align="center" style="padding-left:${phone ? '6px' : '0'};"><a href="https://app.web3forms.com/" style="display:block;padding:14px 18px;background:#fff;color:#1A1D24;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;border:1px solid #D5D8DD;">📋 제출 내역 보기</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px;background:#F7F8FA;border-top:1px solid #E8EAED;">
          <div style="font-size:12.5px;color:#4B5563;line-height:1.6;">⏱ <strong style="color:#1A1D24;">3영업일 내 회신</strong>이 약속된 신청입니다. 가능한 빠르게 응대해 주세요.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px 24px 28px;text-align:center;">
          <div style="font-size:11px;color:#8B92A0;letter-spacing:1px;"><strong style="color:#00C73C;">YEJI</strong> SOLUTION · 이명수 Leader</div>
          <div style="font-size:11px;color:#B5BCC8;margin-top:6px;">ye-ji.pages.dev · 본 메일은 자동 발송된 진단 신청 알림입니다.</div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid #E8EAED;width:84px;font-size:12.5px;font-weight:700;color:#4B5563;vertical-align:top;">${label}</td>
    <td style="padding:11px 0;border-bottom:1px solid #E8EAED;font-size:14.5px;color:#1A1D24;vertical-align:top;">${value}</td>
  </tr>`;
}

function mediaChip(m) {
  const colors = {
    '네이버':   { bg: '#E8F8EC', color: '#009B2F', border: '#9FE0B3' },
    '지그재그': { bg: '#FFE9F0', color: '#E32869', border: '#F5A8C2' },
    '카카오':   { bg: '#FFF9D6', color: '#7A6500', border: '#E6D278' },
    '쿠팡':     { bg: '#FFE8E5', color: '#C8412B', border: '#F0A89B' },
    '기타':     { bg: '#F0F1F4', color: '#4B5563', border: '#D5D8DD' },
  };
  const c = colors[m] || colors['기타'];
  return `<span style="display:inline-block;padding:6px 13px;margin:0 6px 6px 0;background:${c.bg};color:${c.color};border:1px solid ${c.border};border-radius:999px;font-size:13px;font-weight:700;">${esc(m)}</span>`;
}

function budgetStyle(b) {
  if (!b) return { bg: '#F0F1F4', color: '#4B5563', border: '#D5D8DD', label: '' };
  if (b.includes('3000만원 이상'))  return { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5', label: '대규모 — 우선 응대' };
  if (b.includes('1000-3000'))     return { bg: '#FFEDD5', color: '#C2410C', border: '#FDBA74', label: '중규모' };
  if (b.includes('500-1000'))      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', label: '중규모' };
  if (b.includes('300-500'))       return { bg: '#ECFDF5', color: '#047857', border: '#86EFAC', label: '소규모' };
  if (b.includes('300만원 미만'))   return { bg: '#F0F1F4', color: '#4B5563', border: '#D5D8DD', label: '소규모' };
  return { bg: '#F0F1F4', color: '#4B5563', border: '#D5D8DD', label: '' };
}

function parseMedia(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return [];
  const s = v.trim();
  if (s.startsWith('[')) {
    try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr : []; } catch (e) {}
  }
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

function formatPhone(p) {
  const d = (p || '').toString().replace(/[^\d]/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return p || '';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildText(d) {
  const media = parseMedia(d.media).join(', ') || '선택 없음';
  return `[YEJI SOLUTION] 신규 진단 신청

성함: ${d.name || '-'}
연락처: ${d.phone || '-'}
업체명: ${d.company || '-'}
이메일: ${d.email || '-'}
매체: ${media}
월 광고비: ${d.budget || '-'}

고민 / 문의 내용:
${d.message || '-'}

— 3영업일 내 회신 약속 —`;
}
