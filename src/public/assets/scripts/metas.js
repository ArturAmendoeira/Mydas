document.addEventListener("DOMContentLoaded", async () => {
    const user = await PegarUsuario();
    await carregarGamificacao();
    await renderizarMetas();
});

// ------------------------------
// Sistema de Gamificação 
// ------------------------------
async function carregarGamificacao() {
    const perfil = await fetch("http://localhost:3000/perfil?usuario_Id=123")
        .then(r => r.json());
    renderizarGamificacaoUI();
    return perfil[0];
}

async function salvarGamificacao(dados) {
    console.log(dados);
    await fetch(`http://localhost:3000/perfil/${dados.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    renderizarGamificacaoUI();
}

async function ganharXP(qtd) {
    const perfil = await carregarGamificacao();
    let xp = perfil.xp + qtd;
    let level = perfil.level;

    let subiu = false;
    while (xp >= level * 100) {
        xp -= level * 100;
        level++;
        subiu = true;
    }

    if (subiu) {
        toastGamificacaoAsync(`🎉 Você alcançou o nível ${level}!`);
    } else {
        toastGamificacaoAsync(`+${qtd} XP`);
    }

    await salvarGamificacao({ ...perfil, xp, level });
}

function toastGamificacaoAsync(texto) {
    return new Promise((resolve) => {
        const div = document.createElement("div");
        div.className = "toastGamificacao";
        div.innerText = texto;

        Object.assign(div.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#065F46",
            color: "white",
            padding: "10px 14px",
            borderRadius: "10px",
            fontWeight: "600",
            boxShadow: "0 6px 18px rgba(6,95,70,0.18)",
            opacity: "0",
            transform: "translateY(8px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            zIndex: 9999,
            pointerEvents: "none",
        });

        document.body.appendChild(div);

        requestAnimationFrame(() => {
            div.style.opacity = "1";
            div.style.transform = "translateY(0)";
        });

        // esconder depois de 1,8s + 0,4s de animação de saída
        setTimeout(() => {
            div.style.opacity = "0";
            div.style.transform = "translateY(8px)";
            setTimeout(() => {
                div.remove();
                resolve(); // <-- aqui a Promise é resolvida
            }, 400);
        }, 1800);
    });
}


async function adicionarConquista(nome) {
    const perfil = await carregarGamificacao();
    if (perfil.conquistas.includes(nome)) return;

    const novas = [...perfil.conquistas, nome];
    await salvarGamificacao({ ...perfil, conquistas: novas });
    toastGamificacao(`🏅 Conquista desbloqueada: ${nome}`);
}

async function registrarAdicaoValor(meta, valor) {
    const xp = Math.floor(valor / 10);
    await ganharXP(xp);

    const concluida = meta.valorAtual + valor >= meta.valorMeta;
    if (concluida) {
        await ganharXP(50);
        await adicionarConquista("Meta Concluída!");
    }
}

async function renderizarGamificacaoUI() {
    const perfil = await carregarGamificacao();

    document.getElementById("xpValor").innerText = perfil.xp;
    document.getElementById("levelValor").innerText = perfil.level;

    const lista = document.getElementById("listaConquistas");
    lista.innerHTML = "";

    if (perfil.conquistas.length === 0) {
        lista.innerHTML = "<li style='opacity:.6'>Nenhuma ainda</li>";
    } else {
        perfil.conquistas.forEach(c => {
            const li = document.createElement("li");
            li.innerText = c;
            lista.appendChild(li);
        });
    }

    const xpParaNivel = perfil.level * 100;
    const pct = Math.min(100, Math.round((perfil.xp / xpParaNivel) * 100));
    document.getElementById("xpBarFill").style.width = pct + "%";
}

// ------------------------------
// Lógica login
// ------------------------------
const PegarUsuario = async () => {
    const response = await fetch("http://localhost:3000/usuarios");
    if (!response.ok) console.log("response.status");
    const data = await response.json();
    return data;
}

// ------------------------------
// Renderização das metas
// ------------------------------
async function renderizarMetas() {
    const listMetas = document.getElementById("listMetas");
    listMetas.innerHTML = "";

    const metas = await carregarMetasByUser(123);

    metas.forEach(meta => {
        const novaMeta = document.createElement("div");
        novaMeta.classList.add("meta");

        const progresso = calcularProgresso(meta.valorMeta, meta.valorAtual, meta.categoria);

        novaMeta.innerHTML = `
    <div class="graph">
        <div class="title-box">
            <h2 class="title">${meta.titulo}</h2>
        </div>
        <canvas id="chart-${meta.id}"></canvas>
    </div>
    <div class="progresContainer">
        <div class="progress-title">
            <div class="title-box">
                <h2 class="title">Seu Progresso</h2>
            </div>
        </div>
        <div class="progress-bar-wrapper">
            <div class="progress-container">
                <div class="progress-fill" style="width: ${progresso}%;"></div>
            </div>
            <p id="progressText">${progresso.toFixed(2)}%</p>
        </div>
        <div class="extend">
            <button type="button" class="extendButton" onclick="abrirAdicionarValor('${meta.id}')">
                <h2>Adicionar</h2>
            </button>
            <button type="button" class="extendButton" onclick="abrirEditarMeta('${meta.id}')">
                <h2>Editar Meta</h2>
            </button>
        </div>
    </div>
    `;

        listMetas.appendChild(novaMeta);
        renderizarGrafico(meta, `chart-${meta.id}`);
    });
}

const carregarMetasByUser = async (userId) => {
    const response = await fetch(`http://localhost:3000/metas?usuario_Id=${userId}`);
    if (!response.ok) console.log("response.status");
    const data = await response.json();
    return data.length > 0 ? data : [];
}

// ------------------------------
// Edição metas
// ------------------------------
const formAdicionar = document.getElementById("formAdicionar");
const formEditarMeta = document.getElementById("formEditar");

formAdicionar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const id = formData.get("metaId");
    const valorAdicionar = Number(formData.get("valor"));
    const hoje = new Date().toISOString().split("T")[0];

    const meta = await fetch(`http://localhost:3000/metas/${id}`).then(r => r.json());
    const novoValor = meta.valorAtual + valorAdicionar;

    let novoHistorico = [...meta.historico];
    const indexHoje = novoHistorico.findIndex(item => item.data === hoje);

    if (indexHoje !== -1) {
        novoHistorico[indexHoje].valor += valorAdicionar;
    } else {
        novoHistorico.push({ data: hoje, valor: novoValor });
    }

    await fetch(`http://localhost:3000/metas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            valorAtual: novoValor,
            progresso: Number(((novoValor / meta.valorMeta) * 100).toFixed(2)),
            historico: novoHistorico
        })
    });

    await registrarAdicaoValor(meta, valorAdicionar);
    fecharModal();
    e.target.reset();
    renderizarMetas();
});

formEditarMeta.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const id = formData.get("metaId");

    const dadosEditados = {
        titulo: formData.get("titulo"),
        descricao: formData.get("descricao"),
        valorMeta: Number(formData.get("valorMeta")),
        categoria: formData.get("categoria"),
        tipo: formData.get("tipo")
    };

    await fetch(`http://localhost:3000/metas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEditados)
    });

    fecharModal();
    renderizarMetas();
});

