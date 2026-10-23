'use strict';

const situations = {
  start: {
    label: '광고를 시작하려고 해요',
    title: '예산을 쓰기 전에, 구매 준비부터 확인하세요.',
    lead: '광고를 켜는 것보다 방문자가 구매할 수 있는 상태인지 확인하는 것이 먼저입니다.',
    steps: [
      ['첫 광고에 연결할 대표 상품 정하기', '재고, 가격, 배송 안내가 준비된 상품이 있나요?', '대표 상품을 정하고 모바일에서 옵션 선택부터 결제 직전까지 직접 살펴보세요.'],
      ['구매 성과를 확인할 방법 정하기', '광고 유입과 구매 결과를 어디에서 확인할지 정했나요?', '사용할 광고 유형의 전환 집계 지원 범위와 설정을 확인하세요. 연동이 필요하면 시작 전에 점검하세요.'],
      ['감당할 수 있는 테스트 비용 정하기', '한 건 판매했을 때 광고비로 쓸 수 있는 금액을 알고 있나요?', '판매가에서 원가·수수료·배송 부담을 빼고 테스트 예산과 검토 시점을 정하세요.']
    ],
    resource: {
      kind: 'guide',
      eyebrow: 'START GUIDE · 시작 준비',
      bridge: '대표 상품이 정해졌다면, 방문자가 구매할 수 있는 상태인지 직접 확인해보세요.',
      title: '광고를 켜기 전, 모바일에서 한 번 구매해보기',
      description: '성과 사례보다 먼저 쓸 수 있는 시작 준비 안내입니다. 아래 순서대로 직접 확인하세요.',
      summary: '광고 시작 전 준비 순서 펼쳐보기',
      items: [
        ['상품 페이지 확인', '모바일에서 대표 상품을 열고 가격·재고·필수 옵션·배송비·도착 안내가 보이는지 확인하세요.'],
        ['구매 과정 확인', '옵션 선택부터 결제 직전까지 진행해보세요. 막히거나 예상과 다른 비용이 나오는 부분을 기록하세요.'],
        ['첫 테스트 계획', '상품, 감당할 예산, 구매 결과를 확인할 방법과 검토 시점을 짧게 정리한 뒤 시작하세요.']
      ]
    },
    inquiry: {
      heading: '첫 광고, 준비 순서부터 함께 볼까요?',
      lead: '대표 상품·성과 확인 방법·테스트 예산 중 막히는 부분을 알려주세요.',
      button: '첫 광고 준비에 대해 문의하기 →',
      message: '첫 네이버 광고를 준비하고 있습니다. 대표 상품, 구매 성과 확인 방법, 테스트 예산 중 무엇부터 준비하면 좋을지 궁금합니다.'
    }
  },
  clicks: {
    label: '클릭은 있는데 구매가 적어요',
    title: '구매 집계 → 연결 화면 → 구매 조건 순서로 보세요.',
    lead: '구매가 적게 보이는 이유부터 확인한 다음, 방문자가 망설이는 부분을 살펴보세요.',
    steps: [
      ['구매가 제대로 집계되는지 확인하기', '스토어 주문 내역과 광고 전환 집계 사이에 설명되지 않는 차이가 있나요?', '같은 기간으로 맞춰 보고 집계 기준·반영 지연·추적 설정을 확인하세요. 두 숫자가 같아야 하는 것은 아닙니다.'],
      ['광고에서 본 내용과 연결 화면 비교하기', '광고의 상품·가격·혜택을 클릭한 첫 화면에서 바로 찾을 수 있나요?', '모바일에서 연결 주소와 첫 화면을 확인하고, 광고 내용과 맞지 않는 안내를 먼저 고치세요.'],
      ['구매를 망설이게 하는 조건 확인하기', '배송비, 도착 예상일, 후기, 옵션 안내가 충분한가요?', '구매 전에 필요한 정보가 잘 보이는지 살펴보고, 불명확한 안내 한 가지부터 개선하세요.']
    ],
    resource: {
      kind: 'guide',
      eyebrow: 'CHECK GUIDE · 집계 확인',
      bridge: '구매가 적게 보인다면, 실제 주문과 광고에 잡힌 구매가 어떤 기준으로 집계되는지부터 확인하세요.',
      title: '숫자가 다른 이유를 찾는 비교 메모',
      description: '실제 개선 사례가 아닌 직접 확인용 안내입니다. 두 매출 숫자가 다르다는 이유만으로 추적 오류라고 단정하지 않습니다.',
      summary: '구매 집계를 비교하는 방법 펼쳐보기',
      items: [
        ['같은 기간으로 맞추기', '비교한 시작일·종료일과 조회 시점을 적으세요. 두 화면의 날짜 범위가 다르면 먼저 맞추세요.'],
        ['무슨 숫자인지 구분하기', '스토어 전체 주문인지, 광고를 통해 집계된 구매인지 확인하세요. 결제·취소·반품이 반영되는 기준도 구분해두세요.'],
        ['집계 기준을 확인한 다음', '반영 지연과 해당 광고 유형의 추적 설정을 확인하세요. 설명되지 않는 차이가 남으면 그 기간과 지표명을 함께 문의하세요.']
      ]
    },
    inquiry: {
      heading: '구매 집계부터 함께 확인해볼까요?',
      lead: '비교한 기간과 지표를 적어주시면 어떤 부분을 확인할지 이야기하기 쉽습니다.',
      button: '구매가 적은 상황으로 문의하기 →',
      message: '클릭은 있는데 구매가 적습니다. 구매 집계와 상품 연결 화면 중 무엇부터 확인해야 할지 궁금합니다.\n비교한 기간·지표 또는 추가 상황: '
    }
  },
  cost: {
    label: '광고비에 비해 매출이 아쉬워요',
    title: '먼저, 상품별 광고비와 구매 결과를 나눠보세요.',
    lead: '전체 평균만 보면 잘되는 상품과 비용만 드는 상품이 섞여 보일 수 있습니다.',
    steps: [
      ['상품·광고 그룹별로 비용과 전환 나누기', '어느 상품이나 그룹에서 비용이 늘었는지 구분되나요?', '같은 기간의 상품별 광고비·구매 수·전환매출을 비교하세요. 집계 지연과 데이터 양을 확인한 뒤 조정할 대상을 정하세요.'],
      ['같은 기준으로 광고비와 구매 결과 비교하기', '비교 기간과 전환 집계 기준이 서로 같은가요?', '반영 지연이나 추적 설정 변경이 있었는지 확인하고, 다른 기간의 숫자가 섞여 있지 않은지 살펴보세요.'],
      ['매출이 남기는 이익까지 함께 확인하기', '매출이 늘어도 마진이 낮은 상품에 비용이 몰리고 있나요?', '원가·수수료·배송 부담을 반영해 상품별 허용 광고비를 정하고, 그 기준으로 예산 조정을 검토하세요.']
    ],
    resource: {
      kind: 'case',
      eyebrow: 'RELATED CASE · 관련 운영 사례',
      bridge: '상품별 성과가 보이도록 구조를 정리한 실제 운영 사례를 함께 살펴보세요.',
      title: '광고 그룹을 정리하고, 전환이 확인된 상품에 예산을 배분했습니다.',
      description: '네이버 검색광고의 상품별 예산 배분을 살펴볼 때 참고할 수 있는 공개 사례입니다.',
      summary: '조정 내용·공개 지표 펼쳐보기',
      items: [
        ['상품별 성과 확인', '기존 공개 사례에서는 상품별 성과를 볼 수 있도록 광고 그룹 구조를 정리했습니다.'],
        ['예산 배분 조정', '전환이 확인된 상품에 예산을 옮기고, 입찰 조정도 함께 진행한 것으로 소개돼 있습니다.'],
        ['내 스토어에 적용하기 전', '상품별 비용과 구매가 구분되는지부터 살펴보세요. 이 사례는 검색광고 운영 사례이며, GFA를 운영 중이라면 캠페인 목적과 상품별 집계 지원 범위를 먼저 확인해야 합니다.']
      ]
    },
    inquiry: {
      heading: '우리 스토어도 예산 배분부터 점검할까요?',
      lead: '지금 예산을 어떻게 나누고 있는지, 구분해서 보기 어려운 부분이 있는지 알려주세요.',
      button: '상품별 예산 배분에 대해 문의하기 →',
      message: '광고비에 비해 매출이 아쉽습니다. 상품별 광고비와 구매 결과를 어떻게 나눠봐야 할지, 예산 배분부터 점검하고 싶습니다.'
    }
  },
  unsure: {
    label: '무엇이 문제인지 모르겠어요',
    title: '노출 → 클릭 → 구매, 어느 구간인지부터 보세요.',
    lead: '모든 설정을 한 번에 바꾸기보다, 막히는 구간 하나를 먼저 찾으면 됩니다.',
    steps: [
      ['광고가 실제로 노출되고 있는지 확인하기', '광고를 운영 중이라면 노출 수와 비용이 발생하고 있나요?', '노출이 없다면 운영 상태·심사·예산·일정을 먼저 확인하세요. 아직 시작 전이라면 위에서 시작 준비 상황을 선택하세요.'],
      ['노출 다음에 클릭이 이어지는지 확인하기', '비슷한 조건의 이전 기간과 비교해 클릭 반응이 달라졌나요?', '반응이 줄었다면 노출 대상과 소재·상품 정보를 살펴보세요. 광고 유형이 다른 숫자를 단순 비교하지 마세요.'],
      ['클릭 다음에 구매가 이어지는지 확인하기', '클릭은 있는데 구매가 없다면 집계와 상품 페이지를 확인했나요?', '전환 집계 설정을 확인한 뒤, 광고와 연결 화면의 일치 여부·배송·가격·옵션 안내 순서로 살펴보세요.']
    ],
    resource: {
      kind: 'guide',
      eyebrow: 'CHECK GUIDE · 막히는 구간 찾기',
      bridge: '성과 사례를 고르기 전에, 노출·클릭·구매 중 어느 구간인지 먼저 좁혀보세요.',
      title: '막히는 구간에 따라 확인할 곳이 달라집니다.',
      description: '현재 숫자를 읽을 때 참고할 수 있는 확인 순서입니다. 아래 내용은 실제 계정 분석 결과가 아닙니다.',
      summary: '노출·클릭·구매 확인 방법 펼쳐보기',
      items: [
        ['노출이 없다면', '운영 상태·심사·예산·일정을 먼저 살펴보세요. 광고가 시작되지 않은 상태에서 구매 성과를 판단하지 않습니다.'],
        ['노출은 있는데 클릭이 적다면', '같은 광고 유형과 비슷한 조건의 이전 기간을 기준으로 소재·상품 정보·노출 대상이 달라졌는지 보세요.'],
        ['클릭은 있는데 구매가 적다면', '구매 집계 기준을 확인하고, 연결된 상품 페이지의 가격·혜택·배송·옵션 안내를 살펴보세요.']
      ]
    },
    inquiry: {
      heading: '어느 구간부터 볼지 함께 정해볼까요?',
      lead: '노출·클릭·구매 중 확인하기 어려운 항목을 알려주셔도 됩니다.',
      button: '광고 점검 순서에 대해 문의하기 →',
      message: '네이버 광고에서 무엇이 문제인지 모르겠습니다. 노출·클릭·구매 중 어느 구간부터 확인하면 좋을지 궁금합니다.'
    }
  }
};

