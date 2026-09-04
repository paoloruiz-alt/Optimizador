import qp from 'quadprog';

export function findMinVariancePortfolio(covMatrix, annualizedReturns) {
  const n = annualizedReturns.length;
  
  const Dmat = covMatrix.map(row => [...row]);
  for (let i = 0; i < n; i++) {
    Dmat[i][i] += 1e-10;
  }
  
  const dvec = new Array(n).fill(0);
  
  const Amat = [];
  for (let i = 0; i < n; i++) {
    const row = [1];
    for (let j = 0; j < n; j++) {
      row.push(i === j ? 1 : 0);
    }
    Amat.push(row);
  }
  
  const bvec = [1, ...new Array(n).fill(0)];
  const meq = 1;
  
  try {
    const res = qp.solveQP(Dmat, dvec, Amat, bvec, meq);
    const weights = res.solution.map(w => w < 1e-7 ? 0 : w);
    
    const sumW = weights.reduce((a,b)=>a+b,0);
    const normalized = weights.map(w => w / sumW);
    
    const { return: ret, risk, sharpe } = computePortfolioMetrics(normalized, covMatrix, annualizedReturns, 0);
    
    return { weights: normalized, return: ret, risk, sharpe: 0 };
  } catch (err) {
    console.error("Solver failed", err);
    throw err;
  }
}

export function findMaxSharpePortfolio(covMatrix, annualizedReturns, riskFreeRate) {
  const n = annualizedReturns.length;
  const excessReturns = annualizedReturns.map(r => r - riskFreeRate);
  
  if (excessReturns.every(r => r <= 0)) {
    return findMinVariancePortfolio(covMatrix, annualizedReturns);
  }
  
  const Dmat = covMatrix.map(row => [...row]);
  for (let i = 0; i < n; i++) {
    Dmat[i][i] += 1e-10;
  }
  
  const dvec = new Array(n).fill(0);
  
  const Amat = [];
  for (let i = 0; i < n; i++) {
    const row = [excessReturns[i]];
    for (let j = 0; j < n; j++) {
      row.push(i === j ? 1 : 0);
    }
    Amat.push(row);
  }
  
  const bvec = [1, ...new Array(n).fill(0)];
  const meq = 1;
  
  try {
    const res = qp.solveQP(Dmat, dvec, Amat, bvec, meq);
    let weights = res.solution;
    const sumW = weights.reduce((a, b) => a + b, 0);
    weights = weights.map(w => w / sumW);
    weights = weights.map(w => w < 1e-7 ? 0 : w);
    
    const finalSum = weights.reduce((a,b)=>a+b,0);
    weights = weights.map(w => w / finalSum);
    
    return { weights, ...computePortfolioMetrics(weights, covMatrix, annualizedReturns, riskFreeRate) };
  } catch (e) {
    console.error("Max Sharpe failed, returning Min Variance", e);
    return findMinVariancePortfolio(covMatrix, annualizedReturns);
  }
}

export function generateEfficientFrontier(covMatrix, annualizedReturns, riskFreeRate, numPoints = 100) {
  const n = annualizedReturns.length;
  const minVar = findMinVariancePortfolio(covMatrix, annualizedReturns);
  const minRet = minVar.return;
  const maxRet = Math.max(...annualizedReturns);
  
  const frontier = [];
  
  for (let i = 0; i < numPoints; i++) {
    const targetReturn = minRet + (maxRet - minRet) * (i / (numPoints - 1));
    
    const Dmat = covMatrix.map(row => [...row]);
    for (let j = 0; j < n; j++) {
      Dmat[j][j] += 1e-10;
    }
    
    const dvec = new Array(n).fill(0);
    
    const Amat = [];
    for (let j = 0; j < n; j++) {
      const row = [1, annualizedReturns[j]];
      for (let k = 0; k < n; k++) {
        row.push(j === k ? 1 : 0);
      }
      Amat.push(row);
    }
    
    const bvec = [1, targetReturn, ...new Array(n).fill(0)];
    const meq = 2;
    
    try {
      const res = qp.solveQP(Dmat, dvec, Amat, bvec, meq);
      let weights = res.solution.map(w => w < 1e-7 ? 0 : w);
      
      const sumW = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / sumW);
      
      frontier.push({ weights, ...computePortfolioMetrics(weights, covMatrix, annualizedReturns, riskFreeRate) });
    } catch (e) {
      // Skip infeasible
    }
  }
  
  return frontier;
}

export function computePortfolioMetrics(weights, covMatrix, annualizedReturns, riskFreeRate) {
  const n = weights.length;
  let ret = 0;
  for (let i = 0; i < n; i++) {
    ret += weights[i] * annualizedReturns[i];
  }
  
  let varRisk = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      varRisk += weights[i] * covMatrix[i][j] * weights[j];
    }
  }
  
  const risk = Math.sqrt(varRisk);
  const sharpe = risk > 0 ? (ret - riskFreeRate) / risk : 0;
  
  return { return: ret, risk, sharpe };
}
