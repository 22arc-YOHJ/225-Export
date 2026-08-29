/* ============================================================================
   225 EXPORT — Liste d'achat sur demande
   Le client ajoute autant d'articles qu'il veut ; à l'envoi, la liste est
   compilée en texte lisible dans un champ caché, pour arriver propre par mail.

   INSTALLATION
   1. Déposer dans assets/
   2. La page doit contenir <div id="articles"></div> dans le formulaire,
      un champ caché name="Liste des articles", et le bouton d'envoi.
   3. Avant </body> :  <script src="assets/achat.js" defer></script>
   ============================================================================ */

(function () {
  "use strict";

  var MAX = 15;

  var STYLE = [
    '.ach-ligne{border:1px solid var(--line,#E3E8F1);border-radius:14px;padding:16px;margin-bottom:12px;background:#fff}',
    '.ach-tete{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}',
    '.ach-tete b{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--orange,#F58220)}',
    '.ach-suppr{border:0;background:none;color:var(--muted,#647087);font:inherit;font-size:13px;cursor:pointer;padding:4px}',
    '.ach-suppr:hover{color:#C22B2B;text-decoration:underline}',
    '.ach-ajout{display:inline-flex;align-items:center;gap:8px;border:1px dashed var(--line,#E3E8F1);',
    'background:none;color:var(--navy,#0D1B3D);font:inherit;font-weight:700;font-size:14.5px;',
    'padding:13px 20px;border-radius:12px;cursor:pointer;width:100%;justify-content:center}',
    '.ach-ajout:hover{border-color:var(--orange,#F58220);color:var(--orange,#F58220)}',
    '.ach-erreur{display:none;color:#C22B2B;font-weight:700;font-size:13px;margin-top:10px}',
    '.ach-erreur[data-on="true"]{display:block}'
  ].join('');

  function init() {
    var zone = document.getElementById('articles');
    var form = zone && zone.closest('form');
    if (!zone || !form) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var liste = document.createElement('div');
    var ajout = document.createElement('button');
    ajout.type = 'button';
    ajout.className = 'ach-ajout';
    ajout.textContent = '+  Ajouter un article';
    var err = document.createElement('p');
    err.className = 'ach-erreur';
    err.textContent = 'Indiquez au moins un lien de produit.';

    zone.appendChild(liste);
    zone.appendChild(ajout);
    zone.appendChild(err);

    function renumeroter() {
      var lignes = liste.querySelectorAll('.ach-ligne');
      lignes.forEach(function (l, i) {
        l.querySelector('b').textContent = 'Article ' + (i + 1);
        l.querySelector('.ach-suppr').style.display = lignes.length > 1 ? '' : 'none';
      });
      ajout.style.display = lignes.length >= MAX ? 'none' : '';
    }

    function ajouterLigne() {
      var l = document.createElement('div');
      l.className = 'ach-ligne';
      l.innerHTML =
        '<div class="ach-tete"><b></b>' +
        '<button type="button" class="ach-suppr">Retirer</button></div>' +
        '<div class="form-grid">' +
        '<div class="field full"><label>Lien du produit</label>' +
        '<input class="ach-lien" type="url" placeholder="https://..." inputmode="url"></div>' +
        '<div class="field"><label>Précisions</label>' +
        '<input class="ach-prec" placeholder="Taille, couleur, référence"></div>' +
        '<div class="field"><label>Quantité</label>' +
        '<input class="ach-qte" type="number" min="1" step="1" value="1"></div>' +
        '</div>';
      liste.appendChild(l);
      renumeroter();
      return l;
    }

    ajout.addEventListener('click', function () {
      var l = ajouterLigne();
      l.querySelector('.ach-lien').focus();
    });

    liste.addEventListener('click', function (e) {
      if (e.target.closest('.ach-suppr')) {
        e.target.closest('.ach-ligne').remove();
        renumeroter();
      }
    });

    form.addEventListener('submit', function (e) {
      var texte = [], n = 0;
      liste.querySelectorAll('.ach-ligne').forEach(function (l) {
        var lien = l.querySelector('.ach-lien').value.trim();
        if (!lien) return;
        n++;
        texte.push('Article ' + n);
        texte.push('  Lien : ' + lien);
        var prec = l.querySelector('.ach-prec').value.trim();
        if (prec) texte.push('  Précisions : ' + prec);
        texte.push('  Quantité : ' + (l.querySelector('.ach-qte').value || '1'));
        texte.push('');
      });

      if (!n) {
        e.preventDefault();
        err.dataset.on = 'true';
        zone.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      err.dataset.on = 'false';
      var cache = form.querySelector('[name="Liste des articles"]');
      if (cache) cache.value = texte.join('\n');
    });

    ajouterLigne();
    ajouterLigne();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
