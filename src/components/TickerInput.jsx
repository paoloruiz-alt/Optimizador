import React from 'react';

export default function TickerInput({
  tickers, setTickers,
  startDate, setStartDate,
  endDate, setEndDate,
  riskFreeRate, setRiskFreeRate,
  onFetchData, onOptimize,
  loading, hasData, onFileUpload
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Configuración del Portafolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activos (Tickers)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={tickers}
            onChange={(e) => setTickers(e.target.value)}
            placeholder="AAPL, MSFT, GOOGL, AMZN, TSLA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tasa Libre de Riesgo (% anual)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="20"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={riskFreeRate}
            onChange={(e) => setRiskFreeRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={onFetchData}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Cargando...' : 'Cargar Datos'}
        </button>
        <button
          onClick={onOptimize}
          disabled={!hasData || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
        >
          Optimizar Portafolio
        </button>
        <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors border border-gray-300">
          📁 Importar Archivo
          <input
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
