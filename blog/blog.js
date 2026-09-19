(function () {
  'use strict';
  var body = document.querySelector('.article-body');
  if (!body) return;

  var headings = Array.prototype.slice.call(body.querySelectorAll('h2'));
  if (headings.length < 2) return;

  var nav = document.createElement('nav');
  nav.className = 'article-toc';
  nav.setAttribute('aria-label', '이 글의 목차');
  var title = document.createElement('strong');
  title.className = 'toc-title';
  title.textContent = '이 글의 목차';
  var list = document.createElement('ol');

  headings.forEach(function (heading, index) {
    if (!heading.id) heading.id = 'section-' + (index + 1);
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    item.appendChild(link);
    list.appendChild(item);
  });

  nav.appendChild(title);
  nav.appendChild(list);
  body.parentNode.insertBefore(nav, body);
})();
