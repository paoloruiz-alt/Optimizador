export function transpose(matrix) {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function multiply(A, B) {
  if (A.length === 0 || B.length === 0) return [];
  const result = new Array(A.length).fill(0).map(() => new Array(B[0].length).fill(0));
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

export function multiplyVectorMatrix(v, M) {
  if (v.length === 0 || M.length === 0) return [];
  const result = new Array(M[0].length).fill(0);
  for (let j = 0; j < M[0].length; j++) {
    for (let k = 0; k < v.length; k++) {
      result[j] += v[k] * M[k][j];
    }
  }
  return result;
}

export function multiplyMatrixVector(M, v) {
  if (M.length === 0 || v.length === 0) return [];
  const result = new Array(M.length).fill(0);
  for (let i = 0; i < M.length; i++) {
    for (let k = 0; k < v.length; k++) {
      result[i] += M[i][k] * v[k];
    }
  }
  return result;
}

export function dotProduct(a, b) {
  if (a.length !== b.length) throw new Error("Vectors must be of same length");
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

export function scalarMultiply(scalar, matrix) {
  return matrix.map(row => row.map(val => val * scalar));
}

export function zeros(rows, cols) {
  return new Array(rows).fill(0).map(() => new Array(cols).fill(0));
}

export function identity(n) {
  const result = zeros(n, n);
  for (let i = 0; i < n; i++) {
    result[i][i] = 1;
  }
  return result;
}

export function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

export function mean(arr) {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

export function stdDev(arr) {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}
