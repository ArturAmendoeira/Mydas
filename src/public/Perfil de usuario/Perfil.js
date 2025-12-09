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

const API_URL = "http://localhost:3000/usuarios/1";

const form = document.getElementById("perfilForm");
const editarBtn = document.getElementById("editarBtn");
const resetBtn = document.getElementById("resetBtn");
const mensagem = document.getElementById("mensagem");

let editando = false;

const campos = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  idade: document.getElementById("idade"),
  renda: document.getElementById("renda"),
  profissao: document.getElementById("profissao"),
};

const perfilRadios = document.querySelectorAll("input[name='perfil']");

const displays = {
  nome: document.getElementById("nomeDisplay"),
  profissao: document.getElementById("profissaoDisplay"),
  perfil: document.getElementById("perfilDisplay"),
  resumoEmail: document.getElementById("resumoEmail"),
  resumoTelefone: document.getElementById("resumoTelefone"),
  resumoIdade: document.getElementById("resumoIdade"),
  resumoRenda: document.getElementById("resumoRenda"),
  resumoProfissao: document.getElementById("resumoProfissao"),
  resumoPerfil: document.getElementById("resumoPerfil"),
  avatar: document.getElementById("avatar"),
};

let dados = {};

async function carregarDados() {
  try {
    const resposta = await fetch(API_URL);
    dados = await resposta.json();
    atualizarCampos();
    atualizarDisplay();
    toggleEdit();
  } catch (err) {
    mensagem.textContent = "Erro ao carregar dados.";
  }
}

function atualizarCampos() {
  for (let k in campos) campos[k].value = dados[k] ?? "";
  perfilRadios.forEach(r => r.checked = (r.value === dados.perfil));
}

function atualizarDisplay() {
  displays.nome.textContent = dados.nome;
  displays.profissao.textContent = `${dados.profissao} • Perfil: `;
  displays.perfil.textContent = dados.perfil;
  displays.resumoEmail.textContent = dados.email;
  displays.resumoTelefone.textContent = dados.telefone || "—";
  displays.resumoIdade.textContent = dados.idade;
  displays.resumoRenda.textContent = `R$ ${Number(dados.renda).toLocaleString()}`;
  displays.resumoProfissao.textContent = dados.profissao;
  displays.resumoPerfil.textContent = dados.perfil;
  displays.avatar.textContent = dados.nome.charAt(0).toUpperCase();
}

function toggleEdit() {
  editando = !editando;

  Object.values(campos).forEach(c => c.disabled = !editando);
  perfilRadios.forEach(r => r.disabled = !editando);

  document.getElementById("salvarBtn").disabled = !editando;
  editarBtn.textContent = editando ? "Cancelar" : "Editar";
}

async function salvar(e) {
  e.preventDefault();

  for (let k in campos) dados[k] = campos[k].value;
  dados.perfil = [...perfilRadios].find(r => r.checked)?.value;

  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    mensagem.textContent = "Perfil salvo!";
    toggleEdit();
    atualizarDisplay();
  } catch {
    mensagem.textContent = "Erro ao salvar.";
  }
}

async function resetar() {
  const padrao = {
    id: 1,
    nome: "João Silva",
    email: "joao@example.com",
    telefone: "",
    idade: 30,
    renda: 3500,
    profissao: "Desenvolvedor",
    perfil: "moderado"
  };

  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(padrao),
    });

    dados = padrao;
    atualizarCampos();
    atualizarDisplay();
    mensagem.textContent = "Restaurado.";
  } catch {
    mensagem.textContent = "Erro ao resetar.";
  }
}

editarBtn.addEventListener("click", toggleEdit);
resetBtn.addEventListener("click", resetar);
form.addEventListener("submit", salvar);

carregarDados();