async function excluirMeta() {
    const id = document.querySelector("#formEditar [name='metaId']").value;
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    await fetch(`http://localhost:3000/metas/${id}`, { method: "DELETE" });

    fecharModal();
    renderizarMetas();
}

// ------------------------------
// Abrir/Fechar Modais
// ------------------------------
function abrirAdicionarValor(id) {
    document.getElementById("modalAdicionar").classList.remove("hidden");
    document.querySelector("#formAdicionar [name='metaId']").value = id;
}

async function abrirEditarMeta(id) {
    document.getElementById("modalEditar").classList.remove("hidden");
    document.querySelector("#formEditar [name='metaId']").value = id;

    const meta = await fetch(`http://localhost:3000/metas/${id}`).then(r => r.json());
    document.querySelector("#formEditar [name='titulo']").value = meta.titulo;
    document.querySelector("#formEditar [name='descricao']").value = meta.descricao;
    document.querySelector("#formEditar [name='valorMeta']").value = meta.valorMeta;
    document.querySelector("#formEditar [name='categoria']").value = meta.categoria;
    document.querySelector("#formEditar [name='tipo']").value = meta.tipo;
}

function fecharModal() {
    document.getElementById("modalAdicionar").classList.add("hidden");
    document.getElementById("modalEditar").classList.add("hidden");
    const formAdicionar = document.getElementById("formAdicionar");
    formAdicionar.reset();
}

