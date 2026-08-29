/* ============================================================================
   225 EXPORT — Estimateur de volume et de poids
   Le visiteur coche ce qu'il envoie, l'outil calcule le volume, le poids
   et le poids taxable en aérien, puis reporte le résultat dans le formulaire.

   INSTALLATION
   1. Déposer ce fichier dans assets/
   2. Dans la page, à l'endroit voulu :  <div id="estimateur"></div>
   3. Avant </body> :  <script src="assets/estimateur.js" defer></script>

   Les volumes et poids sont des moyennes indicatives : à ajuster librement
   dans le tableau GROUPES ci-dessous au fil de ton expérience réelle.
   ============================================================================ */

(function () {
  "use strict";

  var CONFIG = {
    cible: '#estimateur',
    // Diviseur volumétrique aérien standard : 1 m³ = 1 000 000 cm³ / 6000 = 167 kg
    diviseurAerien: 6000,
    // Seuil au-delà duquel proposer aussi une cotation en conteneur complet
    seuilConteneur: 10
  };

  var GROUPES = [
    { nom: 'Cartons et bagages', items: [
      { n: 'Carton standard 60×40×40', v: 0.10, p: 18 },
      { n: 'Grand carton 80×60×50',    v: 0.24, p: 28 },
      { n: 'Valise',                   v: 0.10, p: 23 },
      { n: 'Barrique 120 L',           v: 0.14, p: 85 },
      { n: 'Fût 60 L',                 v: 0.08, p: 45 }
    ]},
    { nom: 'Électroménager', items: [
      { n: 'Réfrigérateur grand',   v: 1.14, p: 110 },
      { n: 'Réfrigérateur petit',   v: 0.35, p: 45 },
      { n: 'Congélateur coffre',    v: 0.55, p: 60 },
      { n: 'Machine à laver',       v: 0.31, p: 65 },
      { n: 'Cuisinière',            v: 0.35, p: 55 },
      { n: 'Micro-ondes',           v: 0.06, p: 15 },
      { n: 'Climatiseur split',     v: 0.15, p: 35 }
    ]},
    { nom: 'Informatique et image', items: [
      { n: 'Ordinateur portable',   v: 0.02, p: 3 },
      { n: 'Unité centrale + écran',v: 0.12, p: 12 },
      { n: 'Téléviseur 43 à 55"',   v: 0.12, p: 15 },
      { n: 'Imprimante',            v: 0.08, p: 10 }
    ]},
    { nom: 'Mobilier', items: [
      { n: 'Canapé 3 places',       v: 1.98, p: 75 },
      { n: 'Armoire moyenne',       v: 1.20, p: 90 },
      { n: 'Matelas 200×160',       v: 0.64, p: 35 },
      { n: 'Table à manger',        v: 0.60, p: 40 },
      { n: 'Chaise',                v: 0.15, p: 6 }
    ]},
    { nom: 'Pièces automobiles', items: [
      { n: 'Pneu seul',             v: 0.10, p: 10 },
      { n: 'Jeu de 4 pneus',        v: 0.40, p: 40 },
      { n: 'Moteur',                v: 0.50, p: 180 },
      { n: 'Pare-chocs',            v: 0.25, p: 10 }
    ]},
    { nom: 'Véhicules', items: [
      { n: 'Citadine',              v: 9.00,  p: 1100 },
      { n: 'Berline ou break',      v: 12.00, p: 1500 },
      { n: 'SUV ou 4×4',            v: 16.20, p: 2100 }
    ]}
  ];

  /* ------------------------------------------------------------------ */

  var STYLE = [
    '.est{--o:var(--orange,#F58220);--n:var(--navy,#0D1B3D);--l:var(--line,#E3E8F1);--m:var(--muted,#647087)}',
    '.est *{box-sizing:border-box}',
    '.est-tete{margin-bottom:18px}',
    '.est-tete h3{margin:0 0 6px;color:var(--n)}',
    '.est-tete p{margin:0;color:var(--m);font-size:14.5px;line-height:1.55}',

    '.est-groupe{border-top:1px solid var(--l);padding-top:14px;margin-top:14px}',
    '.est-groupe:first-of-type{border-top:0;margin-top:0}',
    '.est-groupe > h4{margin:0 0 10px;font-size:12px;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--o)}',

    '.est-ligne{display:flex;align-items:center;gap:12px;padding:7px 0}',
    '.est-nom{flex:1;min-width:0;font-size:14.5px;line-height:1.35;color:var(--n)}',
    '.est-nom small{display:block;color:var(--m);font-size:12px}',
    '.est-cpt{display:flex;align-items:center;gap:4px;flex:none}',
    '.est-cpt button{width:38px;height:38px;border:1px solid var(--l);background:#fff;',
    'border-radius:10px;font-size:19px;line-height:1;color:var(--n);cursor:pointer}',
    '.est-cpt button:hover{border-color:var(--o);color:var(--o)}',
    '.est-cpt button:focus-visible{outline:2px solid var(--o);outline-offset:2px}',
    '.est-qte{width:34px;text-align:center;font-weight:700;font-size:15px;color:var(--n)}',
    '.est-ligne[data-actif="true"] .est-qte{color:var(--o)}',

    '.est-total{position:sticky;bottom:0;margin-top:18px;padding:16px;border-radius:14px;',
    'background:var(--n);color:#fff}',
    '.est-chiffres{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center}',
    '.est-chiffres div span{display:block;font-size:11px;letter-spacing:.08em;',
    'text-transform:uppercase;opacity:.7;margin-bottom:3px}',
    '.est-chiffres div b{font-size:19px;color:var(--o)}',
    '.est-actions{display:flex;gap:10px;margin-top:14px}',
    '.est-actions button{flex:1;padding:11px;border-radius:10px;border:0;font:inherit;',
    'font-size:14px;font-weight:700;cursor:pointer}',
    '.est-reporter{background:var(--o);color:#fff}',
    '.est-vider{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)!important}',
    '.est-msg{margin:12px 0 0;font-size:12.5px;line-height:1.5;opacity:.85}',
    '.est-pied{margin:12px 0 0;font-size:12.5px;color:var(--m);line-height:1.5}',

    '@media(max-width:420px){.est-chiffres div b{font-size:17px}}'
  ].join('');

  function fmt(n, d) { return n.toFixed(d).replace('.', ','); }

  function init() {
    var cible = document.querySelector(CONFIG.cible);
    if (!cible) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    cible.className = 'est card';
    var qtes = {};

    var html = '<div class="est-tete"><h3>Estimez votre volume</h3>' +
      '<p>Vous ne savez pas ce que représente un mètre cube ? Indiquez ce que vous envoyez, ' +
      'le calcul se fait tout seul.</p></div>';

    GROUPES.forEach(function (g, gi) {
      html += '<div class="est-groupe"><h4>' + g.nom + '</h4>';
      g.items.forEach(function (it, ii) {
        var id = gi + '-' + ii;
        qtes[id] = 0;
        html += '<div class="est-ligne" data-id="' + id + '" data-actif="false">' +
          '<div class="est-nom">' + it.n +
          '<small>' + fmt(it.v, 2) + ' m³ · ' + it.p + ' kg</small></div>' +
          '<div class="est-cpt">' +
          '<button type="button" data-a="-" aria-label="Retirer un ' + it.n + '">−</button>' +
          '<span class="est-qte">0</span>' +
          '<button type="button" data-a="+" aria-label="Ajouter un ' + it.n + '">+</button>' +
          '</div></div>';
      });
      html += '</div>';
    });

    html += '<div class="est-total"><div class="est-chiffres">' +
      '<div><span>Volume</span><b class="est-v">0 m³</b></div>' +
      '<div><span>Poids réel</span><b class="est-p">0 kg</b></div>' +
      '<div><span>Taxable aérien</span><b class="est-t">0 kg</b></div>' +
      '</div><p class="est-msg"></p><div class="est-actions">' +
      '<button type="button" class="est-reporter">Reporter dans le formulaire</button>' +
      '<button type="button" class="est-vider">Effacer</button>' +
      '</div></div>' +
      '<p class="est-pied">Estimation indicative. Le volume facturé est celui mesuré à ' +
      'l\'emballage. En aérien, c\'est la plus élevée des deux valeurs de poids qui est retenue.</p>';

    cible.innerHTML = html;

    var eV = cible.querySelector('.est-v'), eP = cible.querySelector('.est-p'),
        eT = cible.querySelector('.est-t'), eM = cible.querySelector('.est-msg');

    function calcul() {
      var v = 0, p = 0;
      GROUPES.forEach(function (g, gi) {
        g.items.forEach(function (it, ii) {
          var q = qtes[gi + '-' + ii];
          v += q * it.v; p += q * it.p;
        });
      });
      var taxable = Math.max(p, v * 1000000 / CONFIG.diviseurAerien);
      eV.textContent = fmt(v, 2) + ' m³';
      eP.textContent = Math.round(p) + ' kg';
      eT.textContent = Math.round(taxable) + ' kg';

      if (v === 0) { eM.textContent = ''; }
      else if (v >= CONFIG.seuilConteneur) {
        eM.textContent = 'À ce volume, demandez aussi une cotation en conteneur complet : ' +
          'c\'est souvent plus avantageux que le groupage.';
      } else if (taxable > p * 1.5) {
        eM.textContent = 'Votre envoi est volumineux pour son poids. Le maritime sera nettement ' +
          'plus économique que l\'aérien.';
      } else { eM.textContent = ''; }
      return { v: v, p: p };
    }

    cible.addEventListener('click', function (e) {
      var btn = e.target.closest('.est-cpt button');
      if (btn) {
        var ligne = btn.closest('.est-ligne'), id = ligne.dataset.id;
        qtes[id] = Math.max(0, qtes[id] + (btn.dataset.a === '+' ? 1 : -1));
        ligne.querySelector('.est-qte').textContent = qtes[id];
        ligne.dataset.actif = qtes[id] > 0 ? 'true' : 'false';
        calcul();
        return;
      }
      if (e.target.closest('.est-vider')) {
        Object.keys(qtes).forEach(function (k) { qtes[k] = 0; });
        cible.querySelectorAll('.est-ligne').forEach(function (l) {
          l.querySelector('.est-qte').textContent = '0';
          l.dataset.actif = 'false';
        });
        calcul();
        return;
      }
      if (e.target.closest('.est-reporter')) {
        var t = calcul();
        var champ = function (noms) {
          for (var i = 0; i < noms.length; i++) {
            var el = document.querySelector('[name="' + noms[i] + '"]');
            if (el) return el;
          }
          return null;
        };
        var cv = champ(['Volume estimé', 'Volume']);
        var cp = champ(['Poids estimé', 'Poids']);
        if (cv) cv.value = fmt(t.v, 2) + ' m³';
        if (cp) cp.value = Math.round(t.p) + ' kg';
        var f = cv || cp;
        if (f) { f.scrollIntoView({ block: 'center', behavior: 'smooth' }); f.focus(); }
        else { eM.textContent = 'Aucun formulaire sur cette page. Notez le résultat et reportez-le vous-même.'; }
      }
    });

    calcul();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
