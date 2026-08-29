/* ============================================================================
   225 EXPORT — Partage à un proche
   Un bloc discret avant le pied de page. Sur téléphone, ouvre le partage natif
   (WhatsApp, SMS, Telegram…). Ailleurs, ouvre WhatsApp Web. Repli : copie du lien.

   INSTALLATION
   1. Déposer dans assets/
   2. Avant </body> de chaque page :  <script src="assets/partage.js" defer></script>
   Aucun autre changement : le bloc s'insère tout seul avant le <footer>.
   ============================================================================ */

(function () {
  "use strict";

  var CONFIG = {
    titre: 'Quelqu\u2019un autour de vous envoie en C\u00f4te d\u2019Ivoire ?',
    texte: 'Transmettez-lui 225 Export. Un appui suffit.',
    bouton: 'Envoyer \u00e0 un proche',
    copier: 'Copier le lien',
    copie: 'Lien copi\u00e9',

    // Message pr\u00e9-\u00e9crit. {url} est remplac\u00e9 par l'adresse de la page.
    message: 'Je te partage 225 Export : achat en France et livraison en C\u00f4te d\u2019Ivoire ' +
             '\u2014 colis, marchandises, v\u00e9hicules.\n{url}'
  };

  var STYLE = [
    '.pt{background:var(--light,#F5F7FB);border-top:1px solid var(--line,#E3E8F1);padding:34px 0}',
    '.pt-in{width:min(1160px,92%);margin:auto;display:flex;align-items:center;',
    'justify-content:center;gap:22px;flex-wrap:wrap;text-align:center}',
    '.pt-txt{max-width:420px}',
    '.pt-txt b{display:block;color:var(--navy,#0D1B3D);font-size:17px;margin-bottom:3px}',
    '.pt-txt span{color:var(--muted,#647087);font-size:14.5px}',
    '.pt-act{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center}',
    '.pt-btn{display:inline-flex;align-items:center;gap:9px;border:0;cursor:pointer;',
    'background:var(--orange,#F58220);color:#fff;font:inherit;font-size:15px;font-weight:700;',
    'padding:14px 24px;border-radius:12px;transition:transform .16s ease,filter .16s ease}',
    '.pt-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}',
    '.pt-btn:focus-visible{outline:3px solid var(--navy,#0D1B3D);outline-offset:3px}',
    '.pt-btn svg{width:19px;height:19px;flex:none}',
    '.pt-copier{border:0;background:none;color:var(--muted,#647087);font:inherit;',
    'font-size:14px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:6px}',
    '.pt-copier:hover{color:var(--navy,#0D1B3D)}',
    '.pt-copier[data-ok="true"]{color:var(--success,#1B9C68);text-decoration:none}',
    '@media(max-width:600px){.pt{padding:28px 0}.pt-btn{width:100%;justify-content:center}}',
    '@media(prefers-reduced-motion:reduce){.pt-btn{transition:none}.pt-btn:hover{transform:none}}'
  ].join('');

  var ICONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
    '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

  function init() {
    var pied = document.querySelector('footer');
    if (!pied || document.querySelector('.pt')) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var url = window.location.href.split('#')[0].split('?')[0];
    var message = CONFIG.message.replace('{url}', url);

    var bloc = document.createElement('section');
    bloc.className = 'pt';
    bloc.innerHTML =
      '<div class="pt-in">' +
      '<div class="pt-txt"><b></b><span></span></div>' +
      '<div class="pt-act">' +
      '<button type="button" class="pt-btn">' + ICONE + '<span></span></button>' +
      '<button type="button" class="pt-copier"></button>' +
      '</div></div>';

    bloc.querySelector('.pt-txt b').textContent = CONFIG.titre;
    bloc.querySelector('.pt-txt span').textContent = CONFIG.texte;
    bloc.querySelector('.pt-btn span').textContent = CONFIG.bouton;

    var copier = bloc.querySelector('.pt-copier');
    copier.textContent = CONFIG.copier;

    pied.parentNode.insertBefore(bloc, pied);

    bloc.querySelector('.pt-btn').addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: document.title, text: CONFIG.message.replace('{url}', '').trim(), url: url })
          .catch(function () { /* partage annul\u00e9 : rien \u00e0 faire */ });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank', 'noopener');
      }
    });

    copier.addEventListener('click', function () {
      var fini = function () {
        copier.textContent = CONFIG.copie;
        copier.dataset.ok = 'true';
        setTimeout(function () { copier.textContent = CONFIG.copier; copier.dataset.ok = 'false'; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(fini, function () {});
      } else {
        var z = document.createElement('textarea');
        z.value = url; z.style.position = 'fixed'; z.style.opacity = '0';
        document.body.appendChild(z); z.select();
        try { document.execCommand('copy'); fini(); } catch (e) {}
        document.body.removeChild(z);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
