document.addEventListener('DOMContentLoaded', () => {
    const resultado = JSON.parse(localStorage.getItem('resultadoMeta'));

    const container = document.getElementById('resultado');

    if (!resultado) {
        container.innerHTML = "<p>Nenhum cálculo foi realizado.</p>";
    } else {
        container.innerHTML = `
            <div class="resultado-card">
                <h3>Resultado da sua meta</h3>
                <p>Guardar <strong>R$ ${resultado.valorMensal.toFixed(2)}</strong> por mês</p>
                <p>Total investido: <strong>R$ ${resultado.valorTotalInvestido.toFixed(2)}</strong></p>
                <p>Meta final: <strong>R$ ${resultado.valorFinal.toFixed(2)}</strong></p>
            </div>
        `;
    }

    const botaoVoltar = document.createElement('button');
    botaoVoltar.id = 'voltar';
    botaoVoltar.textContent = 'Voltar para a Calculadora';
    botaoVoltar.style.display = 'block';
    botaoVoltar.style.margin = '20px auto';
    botaoVoltar.style.padding = '10px 25px';
    botaoVoltar.style.backgroundColor = '#1f618d';
    botaoVoltar.style.color = '#fff';
    botaoVoltar.style.border = 'none';
    botaoVoltar.style.borderRadius = '8px';
    botaoVoltar.style.cursor = 'pointer';
    botaoVoltar.style.fontSize = '16px';

    botaoVoltar.addEventListener('click', () => {
  window.location.href = './calculadoraMetas.html';
    });

    container.appendChild(botaoVoltar);
});
