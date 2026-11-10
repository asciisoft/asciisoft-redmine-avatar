/* ASCII SOFT Redmine Avatar - 목록의 작성자·담당자 칸에 프로필 사진 표시 (License: GPL-2.0-or-later)
 * 사진이 있는 사용자의 이름 링크에는 서버가 data-asciisoft-avatar 를 붙여 준다.
 * - 테마가 이니셜 원(.as-av)을 이미 그렸으면 그 원을 같은 크기의 사진으로 바꾼다.
 * - 아직 안 그렸으면 사진을 먼저 넣는다. 테마는 칸에 이미지가 있으면 이니셜 원을 그리지 않는다.
 * 사진에는 테마의 이니셜 원과 같은 class(as-av)를 붙여 크기와 여백을 그대로 따른다. */
(function () {
  'use strict';
  var CELLS = 'td.assigned_to, td.author, td.last_updated_by';

  function apply(root) {
    var links = (root && root.querySelectorAll ? root : document).querySelectorAll('a.user[data-asciisoft-avatar]');
    Array.prototype.forEach.call(links, function (a) {
      var cell = a.closest(CELLS);
      if (!cell || cell.querySelector('img.asciisoft-avatar-inline')) return;
      var url = a.getAttribute('data-asciisoft-avatar') || '';
      if (!/^\/[^\/\\]/.test(url)) return;               // 같은 사이트의 상대 주소만
      var img = document.createElement('img');
      img.alt = ''; img.src = url; img.loading = 'lazy'; img.decoding = 'async';
      var badge = cell.querySelector('.as-av');
      if (badge) {
        img.className = badge.className + ' asciisoft-avatar asciisoft-avatar-inline';
        badge.parentNode.replaceChild(img, badge);
      } else {
        img.className = 'as-av asciisoft-avatar asciisoft-avatar-inline';
        var host = a.parentNode;
        host.insertBefore(img, a);
      }
    });
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(function () { queued = false; apply(document); });
  }

  function start() {
    apply(document);
    setTimeout(schedule, 0);
    if (window.MutationObserver) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
