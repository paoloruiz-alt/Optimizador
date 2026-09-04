// Generate sample stock price CSV for testing
const fs = require('fs');

const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
const startPrices = { AAPL: 125.07, MSFT: 239.58, GOOGL: 89.70, AMZN: 85.46, TSLA: 108.10 };
const annualVols = { AAPL: 0.25, MSFT: 0.28, GOOGL: 0.30, AMZN: 0.35, TSLA: 0.55 };
const annualDrifts = { AAPL: 0.15, MSFT: 0.20, GOOGL: 0.12, AMZN: 0.18, TSLA: 0.05 };

function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const rows = [['Fecha', ...tickers].join(',')];
const prices = { ...startPrices };
const tradingDays = 504; // ~2 years

let date = new Date('2023-01-03');
for (let d = 0; d < tradingDays; d++) {
  // Skip weekends
  while (date.getDay() === 0 || date.getDay() === 6) {
    date = new Date(date.getTime() + 86400000);
  }
  
  const dateStr = date.toISOString().split('T')[0];
  const row = [dateStr];
  
  for (const t of tickers) {
    if (d > 0) {
      const dailyDrift = annualDrifts[t] / 252;
      const dailyVol = annualVols[t] / Math.sqrt(252);
      const ret = dailyDrift + dailyVol * normalRandom();
      prices[t] = prices[t] * (1 + ret);
    }
    row.push(prices[t].toFixed(2));
  }
  
  rows.push(row.join(','));
  date = new Date(date.getTime() + 86400000);
}

fs.writeFileSync('datos_ejemplo.csv', rows.join('\n'), 'utf8');
console.log(`CSV generado: ${tradingDays} dias de trading, ${tickers.length} activos`);
