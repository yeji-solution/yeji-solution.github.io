// Gmail → Kakao Mail 자동 전달 스크립트 (디자인 템플릿 적용)
//
// 설치 방법:
// 1. script.google.com 접속 (shoppingall.kr@gmail.com 로그인)
// 2. 기존 코드 전체 선택 후 아래 내용으로 교체
// 3. 저장 후 ▶ 실행 (최초 1회 권한 허용)
// 4. ⏰ 트리거: forwardYejiToKakao / 시간 기반 / 5분마다

const KAKAO = 'msnism@kakao.com';
const DONE_LABEL = 'yeji-forwarded';

function forwardYejiToKakao() {
  let label = GmailApp.getUserLabelByName(DONE_LABEL);
  if (!label) label = GmailApp.createLabel(DONE_LABEL);

  const threads = GmailApp.search(
    'from:@web3forms.com -label:' + DONE_LABEL
  );

  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      const fields = parsePlainText(msg.getPlainBody());
      const receivedAt = Utilities.formatDate(
        msg.getDate(), 'Asia/Seoul', 'yyyy.MM.dd HH:mm'
      );
      MailApp.sendEmail({
        to: KAKAO,
        subject: '🔔 새 문의 | ' + msg.getSubject(),
        htmlBody: buildHtml(fields, receivedAt),
        body: msg.getPlainBody(),
      });
    }
    thread.addLabel(label);
  }
}

// plain text "key  : value\n..." → 객체로 파싱
function parsePlainText(text) {
  const fields = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (m) fields[m[1].toLowerCase().trim()] = m[2].trim();
  }
  return fields;
}

function buildHtml(f, receivedAt) {
  const name    = f['name']    || '-';
  const phone   = f['phone']   || '-';
  const company = f['company'] || '-';
  const email   = f['email']   || '-';
  const budget  = f['budget']  || '-';
  const message = f['message'] || '-';

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;width:90px;font-size:12px;font-weight:700;
                 color:#6b7280;background:#f9fafb;border-bottom:1px solid #f0f0f0;
                 white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;
                 border-bottom:1px solid #f0f0f0;line-height:1.6;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;width:100%;background:#fff;border-radius:12px;
                    box-shadow:0 1px 6px rgba(0,0,0,0.08);overflow:hidden;">

        <!-- 헤더 -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
                     padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;
                      color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">
              New Inquiry
            </p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">
              새 문의가 접수됐어요
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">
              수신 시각 ${receivedAt}
            </p>
          </td>
        </tr>

        <!-- 필드 테이블 -->
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${row('이름', name)}
              ${row('연락처', phone)}
              ${row('회사명', company)}
              ${row('이메일', email)}
              ${row('예산', budget)}
              ${row('메시지', message.replace(/\n/g, '<br>'))}
            </table>
          </td>
        </tr>

        <!-- 푸터 -->
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#9ca3af;text-align:center;">
            ye-ji.pages.dev 포트폴리오 문의 폼에서 자동 전달됨
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
