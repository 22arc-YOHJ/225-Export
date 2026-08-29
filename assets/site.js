
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.navlinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// Formulaire de contact : pas encore relie a une boite de reception.
// On le dit clairement au visiteur et on ne vide pas ce qu il a ecrit.
const form = document.querySelector('#quote-form');
if(form){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    document.querySelector('#form-message').textContent =
      "Ce formulaire n'est pas encore en service. Écrivez-nous à 22arc.yohj@gmail.com, ou utilisez la page Demander un devis, qui fonctionne.";
  });
}
