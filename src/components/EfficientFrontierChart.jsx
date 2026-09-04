import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export default function EfficientFrontierChart({ frontierData, minVarPortfolio, maxSharpePortfolio, individualAssets }) {
  if (!frontierData || frontierData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center h-64 text-gray-500">
        No hay datos de la frontera eficiente disponibles.
      </div>
    );
  }

  const traces = [
    {
      mode: 'lines',
      line: { color: '#6366f1', width: 3 },
      name: 'Frontera Eficiente',
      x: frontierData.map(d => d.risk),
      y: frontierData.map(d => d.return),
      type: 'scatter'
    },
  ];

  if (maxSharpePortfolio) {
    traces.push({
      mode: 'markers',
      marker: { color: '#f59e0b', size: 16, symbol: 'star' },
      name: 'Máx. Sharpe (Tangente)',
      x: [maxSharpePortfolio.risk],
      y: [maxSharpePortfolio.return],
      type: 'scatter'
    });
  }

  if (minVarPortfolio) {
    traces.push({
      mode: 'markers',
      marker: { color: '#10b981', size: 14, symbol: 'diamond' },
      name: 'Mín. Varianza',
      x: [minVarPortfolio.risk],
      y: [minVarPortfolio.return],
      type: 'scatter'
    });
  }

  if (individualAssets && individualAssets.length > 0) {
    traces.push({
      mode: 'markers+text',
      marker: { color: '#ef4444', size: 10 },
      text: individualAssets.map(a => a.ticker),
      textposition: 'top center',
      name: 'Activos Individuales',
      x: individualAssets.map(a => a.risk),
      y: individualAssets.map(a => a.return),
      type: 'scatter'
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4" style={{ width: '100%', height: '500px' }}>
      <Plot
        data={traces}
        layout={{
          title: 'Frontera Eficiente de Markowitz',
          xaxis: { title: 'Riesgo (Volatilidad Anualizada)', tickformat: '.1%' },
          yaxis: { title: 'Retorno Esperado Anualizado', tickformat: '.1%' },
          showlegend: true,
          legend: { x: 1, y: 1, xanchor: 'right', yanchor: 'top' },
          plot_bgcolor: '#fafafa',
          paper_bgcolor: 'white',
          hovermode: 'closest',
          margin: { t: 60, r: 30, b: 60, l: 70 },
          autosize: true
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          toImageButtonOptions: { format: 'png', filename: 'frontera_eficiente', width: 1200, height: 800 }
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
