const API_GASTOS = "http://localhost:3000/gastos";
const API_ORC = "http://localhost:3000/orcamentos";

const formGasto = document.getElementById("formGasto");
const formOrcamento = document.getElementById("formOrcamento");

formGasto.addEventListener("submit", cadastrarGasto);
formOrcamento.addEventListener("submit", cadastrarOrcamento);

const ANOS = [2024, 2025, 2026];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

async function cadastrarGasto(e) {
  e.preventDefault();

  const anoSelecionado = document.getElementById("anoGasto").value;
  const mesSelecionado = document.getElementById("mesGasto").value;
  const categoria = document.getElementById("categoriaGasto").value;
  const valor = parseFloat(document.getElementById("valorGasto").value);

  const anos = (anoSelecionado === "todos") ? ANOS : [parseInt(anoSelecionado)];
  const meses = (mesSelecionado === "todos") ? MESES : [mesSelecionado];

  for (const ano of anos) {
    for (const mes of meses) {
      await fetch(API_GASTOS, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ano, mes, categoria, valor})
      });
    }
  }

  formGasto.reset();
  listarGastos();
}

async function cadastrarOrcamento(e) {
  e.preventDefault();

  const anoSelecionado = document.getElementById("anoOrcamento").value;
  const mesSelecionado = document.getElementById("mesOrcamento").value;
  const valor = parseFloat(document.getElementById("valorOrcamento").value);

  const anos = (anoSelecionado === "todos") ? ANOS : [parseInt(anoSelecionado)];
  const meses = (mesSelecionado === "todos") ? MESES : [mesSelecionado];

  for (const ano of anos) {
    for (const mes of meses) {
      await fetch(API_ORC, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ano, mes, valor})
      });
    }
  }

  formOrcamento.reset();
  listarOrcamentos();
}

async function listarGastos() {
  const tbody = document.querySelector("#tabelaGastos tbody");
  tbody.innerHTML = "";
  const res = await fetch(API_GASTOS);
  const dados = await res.json();

  dados.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.ano}</td>
      <td>${g.mes}</td>
      <td>${g.categoria}</td>
      <td>R$ ${Number(g.valor).toFixed(2)}</td>
      <td><button onclick="excluirGasto('${g.id}')">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function listarOrcamentos() {
  const tbody = document.querySelector("#tabelaOrcamentos tbody");
  tbody.innerHTML = "";
  const res = await fetch(API_ORC);
  const dados = await res.json();

  dados.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.ano}</td>
      <td>${o.mes}</td>
      <td>R$ ${Number(o.valor).toFixed(2)}</td>
      <td><button onclick="excluirOrcamento('${o.id}')">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function excluirGasto(id) {
  if (!confirm("Deseja realmente excluir este gasto?")) return;
  await fetch(`${API_GASTOS}/${id}`, {method:"DELETE"});
  listarGastos();
}

async function excluirOrcamento(id) {
  if (!confirm("Deseja realmente excluir este orçamento?")) return;
  await fetch(`${API_ORC}/${id}`, {method:"DELETE"});
  listarOrcamentos();
}

listarGastos();
listarOrcamentos();
function voltar() {
  window.location.href = "gastos.html"; // coloque o nome correto da página de acompanhamento
}
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