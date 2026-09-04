import { mean, stdDev, zeros } from '../utils/mathHelpers.js';

export function calculateSimpleReturns(prices) {
  const returns = {};
  const tickers = Object.keys(prices);

  for (const ticker of tickers) {
    const priceArr = prices[ticker];
    returns[ticker] = [];
    for (let i = 1; i < priceArr.length; i++) {
      returns[ticker].push((priceArr[i] / priceArr[i - 1]) - 1);
    }
  }
  return returns;
}

export function calculateCumulativeReturns(returns) {
  const cumReturns = {};
  const tickers = Object.keys(returns);

  for (const ticker of tickers) {
    const retArr = returns[ticker];
    cumReturns[ticker] = [];
    let product = 1;
    for (let i = 0; i < retArr.length; i++) {
      product *= (1 + retArr[i]);
      cumReturns[ticker].push(product - 1);
    }
  }
  return cumReturns;
}

export function calculateStats(returns, tradingDays = 252) {
  const tickers = Object.keys(returns);
  const n = tickers.length;
  
  if (n === 0) {
    return { tickers: [], annualizedReturns: [], annualizedVols: [], covMatrix: [], corrMatrix: [] };
  }

  const T = returns[tickers[0]].length;
  
  const annualizedReturns = [];
  const annualizedVols = [];
  const means = [];

  for (const ticker of tickers) {
    const dMean = mean(returns[ticker]);
    const dStd = stdDev(returns[ticker]);
    means.push(dMean);
    annualizedReturns.push(dMean * tradingDays);
    annualizedVols.push(dStd * Math.sqrt(tradingDays));
  }

  const returnsMatrix = [];
  for (let t = 0; t < T; t++) {
    const row = [];
    for (const ticker of tickers) {
      row.push(returns[ticker][t]);
    }
    returnsMatrix.push(row);
  }

  const covMatrix = zeros(n, n);
  const corrMatrix = zeros(n, n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let t = 0; t < T; t++) {
        sum += (returnsMatrix[t][i] - means[i]) * (returnsMatrix[t][j] - means[j]);
      }
      const cov = (T > 1) ? sum / (T - 1) : 0;
      covMatrix[i][j] = cov * tradingDays;
      
      const volProduct = annualizedVols[i] * annualizedVols[j];
      corrMatrix[i][j] = volProduct === 0 ? 0 : covMatrix[i][j] / volProduct;
    }
  }

  return {
    tickers,
    annualizedReturns,
    annualizedVols,
    covMatrix,
    corrMatrix
  };
}
