(function () {
  'use strict';
  var API = 'https://mailplug-inquiries.lmsnism.workers.dev';
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'batch', 'experiment'];
  var query = new URLSearchParams(location.search), attr = {};
  try { attr = JSON.parse(sessionStorage.getItem('mailplug-attribution-v1') || '{}'); } catch (e) { attr = {}; }
  if (query.has('utm_source')) {
    attr = {};
    keys.forEach(function (key) { if (query.has(key)) attr[key] = query.get(key).slice(0, 120); });
    try { sessionStorage.setItem('mailplug-attribution-v1', JSON.stringify(attr)); } catch (e) {}
  }
  function event(name) {
    if (attr.utm_source !== 'mailplug' || !attr.utm_term || !attr.batch) return;
    var cacheKey = 'mailplug-event-v1:' + [attr.batch, attr.utm_term, name, new Date().toISOString().slice(0, 10)].join(':');
    try { if (sessionStorage.getItem(cacheKey)) return; } catch (e) {}
    fetch(API + '/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: name, attribution: attr }), keepalive: true })
      .then(function (r) { if (r.ok) { try { sessionStorage.setItem(cacheKey, '1'); } catch (e) {} } }).catch(function () {});
  }
  window.MailplugInquiry = { api: API, attribution: attr, event: event };
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
        article.appendChild(next);
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
