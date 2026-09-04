import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-xl font-bold">Optimizador de Portafolios</h1>
          </div>
          <div className="text-indigo-200 text-sm font-medium">Teoría de Markowitz</div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Optimización de Portafolios — Markowitz © 2025
        </div>
      </footer>
    </div>
  );
}
