import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

export function exportToXLSX(dates, prices, tickers, filename = 'precios_cierre_ajustado.xlsx') {
  const data = [['Fecha', ...tickers]];
  
  for (let i = 0; i < dates.length; i++) {
    const row = [dates[i]];
    for (const ticker of tickers) {
      row.push(prices[ticker][i]);
    }
    data.push(row);
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Precios');
  
  XLSX.writeFile(workbook, filename);
}

export function exportChartToPNG(plotlyRef, filename = 'grafica.png') {
  Plotly.downloadImage(plotlyRef, { format: 'png', width: 1200, height: 800, filename });
}
