/* ASCII SOFT Redmine Avatar - 사진 자르기, 미리보기, 삭제 확인 (License: GPL-2.0-or-later) */
(function () {
  'use strict';
  var SIZE = 256;

  // 레이어 팝업 확인창 (배경 블러, 배경 클릭/Esc 로 취소)
  function confirmLayer(text, okText, cancelText, onOk) {
    var overlay = document.createElement('div');
    overlay.className = 'asciisoft-avatar-dialog-overlay';
    var box = document.createElement('div');
    box.className = 'asciisoft-avatar-dialog';
    box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-modal', 'true');
    var p = document.createElement('p'); p.textContent = text;
    var row = document.createElement('div'); row.className = 'asciisoft-avatar-dialog-buttons';
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'asciisoft-avatar-dialog-cancel'; cancel.textContent = cancelText;
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'asciisoft-avatar-dialog-ok'; ok.textContent = okText;
    row.appendChild(cancel); row.appendChild(ok); box.appendChild(p); box.appendChild(row);
    overlay.appendChild(box); document.body.appendChild(overlay);
    function close() { document.removeEventListener('keydown', onKey, true); if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    cancel.addEventListener('click', close);
    ok.addEventListener('click', function () { close(); onOk(); });
    document.addEventListener('keydown', onKey, true);
    ok.focus();
  }

  function initDelete() {
    var form = document.getElementById('asciisoft-avatar-delete-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      if (form.dataset.confirmed) return;
      e.preventDefault();
      confirmLayer(form.dataset.confirmText, form.dataset.ok, form.dataset.cancel, function () {
        form.dataset.confirmed = '1';
        form.submit();
      });
    });
  }

  function initCrop() {
    var form = document.getElementById('asciisoft-avatar-form');
    if (!form) return;
    var input = document.getElementById('asciisoft-avatar-file');
    var wrap = document.getElementById('asciisoft-avatar-cropper');
    var canvas = document.getElementById('asciisoft-avatar-canvas');
    var zoom = document.getElementById('asciisoft-avatar-zoom');
    var save = document.getElementById('asciisoft-avatar-save');
    var minis = Array.prototype.slice.call(document.querySelectorAll('.asciisoft-avatar-mini'));
    var img = null, minScale = 1, scale = 1, ox = 0, oy = 0, drag = null;

    if (save) save.hidden = true;   // 파일을 고르기 전에는 [저장] 숨김

    // 저장될 정사각형 이미지 그리기
    function paintSquare(ctx, size) {
      var k = size / SIZE;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
      if (img) ctx.drawImage(img, ox * k, oy * k, img.naturalWidth * scale * k, img.naturalHeight * scale * k);
    }
    // 자르기 화면: 원 밖은 흐리게 덮고 원 테두리를 그려 실제 표시 모양(원형)을 보여 준다
    function draw() {
      var c = canvas.getContext('2d');
      paintSquare(c, SIZE);
      c.save();
      c.beginPath(); c.rect(0, 0, SIZE, SIZE); c.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2, true);
      c.fillStyle = 'rgba(255, 255, 255, 0.72)'; c.fill('evenodd');
      c.beginPath(); c.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
      c.lineWidth = 2; c.strokeStyle = '#2e5392'; c.stroke();
      c.restore();
      minis.forEach(function (m) {
        var s = m.width, mc = m.getContext('2d');
        mc.clearRect(0, 0, s, s);
        mc.save(); mc.beginPath(); mc.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); mc.clip();
        paintSquare(mc, s); mc.restore();
      });
    }
    function clamp() {
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ox = Math.min(0, Math.max(SIZE - w, ox));
      oy = Math.min(0, Math.max(SIZE - h, oy));
    }

    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      img = null; wrap.hidden = true; if (save) save.hidden = true;
      if (!f) return;
      if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { window.alert(form.dataset.msgType); input.value = ''; return; }
      var im = new Image();
      im.onload = function () {
        img = im;
        minScale = Math.max(SIZE / im.naturalWidth, SIZE / im.naturalHeight);
        scale = minScale; zoom.value = '1';
        ox = (SIZE - im.naturalWidth * scale) / 2;
        oy = (SIZE - im.naturalHeight * scale) / 2;
        wrap.hidden = false; if (save) save.hidden = false; draw();
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

    // 저장: 덮개 없이 자른 256x256 정사각형 JPEG 로 바꿔 보낸다
    form.addEventListener('submit', function (e) {
      if (form.dataset.cropped) return;
      if (!input.files || !input.files.length) { e.preventDefault(); window.alert(form.dataset.msgPick); return; }
      if (!img) return;
      e.preventDefault();
      var out = document.createElement('canvas'); out.width = SIZE; out.height = SIZE;
      paintSquare(out.getContext('2d'), SIZE);
      out.toBlob(function (blob) {
        if (blob) {
          var dt = new DataTransfer();
          dt.items.add(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
          input.files = dt.files;
        }
        form.dataset.cropped = '1';
        form.submit();
      }, 'image/jpeg', 0.9);
    });
  }

  function init() { initDelete(); initCrop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
