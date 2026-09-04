import React from 'react';

export default function ExportButtons({ dates, onExportXLSX, onExportFrontierPNG }) {
  if (!dates) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📥 Exportar Datos</h2>
      <div className="flex gap-3">
        <button
          onClick={onExportXLSX}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Exportar Precios (.xlsx)
        </button>
        <button
          onClick={onExportFrontierPNG}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Exportar Frontera (.png)
        </button>
      </div>
    </div>
  );
}
