/* Aspiration self-evaluation. Runs only in the browser: nothing is sent or stored. Scoring rules: content/self-eval.json */
(function () {
  'use strict';
  var form = document.getElementById('se-form');
  var dataEl = document.getElementById('se-data');
  if (!form || !dataEl) return;
  var cfg = JSON.parse(dataEl.textContent);
  var result = document.getElementById('se-result');
  var missing = form.querySelector('.se-missing');
  document.body.classList.add('se-js');               // hides the per-answer level marks and the self-scoring guide
  form.querySelector('.se-actions').hidden = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function answers() {
    var a = {};
    cfg.questions.forEach(function (q) {
      var el = form.querySelector('input[name="' + q.id + '"]:checked');
      if (el) a[q.id] = el.value;
    });
    return a;
  }

  function score(a) {
    var pts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    cfg.questions.forEach(function (q) {
      var o = q.options.filter(function (x) { return x.id === a[q.id]; })[0];
      if (!o) return;
      pts[o.level] += 2;
      (o.also || []).forEach(function (l) { pts[l] += 1; });
    });
    return pts;
  }

  // best-fit sub-level inside level l: most signal points; a tie goes to the lower sub-level
  function subFor(l, a) {
    var ids = Object.keys(cfg.sublevel_signals).filter(function (id) { return id.split('.')[0] === String(l); })
      .sort(function (x, y) { return parseInt(x.split('.')[1], 10) - parseInt(y.split('.')[1], 10); });
    if (!ids.length) return null;
    var scored = ids.map(function (id) {
      var sg = cfg.sublevel_signals[id], pts = 0, reasons = [];
      Object.keys(sg).forEach(function (qid) {
        var v = sg[qid], w = Array.isArray(v) ? (v.indexOf(a[qid]) >= 0 ? 1 : 0) : (v[a[qid]] || 0);
        if (w) {
          pts += w;
          var q = cfg.questions.filter(function (x) { return x.id === qid; })[0];
          reasons.push({ q: q.short, o: q.options.filter(function (o) { return o.id === a[qid]; })[0].text, w: w });
        }
      });
      reasons.sort(function (x, y) { return y.w - x.w; });
      return { id: id, pts: pts, reasons: reasons.slice(0, 3) };
    });
    var top = scored.reduce(function (m, s) { return s.pts > m.pts ? s : m; }, scored[0]);
    var ties = scored.filter(function (s) { return s.pts === top.pts && s.id !== top.id; });
    top.close = ties.length && top.pts > 0 ? ties[0].id : '';
    return top;
  }

  function render(a) {
    var pts = score(a);
    var order = [1, 2, 3, 4].sort(function (x, y) { return pts[y] - pts[x] || x - y; });
    var top = pts[order[0]];
    var best = order.filter(function (l) { return pts[l] === top; });
    var rest = order.filter(function (l) { return pts[l] < top && pts[l] > 0; });   // a level with no points is not a runner-up
    var runner = rest.length ? rest.filter(function (l) { return pts[l] === pts[rest[0]]; }) : [];
    var max = top || 1;
    var html = '<h2>Your result</h2>';
    html += '<p class="se-best">Best fit: <strong>' + best.map(function (l) { return 'Level ' + l + ': ' + esc(cfg.levels[l].name); }).join(' and ') + '</strong>';
    if (runner.length) html += '<br>Runner-up: <strong>' + runner.map(function (l) { return 'Level ' + l + ': ' + esc(cfg.levels[l].name); }).join(' and ') + '</strong>';
    html += '</p><div class="se-bars" aria-hidden="true">';
    [1, 2, 3, 4].forEach(function (l) {
      html += '<div class="se-bar se-l' + l + '"><span class="se-bar-l">' + l + '. ' + esc(cfg.levels[l].name) + '</span><span class="se-bar-t"><span style="width:' +
        Math.round(pts[l] / max * 100) + '%"></span></span><span class="se-bar-n">' + pts[l] + '</span></div>';
    });
    html += '</div><p class="small muted">Points: 2 for each answer that matches a level, 1 where an answer also partly fits a neighbouring level.</p>';
    var subIds = [];
    best.forEach(function (l) {
      var s = subFor(l, a);
      if (!s) return;
      subIds.push(s.id);
      var S = cfg.sublevels[s.id];
      html += '<div class="se-subres se-sub" data-sublevel="' + esc(s.id) + '"><h3>Best-fit sub-level: ' + esc(s.id) + ' ' + esc(S.name) + '</h3>' +
        '<p>' + esc(S.definition) + '</p>' +
        '<p class="se-why"><strong>Why:</strong> ' + (s.reasons.length ? 'your answers on ' + s.reasons.map(function (r) { return esc(r.q) + ' (&ldquo;' + esc(r.o) + '&rdquo;)'; }).join(', ') + ' fit this sub-level.' : 'none of your answers points strongly to one sub-level, so this is the starting point.') +
        (s.close ? ' Also close: ' + esc(s.close) + ' ' + esc(cfg.sublevels[s.close].name) + '.' : '') + '</p>' +
        '<p><strong>To climb from here:</strong> ' + esc(S.climb) + '</p>' +
        '<p class="se-links"><a href="' + esc(S.page) + '">All level ' + l + ' sub-levels</a>' + (S.article ? ' &middot; <a href="' + esc(S.article) + '">' + esc(S.article_title) + '</a>' : '') + '</p>' +
        '<p class="small muted">' + esc(cfg.sublevel_note) + '</p></div>';
    });
    best.concat(runner).forEach(function (l, i) {
      var L = cfg.levels[l], k = L.asks;
      html += '<div class="se-path se-l' + l + '"><h3>' + (i < best.length ? 'What this path asks: ' : 'Also worth reading: ') + 'Level ' + l + ', ' + esc(L.name) + '</h3><dl>' +
        '<dt>Money</dt><dd>' + esc(k.capital) + '</dd><dt>Risk</dt><dd>' + esc(k.risk) + '</dd>' +
        '<dt>Skills</dt><dd>' + esc(k.skills) + '</dd><dt>Time</dt><dd>' + esc(k.timeline) + '</dd></dl>' +
        '<p class="se-links"><a href="' + esc(L.page) + '">The ' + esc(L.name.toLowerCase()) + ' level</a> &middot; <a href="' + esc(L.hub) + '">Business math</a> &middot; <a href="' +
        esc(L.article) + '">' + esc(L.article_title) + '</a></p></div>';
    });
    html += '<p class="small muted">This is a guide to your wishes, not a verdict. Many people climb the ladder one level at a time.</p>';
    html += '<p><button type="button" class="btn se-again">Change my answers</button></p>';
    result.innerHTML = html;
    result.hidden = false;
    result.dataset.best = best.join(',');
    result.dataset.runner = runner.join(',');
    result.dataset.sub = subIds.join(',');
    result.querySelector('.se-again').addEventListener('click', function () { form.scrollIntoView({ behavior: 'smooth' }); });
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = answers();
    var gaps = cfg.questions.map(function (q, i) { return a[q.id] ? null : i + 1; }).filter(Boolean);
    form.querySelectorAll('.se-q').forEach(function (f) { f.classList.toggle('se-unanswered', !a[f.id.slice(3)]); });
    if (gaps.length) {
      missing.hidden = false;
      missing.textContent = 'Please answer every question first. Still to answer: ' + gaps.join(', ') + '.';
      var first = document.getElementById('se-' + cfg.questions[gaps[0] - 1].id);
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    missing.hidden = true;
    render(a);
  });
  form.addEventListener('reset', function () {
    result.hidden = true; result.innerHTML = ''; missing.hidden = true;
    form.querySelectorAll('.se-unanswered').forEach(function (f) { f.classList.remove('se-unanswered'); });
  });
})();
