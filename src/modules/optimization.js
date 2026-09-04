import qp from 'quadprog';

// ─── Helpers numéricos ────────────────────────────────────────────────────────

/**
 * Añade regularización de Tikhonov a la diagonal para garantizar PD.
 * Usa un valor adaptativo: max(1e-8, 1e-6 * maxDiag).
 */
function regularize(covMatrix) {
  const n = covMatrix.length;
  const D = covMatrix.map(row => [...row]);
  const maxDiag = Math.max(...D.map((_, i) => Math.abs(D[i][i])));
  const eps = Math.max(1e-8, 1e-6 * maxDiag);
  for (let i = 0; i < n; i++) D[i][i] += eps;
  return D;
}

/** Dot product w^T * Sigma * w */
function quadForm(w, M) {
  const n = w.length;
  let val = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      val += w[i] * M[i][j] * w[j];
  return val;
}

/** Limpia pesos: clampea valores pequeños negativos/zero a 0 y renormaliza */
function cleanWeights(raw) {
  const threshold = 1e-6;
  const clamped = raw.map(w => (w < threshold ? 0 : w));
  const s = clamped.reduce((a, b) => a + b, 0);
  if (s <= 0 || !isFinite(s)) return null;
  return clamped.map(w => w / s);
}

/** Verifica si un array contiene NaN o Infinity */
function isValid(arr) {
  return Array.isArray(arr) && arr.every(v => isFinite(v));
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

export function computePortfolioMetrics(weights, covMatrix, annualizedReturns, riskFreeRate) {
  if (!isValid(weights) || !isValid(annualizedReturns)) {
    return { return: NaN, risk: NaN, sharpe: NaN };
  }
  const ret = weights.reduce((s, w, i) => s + w * annualizedReturns[i], 0);
  const variance = quadForm(weights, covMatrix);
  const risk = variance >= 0 ? Math.sqrt(variance) : NaN;
  const sharpe = (isFinite(risk) && risk > 0) ? (ret - riskFreeRate) / risk : 0;
  return { return: ret, risk, sharpe };
}

// ─── Solver central ───────────────────────────────────────────────────────────
/**
 * Resuelve un QP con quadprog y devuelve pesos limpios o null si falla.
 *
 * Convención quadprog JS (igual que R):
 *   min 0.5 x^T Dmat x - dvec^T x
 *   s.t. Amat^T x >= bvec  (primeras meq son igualdad)
 *
 * Amat es n×m: Amat[variable][constraint]
 */
function solveQP(Dmat, dvec, Amat, bvec, meq) {
  try {
    const result = qp.solveQP(Dmat, dvec, Amat, bvec, meq);
    if (!result || !result.solution) return null;
    if (!isValid(result.solution)) return null;
    return cleanWeights(result.solution);
  } catch {
    return null;
  }
}

/** Construye Amat n×(1+n): columna 0 = suma=1, columnas 1..n = identidad (w≥0) */
function buildStdAmat(n) {
  // Amat[i][j]: i=variable, j=constraint
  return Array.from({ length: n }, (_, i) => [
    1,                                    // col 0: sum(w)=1
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)) // cols 1..n: w_i≥0
  ]);
}

// ─── Portafolio de Mínima Varianza ───────────────────────────────────────────

export function findMinVariancePortfolio(covMatrix, annualizedReturns) {
  const n = annualizedReturns.length;
  if (n === 0) throw new Error('Sin activos');

  // Caso trivial
  if (n === 1) {
    const w = [1];
    return { weights: w, ...computePortfolioMetrics(w, covMatrix, annualizedReturns, 0), sharpe: 0 };
  }

  const Dmat = regularize(covMatrix);
  const dvec = new Array(n).fill(0);
  const Amat = buildStdAmat(n);
  const bvec = [1, ...new Array(n).fill(0)];

  let weights = solveQP(Dmat, dvec, Amat, bvec, 1);

  // Fallback: igual ponderación si el solver falla
  if (!weights) {
    console.warn('Min-Var solver failed, using equal weights fallback');
    weights = new Array(n).fill(1 / n);
  }

  const metrics = computePortfolioMetrics(weights, covMatrix, annualizedReturns, 0);
  return { weights, ...metrics, sharpe: 0 };
}

// ─── Portafolio Tangente (Máximo Sharpe) ─────────────────────────────────────

