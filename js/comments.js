/* Click-to-load giscus comments. Nothing is requested from giscus.app or GitHub until the reader clicks "Show comments". */
(function () {
  'use strict';
  var box = document.getElementById('comments');
  if (!box) return;
  var btn = box.querySelector('.comments-load');
  var tpl = document.getElementById('giscus-snippet');
  var host = box.querySelector('.giscus');
  if (!btn || !tpl || !host) return;
  btn.hidden = false;
  btn.addEventListener('click', function () {
    var src = tpl.content.querySelector('script');
    var s = document.createElement('script');
    for (var i = 0; i < src.attributes.length; i++) s.setAttribute(src.attributes[i].name, src.attributes[i].value);
    s.async = true;
    host.appendChild(s);
    btn.disabled = true;
    btn.textContent = 'Loading comments…';
    var tries = 0;
    var t = setInterval(function () {
      if (host.querySelector('iframe') || ++tries > 40) {
        clearInterval(t);
        btn.parentNode.hidden = true;
      }
    }, 250);
  }, { once: true });
})();
