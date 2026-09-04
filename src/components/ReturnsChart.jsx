import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'];

export default function ReturnsChart({ dates, cumulativeReturns, tickers }) {
  if (!dates || !cumulativeReturns || !tickers || tickers.length === 0) return null;

  const traces = tickers.map((ticker, i) => ({
    x: dates,
    y: cumulativeReturns[ticker] || [],
    type: 'scatter',
    mode: 'lines',
    name: ticker,
    line: { color: COLORS[i % COLORS.length] }
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-4" style={{ width: '100%', height: '400px' }}>
      <Plot
        data={traces}
        layout={{
          title: 'Retornos Acumulados',
          xaxis: { title: 'Fecha', type: 'date' },
          yaxis: { title: 'Retorno Acumulado', tickformat: '.1%' },
          showlegend: true,
          plot_bgcolor: '#fafafa',
          paper_bgcolor: 'white',
          hovermode: 'x unified',
          margin: { t: 50, r: 30, b: 50, l: 60 },
          autosize: true
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
