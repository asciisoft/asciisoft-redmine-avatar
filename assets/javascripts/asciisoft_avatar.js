/* ASCII SOFT Redmine Avatar - 사진 자르기 (License: GPL-2.0-or-later) */
(function () {
  'use strict';
  function init() {
    var form = document.getElementById('asciisoft-avatar-form');
    if (!form) return;
    var input = document.getElementById('asciisoft-avatar-file');
    var wrap = document.getElementById('asciisoft-avatar-cropper');
    var canvas = document.getElementById('asciisoft-avatar-canvas');
    var zoom = document.getElementById('asciisoft-avatar-zoom');
    var SIZE = 256;
    var img = null, minScale = 1, scale = 1, ox = 0, oy = 0, drag = null;

    function draw() {
      var c = canvas.getContext('2d');
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, SIZE, SIZE);
      if (img) c.drawImage(img, ox, oy, img.naturalWidth * scale, img.naturalHeight * scale);
    }
    function clamp() {
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ox = Math.min(0, Math.max(SIZE - w, ox));
      oy = Math.min(0, Math.max(SIZE - h, oy));
    }

    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      img = null; wrap.hidden = true;
      if (!f) return;
      if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { window.alert(form.dataset.msgType); input.value = ''; return; }
      var im = new Image();
      im.onload = function () {
        img = im;
        minScale = Math.max(SIZE / im.naturalWidth, SIZE / im.naturalHeight);
        scale = minScale; zoom.value = '1';
        ox = (SIZE - im.naturalWidth * scale) / 2;
        oy = (SIZE - im.naturalHeight * scale) / 2;
        wrap.hidden = false; draw();
      };
      im.onerror = function () { window.alert(form.dataset.msgType); input.value = ''; };
      im.src = URL.createObjectURL(f);
    });

    zoom.addEventListener('input', function () {
      if (!img) return;
      var ns = minScale * parseFloat(zoom.value), c = SIZE / 2;
      ox = c - (c - ox) * ns / scale;
      oy = c - (c - oy) * ns / scale;
      scale = ns; clamp(); draw();
    });

    canvas.addEventListener('pointerdown', function (e) {
      if (!img) return;
      drag = { x: e.clientX, y: e.clientY, ox: ox, oy: oy };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var k = SIZE / canvas.getBoundingClientRect().width;
      ox = drag.ox + (e.clientX - drag.x) * k;
      oy = drag.oy + (e.clientY - drag.y) * k;
      clamp(); draw();
    });
    ['pointerup', 'pointercancel'].forEach(function (t) { canvas.addEventListener(t, function () { drag = null; }); });

    // 저장할 때 잘라 낸 256x256 JPEG 로 파일을 바꿔 보낸다
    form.addEventListener('submit', function (e) {
      if (form.dataset.cropped) return;
      if (!input.files || !input.files.length) { e.preventDefault(); window.alert(form.dataset.msgPick); return; }
      if (!img) return;
      e.preventDefault();
      canvas.toBlob(function (blob) {
        if (!blob) { form.dataset.cropped = '1'; form.submit(); return; }
        var dt = new DataTransfer();
        dt.items.add(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
        input.files = dt.files;
        form.dataset.cropped = '1';
        form.submit();
      }, 'image/jpeg', 0.9);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
