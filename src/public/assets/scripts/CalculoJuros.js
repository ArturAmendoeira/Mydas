document.getElementById("formJuros").addEventListener("submit", function (event) {
    event.preventDefault();

    const valorInicial = parseFloat(document.getElementById("valorInicial").value);
    const taxaJuros = parseFloat(document.getElementById("taxaJuros").value) / 100;
    const tempo = parseInt(document.getElementById("tempo").value);
    const aporteMensal = parseFloat(document.getElementById("aporteMensal").value);

    let valorFinal = valorInicial * Math.pow(1 + taxaJuros, tempo);
    for (let i = 1; i <= tempo; i++) {
        valorFinal += aporteMensal * Math.pow(1 + taxaJuros, tempo - i);
    }

    const resultado = {
        valorInicial,
        taxaJurosMensal: taxaJuros,
        tempoMeses: tempo,
        aporteMensal,
        valorFinal: parseFloat(valorFinal.toFixed(2)),
        data: new Date().toISOString()
    };

    fetch("http://localhost:3000/resultados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado)
    })
    .then(response => response.json())
    .then(() => {
window.location.href = "resultado.html";
    })
    .catch(err => console.error("Erro ao salvar:", err));
});
