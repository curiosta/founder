/* Calendar: the page is built with past events removed; this also hides any event that has ended since the last
   build (checked against today's date on your device). Filtering by level works without JavaScript (CSS :target). */
(function () {
  'use strict';
  var d = new Date();
  var today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  document.querySelectorAll('li.ev[data-end]').forEach(function (li) {
    if (li.getAttribute('data-end') < today) { li.hidden = true; li.classList.add('ev-past'); }
  });
  document.querySelectorAll('.cal-group').forEach(function (g) {
    if (!g.querySelector('li.ev:not([hidden])')) g.hidden = true;
  });
})();
