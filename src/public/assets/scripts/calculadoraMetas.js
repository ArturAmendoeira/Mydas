const calculadoraDeMetas = {
  metaFinanceira: { valorObjetivo: null, valorInicial: null, prazoMeses: 12, taxaRendimentoMensal: null },
  resultado: { valorMensal: null, valorTotalInvestido: null, valorFinal: null }
};

document.getElementById('formMetas').addEventListener('submit', async function (event) {
  event.preventDefault();

  const valorObjetivo = parseFloat(document.getElementById('valorObjetivo').value);
  const valorInicial = parseFloat(document.getElementById('valorInicial').value);
  const prazoMeses = parseFloat(document.getElementById('prazoMeses').value);
  const taxaRendimentoMensal = parseFloat(document.getElementById('taxaRendimentoMensal').value);

  const taxaDecimal = taxaRendimentoMensal / 100;
  const valorMensal = (valorObjetivo - valorInicial * Math.pow(1 + taxaDecimal, prazoMeses)) * taxaDecimal /
    (Math.pow(1 + taxaDecimal, prazoMeses) - 1);
  const totalInvestido = valorMensal * prazoMeses + valorInicial;

  calculadoraDeMetas.resultado.valorMensal = valorMensal;
  calculadoraDeMetas.resultado.valorTotalInvestido = totalInvestido;
  calculadoraDeMetas.resultado.valorFinal = valorObjetivo;

  if (prazoMeses <= 0) {
    document.getElementById('resultado').innerHTML = `
      <strong>Resultado:</strong><br> 
      prazo não pode ser igual ou menor do que 0.
    `;
    return;
  }

  const resultadoParaSalvar = {
    valorObjetivo,
    valorInicial,
    prazoMeses,
    taxaRendimentoMensal,
    valorMensal,
    valorTotalInvestido: totalInvestido,
    valorFinal: valorObjetivo,
    criadoEm: new Date().toISOString()
  };

  try {
    const response = await fetch('http://localhost:3000/calculadoraMetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultadoParaSalvar)
    });

    if (!response.ok) throw new Error('Erro ao salvar no servidor');

    const resultadoServidor = await response.json();
    console.log('Salvo no servidor:', resultadoServidor);

    localStorage.setItem('resultadoMeta', JSON.stringify(resultadoParaSalvar));

window.location.href = 'resultadoCalculadoraMetas.html';

  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Ocorreu um erro ao salvar os dados. Tente novamente.');
  }
});
