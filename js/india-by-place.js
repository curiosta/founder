/* India by place: filters, search and a live count. The page is complete without this script: every place card and row is
   in the HTML. This file only reveals the filter form and hides what does not match. No network requests, no storage. */
(function () {
  var form = document.getElementById('ibp-filters');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var el = { q: $('f-q'), kind: $('f-kind'), verdict: $('f-verdict'), conf: $('f-conf'), seen: $('f-seen'), place: $('f-place') };
  var rows = [].slice.call(document.querySelectorAll('.ibp-row'));
  var cards = [].slice.call(document.querySelectorAll('.ibp-card'));
  var region = document.getElementById('region-wide');
  var tiles = {};
  [].forEach.call(document.querySelectorAll('#ibp-index li[data-for]'), function (li) { tiles[li.getAttribute('data-for')] = li; });
  var status = $('ibp-status'), none = $('ibp-none');
  var total = rows.length;
  form.hidden = false;

  function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function state() {
    return { q: norm(el.q.value), kind: el.kind.value, verdict: el.verdict.value, conf: el.conf.value, seen: el.seen.value, place: el.place.value };
  }
  function apply(keepUrl) {
    var s = state();
    var terms = s.q ? s.q.split(' ') : [];
    var rowFilter = !!(s.q || s.kind || s.verdict || s.conf || s.seen);
    var active = rowFilter || !!s.place;
    var shown = 0;
    rows.forEach(function (r) {
      var ok = (!s.kind || r.getAttribute('data-kind') === s.kind) && (!s.verdict || r.getAttribute('data-verdict') === s.verdict) &&
        (!s.conf || r.getAttribute('data-conf') === s.conf) && (!s.seen || r.getAttribute('data-seen') === s.seen);
      if (ok && terms.length) {
        var hay = r.getAttribute('data-search') || '';
        ok = terms.every(function (t) { return hay.indexOf(t) > -1; });
      }
      if (ok && s.place) {
        var card = r.closest('.ibp-card');
        ok = card ? card.getAttribute('data-place') === s.place : (' ' + (r.getAttribute('data-places') || '') + ' ').indexOf(' ' + s.place + ' ') > -1;
      }
      r.hidden = !ok;
      if (ok) shown++;
    });
    var visCards = 0;
    cards.forEach(function (c) {
      var p = c.getAttribute('data-place');
      var vis = c.querySelector('.ibp-row:not([hidden])') !== null;
      var has = +c.getAttribute('data-rows') > 0;
      var show;
      if (!active) show = true;
      else if (s.place) show = p === s.place;
      else show = vis;
      c.hidden = !show;
      var msg = c.querySelector('.ibp-cardnone');
      if (msg) msg.hidden = !(show && active && has && !vis && !!c.querySelector('.ibp-row'));
      if (tiles[p]) tiles[p].hidden = !show;
      if (show) visCards++;
    });
    if (region) region.hidden = active && region.querySelector('.ibp-row:not([hidden])') === null;
    var uniq = shown;
    var txt = !active ? 'Showing all ' + total + ' rows in ' + cards.length + ' places.'
      : 'Showing ' + uniq + ' of ' + total + ' rows in ' + visCards + ' of ' + cards.length + ' places' + (region && !region.hidden ? ', plus region-wide rows' : '') + '.';
    status.textContent = txt;
    none.hidden = !(active && shown === 0 && visCards === 0);
    if (!keepUrl && window.history && history.replaceState) {
      var u = new URLSearchParams();
      Object.keys(s).forEach(function (k) { var v = k === 'q' ? el.q.value.trim() : s[k]; if (v) u.set(k, v); });
      var qs = u.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
  }
  function reset() {
    Object.keys(el).forEach(function (k) { el[k].value = ''; });
    apply();
  }
  Object.keys(el).forEach(function (k) {
    el[k].addEventListener(k === 'q' ? 'input' : 'change', function () { apply(); });
  });
  $('f-reset').addEventListener('click', function () { reset(); el.q.focus(); });

  // links to a row or place that the filters have hidden: clear the filters first, then go there
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (t && t.closest('[hidden]')) { reset(); }
  });

  var params = new URLSearchParams(location.search);
  Object.keys(el).forEach(function (k) {
    var v = params.get(k);
    if (v === null) return;
    if (k === 'q') el.q.value = v;
    else if ([].some.call(el[k].options, function (o) { return o.value === v; })) el[k].value = v;
  });
  apply(true);
})();
