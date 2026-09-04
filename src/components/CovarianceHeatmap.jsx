import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export default function CovarianceHeatmap({ corrMatrix, tickers }) {
  if (!corrMatrix || !tickers) return null;

  const annotations = [];
  for (let i = 0; i < corrMatrix.length; i++) {
    for (let j = 0; j < corrMatrix[i].length; j++) {
      annotations.push({
        x: tickers[j],
        y: tickers[i],
        text: corrMatrix[i][j].toFixed(2),
        font: { color: Math.abs(corrMatrix[i][j]) > 0.5 ? 'white' : 'black' },
        showarrow: false
      });
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4" style={{ width: '100%', height: '500px' }}>
      <Plot
        data={[
          {
            z: corrMatrix,
            x: tickers,
            y: tickers,
            type: 'heatmap',
            colorscale: 'RdYlBu',
            zmin: -1,
            zmax: 1,
            hoverinfo: 'text',
            text: corrMatrix.map(row => row.map(val => val.toFixed(2)))
          }
        ]}
        layout={{
          title: 'Matriz de Correlaciones',
          annotations: annotations,
          margin: { t: 50, r: 50, b: 50, l: 50 },
          autosize: true,
          yaxis: { autorange: 'reversed' }
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
