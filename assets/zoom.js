/* ============================================================================
   225 EXPORT — Agrandissement des visuels
   Toute image portant la classe « zoomable » s'ouvre en plein écran au clic.
   Fermeture : clic n'importe où, bouton, ou touche Échap.

   INSTALLATION
   1. Déposer dans assets/
   2. Avant </body> :  <script src="assets/zoom.js" defer></script>
   ============================================================================ */

(function () {
  "use strict";

  var STYLE = [
    '.zoomable{cursor:zoom-in;display:block;width:100%;height:auto;border-radius:20px;',
    'box-shadow:0 14px 40px rgba(13,27,61,.16);background:#EAF0F8;transition:transform .2s ease}',
    '.zoomable:hover{transform:translateY(-3px)}',
    '.zoomable:focus-visible{outline:3px solid var(--orange,#F58220);outline-offset:4px}',
    '.zoom-lot{display:grid;gap:16px}',
    '.zoom-aide{margin:2px 0 0;font-size:12.5px;color:var(--muted,#647087);text-align:center}',

    '.zoom-fond{position:fixed;inset:0;z-index:9999;background:rgba(8,20,46,.95);',
    'display:flex;align-items:center;justify-content:center;padding:16px;',
    'opacity:0;pointer-events:none;transition:opacity .18s ease}',
    '.zoom-fond[data-on="true"]{opacity:1;pointer-events:auto}',
    '.zoom-fond img{max-width:100%;max-height:88vh;object-fit:contain;border-radius:10px}',
    '.zoom-x{position:absolute;top:14px;right:14px;width:44px;height:44px;border:0;cursor:pointer;',
    'border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:24px;line-height:1}',
    '.zoom-x:hover{background:rgba(255,255,255,.26)}',
    '.zoom-note{position:absolute;bottom:16px;left:0;right:0;text-align:center;',
    'color:#DCE5F3;font-size:12.5px}',
    'body[data-zoom="on"]{overflow:hidden}',
    '@media(prefers-reduced-motion:reduce){.zoomable,.zoom-fond{transition:none}',
    '.zoomable:hover{transform:none}}'
  ].join('');

  function init() {
    var images = document.querySelectorAll('.zoomable');
    if (!images.length) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var fond = document.createElement('div');
    fond.className = 'zoom-fond';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-label', 'Image agrandie');
    fond.innerHTML = '<button type="button" class="zoom-x" aria-label="Fermer">\u00d7</button>' +
                     '<img alt="">' +
                     '<p class="zoom-note">Appuyez n\u2019importe o\u00f9 pour fermer</p>';
    document.body.appendChild(fond);

    var grande = fond.querySelector('img');
    var declencheur = null;

    function ouvrir(src, alt, el) {
      declencheur = el;
      grande.src = src;
      grande.alt = alt || '';
      fond.dataset.on = 'true';
      document.body.dataset.zoom = 'on';
      fond.querySelector('.zoom-x').focus();
    }
    function fermer() {
      fond.dataset.on = 'false';
      document.body.dataset.zoom = '';
      if (declencheur) declencheur.focus();
    }

    images.forEach(function (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () {
        ouvrir(img.dataset.grand || img.src, img.alt, img);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ouvrir(img.dataset.grand || img.src, img.alt, img);
        }
      });
    });

    fond.addEventListener('click', fermer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && fond.dataset.on === 'true') fermer();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
