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

const API_URL = "http://localhost:3000/users"; // JSON-SERVER

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
  authForm.dataset.mode = mode;
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
switchToCreate?.addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Criar conta';
  authForm.dataset.mode = "create";
});

// FUNÇÕES DE BACKEND (JSON-SERVER)
async function createUser(email, password){
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.ok;
  } catch(err){
    console.error("Erro ao criar usuário:", err);
    return false;
  }
}

async function loginUser(email, password){
  try {
    const res = await fetch(`${API_URL}?email=${email}&password=${password}`);
    const data = await res.json();
    return data.length > 0 ? data[0] : null; // retorna o usuário se existir
  } catch(err){
    console.error("Erro ao logar:", err);
    return null;
  }
}

// FORM AUTH
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const mode = authForm.dataset.mode;
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();

  if(!email || pass.length < 4){
    authFeedback.textContent = 'Preencha corretamente os campos.';
    return;
  }

  if(mode === "create"){
    const ok = await createUser(email, pass);
    authFeedback.textContent = ok ? "Conta criada!" : "Erro ao criar.";
    if(ok) setTimeout(() => { closeModal(); }, 900);
    return;
  }

  if(mode === "login"){
    const user = await loginUser(email, pass);
    if(user){
      authFeedback.textContent = `Login aprovado! Bem-vindo, ${user.email}`;
      setTimeout(() => { closeModal(); }, 900);
    } else {
      authFeedback.textContent = "Dados incorretos!";
    }
    return;
  }
});

// Fechar menu ao clicar link
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('show');
  });
});

// Usabilidade cards
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.add('active');
    setTimeout(()=> card.classList.remove('active'), 700);
  });
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') card.click();
  });
});
