/* Top bar menus are plain <details>, so they work without this file. This only adds:
   one menu open at a time, Escape closes and returns focus, and a click or focus outside closes. */
(function () {
  'use strict';
  var menus = document.querySelectorAll('.topbar details');
  if (!menus.length) return;
  function closeAll(except) {
    Array.prototype.forEach.call(menus, function (d) { if (d !== except) d.open = false; });
  }
  Array.prototype.forEach.call(menus, function (d) {
    d.addEventListener('toggle', function () { if (d.open) closeAll(d); });
    d.addEventListener('focusout', function (e) {
      if (d.open && e.relatedTarget && !d.contains(e.relatedTarget)) d.open = false;
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Array.prototype.forEach.call(menus, function (d) {
      if (d.open) { d.open = false; d.querySelector('summary').focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    Array.prototype.forEach.call(menus, function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
  });
})();