export function findMaxSharpePortfolio(covMatrix, annualizedReturns, riskFreeRate) {
  const n = annualizedReturns.length;
  if (n === 0) throw new Error('Sin activos');

  const rf = isFinite(riskFreeRate) ? riskFreeRate : 0;
  const excessReturns = annualizedReturns.map(r => r - rf);
  const maxExcess = Math.max(...excessReturns);

  // Si todos los excesos son ≤ 0, usar mínima varianza
  if (maxExcess <= 0) {
    const mvp = findMinVariancePortfolio(covMatrix, annualizedReturns);
    return { ...mvp, sharpe: computePortfolioMetrics(mvp.weights, covMatrix, annualizedReturns, rf).sharpe };
  }

  const Dmat = regularize(covMatrix);
  const dvec = new Array(n).fill(0);

  // Amat[i][0] = excessReturn[i]  (restricción: excess^T y = 1)
  // Amat[i][1..n] = identidad     (restricción: y_i ≥ 0)
  const Amat = Array.from({ length: n }, (_, i) => [
    excessReturns[i],
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);
  const bvec = [1, ...new Array(n).fill(0)];

  let weights = solveQP(Dmat, dvec, Amat, bvec, 1);

  if (!weights) {
    // Fallback: portafolio 100% en el activo con mayor Sharpe individual
    console.warn('Max-Sharpe solver failed, using best-single-asset fallback');
    const bestIdx = annualizedReturns.reduce((best, r, i) => {
      const sigma = Math.sqrt(covMatrix[i][i]);
      const s = sigma > 0 ? (r - rf) / sigma : -Infinity;
      const bestSharpe = Math.sqrt(covMatrix[best][best]) > 0
        ? (annualizedReturns[best] - rf) / Math.sqrt(covMatrix[best][best])
        : -Infinity;
      return s > bestSharpe ? i : best;
    }, 0);
    weights = new Array(n).fill(0);
    weights[bestIdx] = 1;
  }

  const metrics = computePortfolioMetrics(weights, covMatrix, annualizedReturns, rf);
  return { weights, ...metrics };
}

// ─── Frontera Eficiente ───────────────────────────────────────────────────────

export function generateEfficientFrontier(covMatrix, annualizedReturns, riskFreeRate, numPoints = 80) {
  const n = annualizedReturns.length;
  if (n === 0) return [];

  const mvp = findMinVariancePortfolio(covMatrix, annualizedReturns);
  const minRet = mvp.return;
  const maxRet = Math.max(...annualizedReturns);

  if (!isFinite(minRet) || !isFinite(maxRet) || maxRet <= minRet) {
    // Devolver al menos el punto de mínima varianza
    return [{ weights: mvp.weights, ...computePortfolioMetrics(mvp.weights, covMatrix, annualizedReturns, riskFreeRate) }];
  }

  const frontier = [];
  const Dmat = regularize(covMatrix);
  const dvec = new Array(n).fill(0);

  for (let i = 0; i < numPoints; i++) {
    // Retorno objetivo: de minRet a maxRet
    const t = i / (numPoints - 1);
    const targetReturn = minRet + (maxRet - minRet) * t;

    // Amat[var][constraint]:
    //   col 0: sum(w) = 1
    //   col 1: returns^T w = targetReturn
    //   cols 2..n+1: w_i ≥ 0
    const Amat = Array.from({ length: n }, (_, idx) => [
      1,
      annualizedReturns[idx],
      ...Array.from({ length: n }, (_, j) => (idx === j ? 1 : 0))
    ]);
    const bvec = [1, targetReturn, ...new Array(n).fill(0)];

    const weights = solveQP(Dmat, dvec, Amat, bvec, 2);
    if (weights) {
      const metrics = computePortfolioMetrics(weights, covMatrix, annualizedReturns, riskFreeRate);
      if (isFinite(metrics.return) && isFinite(metrics.risk)) {
        frontier.push({ weights, ...metrics });
      }
    }
  }

  // Si la frontera quedó vacía, devolver al menos MVP y mejor Sharpe
  if (frontier.length === 0) {
    console.warn('Frontier empty, returning key portfolios only');
    const mvpMetrics = computePortfolioMetrics(mvp.weights, covMatrix, annualizedReturns, riskFreeRate);
    frontier.push({ weights: mvp.weights, ...mvpMetrics });
  }

  return frontier;
}