const $ = (id) => document.getElementById(id);
let selectedSituation = null;
const params = new URLSearchParams(location.search);
$('checkNav').setAttribute('aria-current', 'page');

function chooseSituation(key) {
  if (!Object.hasOwn(situations, key)) return;
  const data = situations[key];
  selectedSituation = key;
  document.querySelectorAll('[data-situation]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.situation === key));
  });
  $('selectedLabel').textContent = data.label;
  $('resultTitle').textContent = data.title;
  $('resultLead').textContent = data.lead;
  const priorityItems = data.steps.map(([title, check, action], index) => {
    const item = document.createElement('li');
    item.className = 'priority';
    const number = document.createElement('span');
    number.className = 'priority-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = index + 1;
    const content = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = title;
    content.append(heading);
    [[check, '확인', 'check'], [action, '다음 행동', 'action']].forEach(([text, label, className]) => {
      const paragraph = document.createElement('p');
      paragraph.className = className;
      const prefix = document.createElement('strong');
      prefix.textContent = label;
      paragraph.append(prefix, document.createTextNode(text));
      content.append(paragraph);
    });
    item.append(number, content);
    return item;
  });
  $('priorities').replaceChildren(priorityItems[0]);
  $('remainingPriorities').replaceChildren(...priorityItems.slice(1));
  $('otherChecks').open = false;
  const resource = data.resource;
  $('resourceEyebrow').textContent = resource.eyebrow;
  $('resourceBridge').textContent = resource.bridge;
  $('resourceTitle').textContent = resource.title;
  $('resourceDescription').textContent = resource.description;
  $('resourceSummary').textContent = resource.summary;
  $('resourceDetails').open = false;
  $('caseMeta').hidden = resource.kind !== 'case';
  $('caseEvidence').hidden = resource.kind !== 'case';
  $('resourceContent').replaceChildren(...resource.items.map(([title, text]) => {
    const item = document.createElement('div');
    item.className = 'resource-item';
    const heading = document.createElement('h4');
    heading.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    item.append(heading, paragraph);
    return item;
  }));
  $('inquiryHeading').textContent = data.inquiry.heading;
  $('inquiryLead').textContent = data.inquiry.lead;
  $('openInquiry').textContent = data.inquiry.button;
  $('result').hidden = false;
  const inquiryUrl = new URL('/question/', location.origin);
  const attribution = window.MailplugInquiry ? window.MailplugInquiry.attribution : {};
  Object.entries(attribution).forEach(([name, value]) => inquiryUrl.searchParams.set(name, value));
  inquiryUrl.searchParams.set('selfcheck', key);
  inquiryUrl.searchParams.set('question', `네이버 광고 10초 셀프 점검\n현재 상황: ${data.label}\n\n${data.inquiry.message}`);
  $('openInquiry').href = inquiryUrl.href;
  $('resultTitle').focus({ preventScroll: true });
  $('result').scrollIntoView({ behavior: 'auto', block: 'start' });
}

document.querySelectorAll('[data-situation]').forEach((button) => {
  button.addEventListener('click', () => chooseSituation(button.dataset.situation));
});
$('reset').addEventListener('click', () => {
  const previous = document.querySelector(`[data-situation="${selectedSituation}"]`);
  $('result').hidden = true;
  document.querySelectorAll('[data-situation]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  selectedSituation = null;
  previous.focus({ preventScroll: true });
  $('chooser').scrollIntoView({ behavior: 'auto', block: 'start' });
});
// A result is informational; only the existing inquiry form can submit a question.
const entrySituation = params.get('situation');
if (Object.hasOwn(situations, entrySituation)) chooseSituation(entrySituation);
