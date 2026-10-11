/* Click-to-load Google Trends chart. Nothing is requested from Google until the reader clicks the button. */
(function () {
  'use strict';
  var boxes = document.querySelectorAll('.trends[data-trends]');
  if (!boxes.length) return;
  var loading = null; // one shared promise for Google's loader script

  function loadLoader(src) {
    if (window.trends && window.trends.embed) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { (window.trends && window.trends.embed) ? resolve() : reject(new Error('no trends.embed')); };
      s.onerror = function () { reject(new Error('loader failed')); };
      document.head.appendChild(s);
    });
    loading.catch(function () { loading = null; });
    return loading;
  }

  Array.prototype.forEach.call(boxes, function (box) {
    var cfg;
    try { cfg = JSON.parse(box.getAttribute('data-trends')); } catch (e) { return; }
    var btn = box.querySelector('.trends-load');
    var frame = box.querySelector('.trends-frame');
    var note = box.querySelector('.trends-note');
    btn.hidden = false; note.hidden = false;
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = 'Loading chart from Google…';
      loadLoader(cfg.loader).then(function () {
        frame.hidden = false;
        frame.innerHTML = '';
        window.trends.embed.renderExploreWidgetTo(frame, cfg.type, cfg.request, cfg.options);
        btn.hidden = true;
        note.textContent = 'Chart loaded from Google Trends. Scores are relative (100 = the highest point in the chart).';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Try loading the chart again';
        note.textContent = 'The chart could not be loaded from Google. You can still open it in Google Trends with the link.';
      });
    });
  });
})();
