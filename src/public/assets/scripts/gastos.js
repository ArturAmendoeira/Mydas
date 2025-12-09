const API_GASTOS = "http://localhost:3000/gastos";
const API_ORC = "http://localhost:3000/orcamentos";

const PALETA = {
  primaria: "#065F46",
  secundaria: "#374151",
  destaque: "#A7F3D0",
  fundo: "#F3F4F6",
  textoPrincipal: "#1F2937",
  textoSecundario: "#9CA3AF"
};

const selectAno = document.getElementById("filtroAno");
const selectMes = document.getElementById("filtroMes");

let graficoColunas = null;
let graficoPizza = null;
let graficoRestante = null;

function intensidadeVerde(valor, max) {
  const p = valor / max;
  return `rgba(6, 95, 70, ${0.3 + p * 0.7})`;
}

function irParaCadastroFinanceiro() {
  window.location.href = "cadastroFinanceiro.html";
}

async function carregarGastos() {
  const res = await fetch(API_GASTOS);
  return await res.json();
}

async function carregarOrcamentos() {
  try {
    const res = await fetch(API_ORC);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function popularFiltroAno() {
  const gastos = await carregarGastos();
  const anos = [...new Set(gastos.map(g => g.ano))].sort();

  anos.forEach(ano => {
    const opt = document.createElement("option");
    opt.value = ano;
    opt.textContent = ano;
    selectAno.appendChild(opt);
  });
}

function destruirGraficos() {
  if (graficoColunas) graficoColunas.destroy();
  if (graficoPizza) graficoPizza.destroy();
  if (graficoRestante) graficoRestante.destroy();
}

async function gerarGraficos() {
  destruirGraficos();

  const gastos = await carregarGastos();
  const orcamentos = await carregarOrcamentos();

  const filtroAno = selectAno.value;
  const filtroMes = selectMes.value;

  const gastosFiltrados = gastos.filter(g => {
    const okAno = filtroAno === "todos" || g.ano == filtroAno;
    const okMes = filtroMes === "todos" || g.mes === filtroMes;
    return okAno && okMes;
  });

  const orcFiltrado = orcamentos.filter(o => {
    const okAno = filtroAno === "todos" || o.ano == filtroAno;
    const okMes = filtroMes === "todos" || o.mes === filtroMes;
    return okAno && okMes;
  });

  const orcamentoTotal = orcFiltrado.reduce((s, o) => s + Number(o.valor), 0);

  const categorias = {};
  gastosFiltrados.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + Number(g.valor);
  });

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);
  const maxValor = Math.max(...valores, 1);
  const cores = valores.map(v => intensidadeVerde(v, maxValor));

  graficoColunas = new Chart(document.getElementById("graficoColunas"), {
    type: "bar",
    data: { labels, datasets:[{data: valores, backgroundColor: cores}] },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{ y:{beginAtZero:true}, x:{ticks:{autoSkip:false}} }
    }
  });

  graficoPizza = new Chart(document.getElementById("graficoPizza"), {
    type:"pie",
    data:{labels,datasets:[{data: valores, backgroundColor: cores}]},
    options:{responsive:true, maintainAspectRatio:false}
  });

  const totalGasto = valores.reduce((a,b)=>a+b,0);
  const restante = orcamentoTotal - totalGasto;

  graficoRestante = new Chart(document.getElementById("graficoRestante"), {
    type:"bar",
    data:{
      labels:["Gasto","Restante"],
      datasets:[{data:[totalGasto, restante<0?0:restante],
        backgroundColor:[intensidadeVerde(totalGasto,orcamentoTotal||1),PALETA.destaque]
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });
}

selectAno.addEventListener("change", gerarGraficos);
selectMes.addEventListener("change", gerarGraficos);

popularFiltroAno();
gerarGraficos();
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