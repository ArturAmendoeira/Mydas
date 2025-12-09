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

const API_BASE = "http://localhost:3000";

// Formulário
const form = document.getElementById("formPost");
const meusConteudos = document.getElementById("meusConteudos");

let editandoId = null;

// ----------------------------------------
// Função para extrair thumbnail de YouTube
// ----------------------------------------
function gerarThumbnail(link) {
  if (!link) return "assets/img/sem-imagem.png";

  // Se for YouTube — cria automaticamente a thumb
  if (link.includes("youtube.com") || link.includes("youtu.be")) {
    let videoId = "";

    if (link.includes("watch?v=")) {
      videoId = link.split("watch?v=")[1].split("&")[0];
    } else if (link.includes("youtu.be/")) {
      videoId = link.split("youtu.be/")[1];
    }

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Se já for imagem direta
  if (link.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return link;
  }

  // Caso contrário, usa a imagem padrão
  return "assets/img/sem-imagem.png";
}

// ===============================
// CARREGAR POSTS EXISTENTES
// ===============================
async function carregarPosts() {
  const res = await fetch(`${API_BASE}/conteudos`);
  const dados = await res.json();

  meusConteudos.innerHTML = "";

  dados.forEach(post => {
    const thumb = gerarThumbnail(post.link);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img class="thumb" src="${thumb}" alt="Thumb">

      <h3>${post.titulo}</h3>
      <p>${post.tipo} • ${post.categoria}</p>

      <div class="botoes">
        <button class="btnEditar">✏ Editar</button>
        <button class="btnExcluir">🗑 Excluir</button>
      </div>
    `;

    // Eventos
    card.querySelector(".btnEditar").addEventListener("click", () => editarPost(post.id));
    card.querySelector(".btnExcluir").addEventListener("click", () => deletarPost(post.id));

    meusConteudos.appendChild(card);
  });
}

carregarPosts();

// ===============================
// SALVAR POST (CRIAR OU EDITAR)
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const novoPost = {
    titulo: document.getElementById("titulo").value,
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    duracao: document.getElementById("duracao").value,
    lancamento: document.getElementById("lancamento").value,
    link: document.getElementById("link").value,
    descricao: document.getElementById("descricao").value,
  };

  if (editandoId === null) {

    await fetch(`${API_BASE}/conteudos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPost)
    });

  } else {

    await fetch(`${API_BASE}/conteudos/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPost)
    });

    editandoId = null;
    document.getElementById("formTitulo").textContent = "Nova Postagem";
    document.getElementById("cancelEdit").classList.add("oculto");
  }

  form.reset();
  carregarPosts();
});

// ===============================
// EDITAR POST
// ===============================
async function editarPost(id) {

  const confirmar = confirm("Tem certeza que deseja editar este conteúdo?");
  if (!confirmar) return;

  const res = await fetch(`${API_BASE}/conteudos/${id}`);
  const post = await res.json();

  editandoId = id;

  document.getElementById("titulo").value = post.titulo;
  document.getElementById("tipo").value = post.tipo;
  document.getElementById("categoria").value = post.categoria;
  document.getElementById("duracao").value = post.duracao;
  document.getElementById("lancamento").value = post.lancamento;
  document.getElementById("link").value = post.link;
  document.getElementById("descricao").value = post.descricao;

  document.getElementById("formTitulo").textContent = "Editar Postagem";
  document.getElementById("cancelEdit").classList.remove("oculto");
}

// ===============================
// CANCELAR EDIÇÃO
// ===============================
document.getElementById("cancelEdit").addEventListener("click", () => {
  editandoId = null;
  form.reset();
  document.getElementById("formTitulo").textContent = "Nova Postagem";
  document.getElementById("cancelEdit").classList.add("oculto");
});

// ===============================
// DELETAR
// ===============================
async function deletarPost(id) {

  const confirmar = confirm("Deseja realmente excluir este conteúdo?");
  if (!confirmar) return;

  await fetch(`${API_BASE}/conteudos/${id}`, { method: "DELETE" });
  carregarPosts();
}

window.editarPost = editarPost;
window.deletarPost = deletarPost;