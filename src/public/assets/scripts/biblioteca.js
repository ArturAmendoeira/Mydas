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
const API_URL = "http://localhost:3000/conteudos";

let conteudos = [];

// ELEMENTOS
const container = document.getElementById("conteudos");
const searchBar = document.getElementById("searchBar");
const tipoFiltro = document.getElementById("tipoFiltro");
const categoriaFiltro = document.getElementById("categoriaFiltro");
const duracaoFiltro = document.getElementById("duracaoFiltro");
const lancamentoFiltro = document.getElementById("lancamentoFiltro");

const detalhe = document.getElementById("detalhe");
const detalheTitulo = document.getElementById("detalheTitulo");
const detalheDescricao = document.getElementById("detalheDescricao");
const detalheConteudo = document.getElementById("detalheConteudo");
const detalheAutor = document.getElementById("detalheAutor");
const voltarBtn = document.getElementById("voltarBtn");

// --------------------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------------------
function extractYouTubeID(url) {
    if (!url) return null;
    const reg = /(?:v=|\/embed\/|\.be\/)([A-Za-z0-9_-]+)/;
    const m = url.match(reg);
    return m ? m[1] : null;
}

function getThumb(post) {
    const link = (post.link || "").trim();

    if (link.includes("youtube.com") || link.includes("youtu.be")) {
        const id = extractYouTubeID(link);
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }

    if (link.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i)) {
        return link;
    }

    if (post.imagem && post.imagem.trim() !== "") {
        return post.imagem;
    }

    return "assets/img/default.png";
}

function gerarMidia(post) {
    if (!post.link) return "";

    if (post.link.includes("youtube")) {
        let id = extractYouTubeID(post.link);
        return `
        <iframe src="https://www.youtube.com/embed/${id}" class="playerVideo" allowfullscreen></iframe>
        `;
    }

    if (post.link.endsWith(".mp4")) {
        return `
        <video controls class="playerVideo">
            <source src="${post.link}" type="video/mp4">
        </video>`;
    }

    if (post.link.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        return `<img src="${post.link}" class="playerImagem">`;
    }

    return "";
}

// --------------------------------------------------
// CARREGAR DADOS
// --------------------------------------------------
async function carregarConteudos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Erro ao acessar API");

        conteudos = await res.json();

        preencherFiltros();
        mostrarConteudos();
    } catch (err) {
        console.error("Erro ao carregar conteúdos:", err);
        container.innerHTML = "<p>Não foi possível carregar os conteúdos.</p>";
    }
}

// --------------------------------------------------
// FILTROS
// --------------------------------------------------
function preencherFiltros() {
    if (!conteudos.length) return;

    tipoFiltro.innerHTML = '<option value="">Todos</option>';
    [...new Set(conteudos.map(c => c.tipo || "Outro"))]
        .forEach(t => tipoFiltro.innerHTML += `<option value="${t}">${t}</option>`);

    categoriaFiltro.innerHTML = '<option value="">Todas</option>';
    [...new Set(conteudos.map(c => c.categoria || "Sem categoria"))]
        .forEach(c => categoriaFiltro.innerHTML += `<option value="${c}">${c}</option>`);

    duracaoFiltro.innerHTML = '<option value="">Todas</option>';
    [...new Set(conteudos.map(c => c.duracao || "Desconhecida"))]
        .forEach(d => duracaoFiltro.innerHTML += `<option value="${d}">${d}</option>`);

    lancamentoFiltro.innerHTML = '<option value="">Todos</option>';
    [...new Set(conteudos.map(c => c.lancamento || "0"))]
        .sort((a, b) => b - a)
        .forEach(l => lancamentoFiltro.innerHTML += `<option value="${l}">${l}</option>`);
}

// --------------------------------------------------
// EXIBIR CARDS
// --------------------------------------------------
function mostrarConteudos() {
    container.innerHTML = "";

    const termo = (searchBar?.value || "").toLowerCase();
    const tipo = tipoFiltro?.value || "";
    const categoria = categoriaFiltro?.value || "";
    const duracao = duracaoFiltro?.value || "";
    const lancamento = lancamentoFiltro?.value || "";

    const filtrados = conteudos.filter(c =>
        (c.titulo || "").toLowerCase().includes(termo) &&
        (tipo === "" || c.tipo === tipo) &&
        (categoria === "" || c.categoria === categoria) &&
        (duracao === "" || c.duracao === duracao) &&
        (lancamento === "" || String(c.lancamento) === lancamento)
    );

    if (!filtrados.length) {
        container.innerHTML = "<p>Nenhum conteúdo encontrado.</p>";
        return;
    }

    filtrados.forEach(c => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
        <img class="thumb" src="${getThumb(c)}" alt="${c.titulo}">
        <h3>${c.titulo}</h3>
        <p class="descricao">${c.descricao || ""}</p>
        `;

        card.addEventListener("click", () => abrirDetalhe(c));
        container.appendChild(card);
    });
}

// --------------------------------------------------
// DETALHES
// --------------------------------------------------
function abrirDetalhe(c) {
    detalheTitulo.textContent = c.titulo;
    detalheDescricao.textContent = c.descricao || "";
    detalheAutor.textContent = "Publicado por: " + (c.autor || "Desconhecido");

    detalheConteudo.innerHTML = gerarMidia(c);

    detalhe.classList.remove("oculto");
}

voltarBtn?.addEventListener("click", () => detalhe.classList.add("oculto"));

// --------------------------------------------------
carregarConteudos();
