
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.navlinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}
const form = document.querySelector('#quote-form');
if(form){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    document.querySelector('#form-message').textContent = "Merci. Votre demande a bien été enregistrée dans cette maquette.";
    form.reset();
  });
}