// ------------------------------
// Criar novas metas
// ------------------------------
const modal = document.getElementById("metaFormModal");
const formAddMeta = document.getElementById("metaForm");
const cancelarForm = document.getElementById("cancelarForm");
const abrirForm = document.getElementById("btnNovaMeta");

abrirForm.addEventListener("click", () => modal.classList.remove("hidden"));
cancelarForm.addEventListener("click", () => modal.classList.add("hidden"));

formAddMeta.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const novaMeta = {
        id: crypto.randomUUID(),
        usuario_Id: 123,
        titulo: formData.get("titulo"),
        descricao: formData.get("descricao"),
        valorMeta: Number(formData.get("valorMeta")),
        valorAtual: Number(formData.get("valorAtual") || 0),
        categoria: formData.get("categoria"),
        dataInicio: new Date().toISOString().split("T")[0],
        dataFim: "",
        progresso: 0,
        status: "em andamento",
        tipo: "normal",
        historico: []
    };

    console.log("Meta sendo enviada:", novaMeta);

    await fetch("http://localhost:3000/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaMeta)
    });

    modal.classList.add("hidden");
    e.target.reset();
    renderizarMetas();
});

// ------------------------------
// Funções auxiliares
// ------------------------------
function calcularProgresso(valorMeta, valorAtual, categoria) {
    if (!categoria) return 0;
    if (categoria.toLowerCase() === "dívida") {
        const restante = Math.max(0, valorAtual);
        return Math.min(100, ((valorMeta - restante) / valorMeta) * 100);
    } else {
        return Math.min(100, (valorAtual / valorMeta) * 100);
    }
}

function renderizarGrafico(meta, canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const hoje = new Date();
    const labels = [];
    const valoresHistorico = [];
    let ultimoValor = 0;

    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(mes.toLocaleString("pt-BR", { month: "short", year: "2-digit" }));

        const registrosAteOMes = meta.historico
            ?.filter(h => new Date(h.data) <= new Date(mes.getFullYear(), mes.getMonth() + 1, 0))
            .sort((a, b) => new Date(b.data) - new Date(a.data));

        if (registrosAteOMes?.length > 0) ultimoValor = registrosAteOMes[0].valor;
        valoresHistorico.push(ultimoValor);
    }

    const valorAtualArray = Array(labels.length).fill(null);
    valorAtualArray[labels.length - 1] = meta.valorAtual;

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "Histórico Mensal", data: valoresHistorico, borderColor: "#4bc0c0", backgroundColor: "rgba(75, 192, 192, 0.15)", tension: 0.2, fill: true },
                { label: "Valor da Meta", data: Array(labels.length).fill(meta.valorMeta), borderColor: "#ff6384", borderDash: [6, 6] },
                { label: "Valor Atual", data: valorAtualArray, borderColor: "#36a2eb", pointRadius: 7, pointBackgroundColor: "#36a2eb", showLine: false }
            ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// ------------------------------
// Pequena garantia de root
// ------------------------------
const root = document.documentElement;

// ==============================
// FIM do script.js corrigido
// ==============================