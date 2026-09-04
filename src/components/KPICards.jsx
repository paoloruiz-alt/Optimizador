import React from 'react';

export default function KPICards({ minVarPortfolio, maxSharpePortfolio }) {
  if (!minVarPortfolio && !maxSharpePortfolio) return null;

  const formatPct = (val) => (val * 100).toFixed(2) + '%';
  const formatNum = (val) => (val || 0).toFixed(3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {maxSharpePortfolio && (
        <>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
            <div className="text-sm text-gray-500 mb-1">Retorno Esperado (Tangente)</div>
            <div className="text-2xl font-bold text-indigo-600">{formatPct(maxSharpePortfolio.return)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
            <div className="text-sm text-gray-500 mb-1">Volatilidad (Tangente)</div>
            <div className="text-2xl font-bold text-indigo-600">{formatPct(maxSharpePortfolio.risk)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
            <div className="text-sm text-gray-500 mb-1">Sharpe Ratio (Tangente)</div>
            <div className="text-2xl font-bold text-indigo-600">{formatNum(maxSharpePortfolio.sharpe)}</div>
          </div>
        </>
      )}
      
      {minVarPortfolio && (
        <>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
            <div className="text-sm text-gray-500 mb-1">Retorno Esperado (Mín. Varianza)</div>
            <div className="text-2xl font-bold text-emerald-600">{formatPct(minVarPortfolio.return)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
            <div className="text-sm text-gray-500 mb-1">Volatilidad (Mín. Varianza)</div>
            <div className="text-2xl font-bold text-emerald-600">{formatPct(minVarPortfolio.risk)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
            <div className="text-sm text-gray-500 mb-1">Sharpe Ratio (Mín. Varianza)</div>
            <div className="text-2xl font-bold text-emerald-600">{formatNum(minVarPortfolio.sharpe)}</div>
          </div>
        </>
      )}
    </div>
  );
}
