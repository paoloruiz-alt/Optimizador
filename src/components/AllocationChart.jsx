import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'];

export default function AllocationChart({ minVarPortfolio, maxSharpePortfolio, tickers }) {
  if (!minVarPortfolio && !maxSharpePortfolio) return null;

  const renderChart = (title, portfolio) => {
    if (!portfolio) return null;

    const filteredData = portfolio.weights
      .map((w, i) => ({ weight: w, ticker: tickers[i] }))
      .filter(d => d.weight >= 0.001);

    return (
      <div className="bg-white rounded-xl shadow-md p-4 w-full" style={{ height: '400px' }}>
        <Plot
          data={[
            {
              values: filteredData.map(d => d.weight),
              labels: filteredData.map(d => d.ticker),
              type: 'pie',
              hole: 0.5,
              marker: { colors: COLORS },
              textinfo: 'label+percent',
              hoverinfo: 'label+value+percent'
            }
          ]}
          layout={{
            title: title,
            margin: { t: 50, r: 20, b: 20, l: 20 },
            autosize: true,
            showlegend: true
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            toImageButtonOptions: { format: 'png', filename: 'allocacion', width: 800, height: 600 }
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderChart('Portafolio Tangente (Máx. Sharpe)', maxSharpePortfolio)}
      {renderChart('Portafolio de Mínima Varianza', minVarPortfolio)}
    </div>
  );
}
