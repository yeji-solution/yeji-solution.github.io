(function () {
  'use strict';
  var API = 'https://mailplug-inquiries.lmsnism.workers.dev';
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'batch', 'experiment'];
  var query = new URLSearchParams(location.search), attr = {};
  try { attr = JSON.parse(sessionStorage.getItem('mailplug-attribution-v1') || '{}'); } catch (e) { attr = {}; }
  if (query.has('utm_source')) {
    attr = {};
    keys.forEach(function (key) { if (query.has(key)) attr[key] = query.get(key).slice(0, 120); });
  }
  // 이미 전달한 메일 링크도 발송 프로세스 재시작 없이 같은 20% 그룹으로 구분한다.
  if (attr.utm_source === 'mailplug' && /^[a-f0-9]{8}$/.test(attr.utm_term || '') && !['question_v1', 'control_v1'].includes(attr.experiment)) {
    attr.experiment = parseInt(attr.utm_term, 16) % 5 === 0 ? 'question_v1' : 'control_v1';
  }
  try { sessionStorage.setItem('mailplug-attribution-v1', JSON.stringify(attr)); } catch (e) {}
  function event(name) {
    if (attr.utm_source !== 'mailplug' || !attr.utm_term || !attr.batch) return;
    var cacheKey = 'mailplug-event-v1:' + [attr.batch, attr.utm_term, name, new Date().toISOString().slice(0, 10)].join(':');
    try { if (sessionStorage.getItem(cacheKey)) return; } catch (e) {}
    fetch(API + '/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: name, attribution: attr }), keepalive: true })
      .then(function (r) { if (r.ok) { try { sessionStorage.setItem(cacheKey, '1'); } catch (e) {} } }).catch(function () {});
  }
  window.MailplugInquiry = { api: API, attribution: attr, event: event };
(function(){
  'use strict';
  var service=window.MailplugInquiry;if(!service)return;
  var store='sharn-analytics-v1',now=Date.now(),state={};
  try{state=JSON.parse(localStorage.getItem(store)||'{}');}catch(e){}
  function uuid(){return crypto.randomUUID();}
  if(!state.visitor||now-(state.created||0)>90*86400000)state={visitor:uuid(),created:now};
  var fresh=!state.session||now-(state.active||0)>30*60000;
  if(fresh)state.session=uuid();
  var q=new URLSearchParams(location.search),ref=null;
  try{ref=new URL(document.referrer);}catch(e){}
  var external=ref&&ref.origin!==location.origin;
  var touch={source:'direct_unknown',medium:'none',campaign:'',content:'',term:'',batch:'',experiment:'',entry:location.pathname,referrer:external?ref.hostname:'',keyword:'',at:new Date().toISOString()};
  if(q.has('utm_source')){
    ['source','medium','campaign','content','term'].forEach(function(k){touch[k]=(q.get('utm_'+k)||'').slice(0,120);});
    touch.batch=(q.get('batch')||'').slice(0,120);touch.experiment=(q.get('experiment')||service.attribution.experiment||'').slice(0,120);
  }else if(external){
    var host=ref.hostname;
    touch.source=/(^|\.)google\.[a-z.]+$/.test(host)?'google':/(^|\.)naver\.com$/.test(host)?'naver':host;
    touch.medium=['google','naver'].includes(touch.source)?'organic':'referral';
    if(touch.medium==='organic')touch.keyword=(ref.searchParams.get(touch.source==='google'?'q':'query')||'').slice(0,120);
  }
  if(!state.first)state.first=touch;
  // Internal links retain the campaign. Only a new visit or new external campaign changes it.
  var changed=q.has('utm_source')&&['source','medium','campaign','content','term','batch'].some(function(k){return touch[k]!==state.last?.[k];});
  if(fresh||external||changed||!state.last)state.last=touch;
  state.active=now;
  function save(){try{localStorage.setItem(store,JSON.stringify(state));}catch(e){}}
  save();
  function context(){var at=Date.now();if(at-(state.active||0)>30*60000)state.session=uuid();state.active=at;save();return {visitor:state.visitor,session:state.session,first:state.first,last:state.last};}
  service.tracking=context;
  // Clear stale mail context when a later visit arrives without a mail link.
  if(state.last.source!=='mailplug'&&service.attribution.utm_source==='mailplug'){
    Object.keys(service.attribution).forEach(function(k){delete service.attribution[k];});
    try{sessionStorage.removeItem('mailplug-attribution-v1');}catch(e){}
  }
  function send(event,path){
    fetch(service.api+'/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:uuid(),event:event,path:path||location.pathname,tracking:context()}),keepalive:true}).catch(function(){});
  }
  service.track=send;
  send('page_view');
  var scroll=false,formStarted=false;
  document.addEventListener('scroll',function(){var height=document.documentElement.scrollHeight-innerHeight;if(!scroll&&height>0&&scrollY/height>=.5){scroll=true;send('scroll_50');}},{passive:true});
  document.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';if(/^tel:/i.test(h))send('phone_click');else if(/(?:pf\.kakao\.com|open\.kakao\.com|kakao\.com\/)/i.test(h))send('kakao_click');else if(h==='#contact'||h==='#contactForm')send('consultation_click');});
  document.addEventListener('focusin',function(e){if(!formStarted&&e.target.closest('#contactForm,#question-form')){formStarted=true;send('form_start');}});
})();

  event('visit');
  function decorate() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var url;
      try { url = new URL(link.getAttribute('href'), location.href); } catch (e) { return; }
      if (url.origin !== location.origin || !attr.utm_source) return;
      keys.forEach(function (key) { if (attr[key]) url.searchParams.set(key, attr[key]); });
      link.href = url.href;
    });
  }
  function init() {
    if (attr.experiment === 'control_v1') document.querySelectorAll('[data-question-entry]').forEach(function (el) { el.hidden = true; });
    if (attr.experiment === 'question_v1' && location.pathname.indexOf('/blog/') === 0) {
      var article = document.querySelector('.article-body');
      if (article) {
        var next = document.createElement('p');
        next.innerHTML = '<a href="/question/" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#176e4c;color:#fff;text-decoration:none">내 광고에 대해 질문하기 →</a>';
        article.insertBefore(next, article.firstChild);
      }
    }
    decorate();
    var form = document.getElementById('contactForm');
    if (form) {
      keys.forEach(function (key) {
        if (!attr[key]) return;
        var input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = attr[key]; form.appendChild(input);
      });
      var success = document.getElementById('formSuccess');
      if (success) new MutationObserver(function () { if (success.classList.contains('show')) event('consultation'); }).observe(success, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
