/* founder.curiosta.com quiz: instant feedback and score. Same-origin, no network calls, no storage. */
(function () {
  'use strict';
  var quizzes = document.querySelectorAll('[data-quiz]');
  Array.prototype.forEach.call(quizzes, function (quiz) {
    quiz.classList.add('js-on');
    var qs = quiz.querySelectorAll('fieldset.q');
    var total = qs.length, answered = 0, right = 0;
    var box = quiz.querySelector('[data-score]');
    var text = box.querySelector('.score-text');

    function update() {
      box.hidden = false;
      var msg = 'Score: ' + right + ' out of ' + answered + ' answered (' + total + ' questions).';
      if (answered === total) {
        var p = Math.round(right * 100 / total);
        msg = 'Finished. You scored ' + right + ' out of ' + total + ' (' + p + '%). ' +
          (p >= 80 ? 'Well done.' : p >= 50 ? 'Good start: open the answers you missed and try again.' : 'Worth a second look: read the worked examples above, then try again.');
        box.classList.add('done');
      }
      text.textContent = msg;
    }

    Array.prototype.forEach.call(qs, function (q) {
      var fb = q.querySelector('.feedback');
      var correct = q.getAttribute('data-correct');
      q.addEventListener('change', function (e) {
        var t = e.target;
        if (q.getAttribute('data-done') || !t || t.type !== 'radio') return;
        q.setAttribute('data-done', '1');
        answered++;
        var ok = t.value === correct;
        if (ok) right++;
        q.classList.add(ok ? 'is-right' : 'is-wrong');
        Array.prototype.forEach.call(q.querySelectorAll('input'), function (i) {
          i.disabled = true;
          var l = i.parentNode;
          if (i.value === correct) l.classList.add('opt-right');
          else if (i === t) l.classList.add('opt-wrong');
        });
        var why = '';
        if (!ok) {
          var li = q.querySelector('.whys li[data-opt="' + t.value + '"]');
          if (li) why = ' ' + li.textContent.replace(/^\(\w\)\s*/, '');
        }
        fb.textContent = ok ? 'Correct.' : 'Not quite. The answer is (' + correct + ').' + why;
        fb.className = 'feedback ' + (ok ? 'fb-right' : 'fb-wrong');
        fb.hidden = false;
        var d = q.querySelector('details');
        if (d) d.open = true;
        update();
      });
    });

    var reset = box.querySelector('[data-reset]');
    reset.addEventListener('click', function () {
      answered = 0; right = 0;
      Array.prototype.forEach.call(qs, function (q) {
        q.removeAttribute('data-done');
        q.classList.remove('is-right', 'is-wrong');
        var fb = q.querySelector('.feedback'); fb.hidden = true; fb.textContent = '';
        var d = q.querySelector('details'); if (d) d.open = false;
        Array.prototype.forEach.call(q.querySelectorAll('input'), function (i) {
          i.disabled = false; i.checked = false;
          i.parentNode.classList.remove('opt-right', 'opt-wrong');
        });
      });
      box.hidden = true; box.classList.remove('done');
      qs[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
