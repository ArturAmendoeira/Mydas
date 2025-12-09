fetch("http://localhost:3000/resultados")
  .then(response => response.json())
  .then(data => {
    if (data.length === 0) {
      document.getElementById("resultado").innerHTML = `
        <div class="card vazio">
          <p>Nenhum cálculo encontrado.</p>
        </div>
      `;
      return;
    }

    const ultimo = data[data.length - 1];

    document.getElementById("resultado").innerHTML = `
      <div class="card-resultado">
        <h2>📊 Resultado do Cálculo</h2>

        <div class="linha">
          <span>Valor Inicial:</span>
          <strong>R$ ${ultimo.valorInicial}</strong>
        </div>

        <div class="linha">
          <span>Taxa Mensal:</span>
          <strong>${(ultimo.taxaJurosMensal * 100).toFixed(2)}%</strong>
        </div>

        <div class="linha">
          <span>Tempo:</span>
          <strong>${ultimo.tempoMeses} meses</strong>
        </div>

        <div class="linha">
          <span>Aporte Mensal:</span>
          <strong>R$ ${ultimo.aporteMensal}</strong>
        </div>

        <hr>

        <div class="linha destaque">
          <span>VALOR FINAL:</span>
          <strong>R$ ${ultimo.valorFinal}</strong>
        </div>
      </div>
    `;
  });
