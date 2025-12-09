function checkIfLogged() {
    const userData = sessionStorage.getItem("usuario");
    if (!userData) {
        return false;
    }

    try {
        const user = JSON.parse(userData);
        return !!user && !!user.email; // retorna true se existir usuário válido
    } catch (err) {
        console.error("Erro ao ler sessionStorage:", err);
        return false;
    }
}

// NAV MENU (hamburger)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('open');
});

// MODAL
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const btnLoginTop = document.getElementById('btnLoginTop');
const btnFooterLogin = document.getElementById('btnFooterLogin');
const btnCreate = document.getElementById('btnCreate');
const btnCreateTop = document.getElementById('btnCreateTop');
const authForm = document.getElementById('authForm');
const authFeedback = document.getElementById('authFeedback');
const switchToCreate = document.getElementById('switchToCreate');

function openModal(mode = 'login'){
  modalBackdrop.style.display = 'flex';
  modalBackdrop.setAttribute('aria-hidden','false');
  document.getElementById('modalTitle').textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
  authFeedback.textContent = '';
  document.getElementById('email').focus();
}

function closeModal(){
  modalBackdrop.style.display = 'none';
  modalBackdrop.setAttribute('aria-hidden','true');
}

btnLoginTop?.addEventListener('click', () => openModal('login'));
btnFooterLogin?.addEventListener('click', () => openModal('login'));
btnCreate?.addEventListener('click', () => openModal('create'));
btnCreateTop?.addEventListener('click', () => openModal('create'));

modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', (ev) => {
  if(ev.target === modalBackdrop) closeModal();
});

// Switch mode inside modal
switchToCreate.addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Criar conta';
});

// AUTH FORM (simulação apenas)
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();

  // validação simples
  if(!email || pass.length < 4){
    authFeedback.textContent = 'Preencha corretamente os campos.';
    return;
  }

  // Simula sucesso (sem backend)
  authFeedback.textContent = 'Pronto — ação simulada (sem backend).';
  setTimeout(() => {
    closeModal();
    alert('Login / Cadastro simulado com sucesso. (Opção front-end apenas)');
  }, 900);
});

// Melhor usabilidade: fechar menu ao clicar em link
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('show');
  });
});

// Permitir abrir card com Enter (acessibilidade)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.add('active');
    setTimeout(()=> card.classList.remove('active'), 700);
  });
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') card.click();
  });
});