import React, { useState } from 'react';
import Layout from './components/Layout';
import TickerInput from './components/TickerInput';
import KPICards from './components/KPICards';
import EfficientFrontierChart from './components/EfficientFrontierChart';
import AllocationChart from './components/AllocationChart';
import ReturnsChart from './components/ReturnsChart';
import CovarianceHeatmap from './components/CovarianceHeatmap';
import ExportButtons from './components/ExportButtons';
import { fetchFromYahoo, parseUploadedFile, alignData } from './modules/dataIngestion';
import { calculateSimpleReturns, calculateCumulativeReturns, calculateStats } from './modules/dataProcessing';
import { findMinVariancePortfolio, findMaxSharpePortfolio, generateEfficientFrontier } from './modules/optimization';
import { exportToXLSX } from './utils/exportUtils';

export default function App() {
  const [tickerString, setTickerString] = useState('AAPL, MSFT, GOOGL, AMZN, TSLA');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2025-01-01');
  const [riskFreeRate, setRiskFreeRate] = useState(5.0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [priceData, setPriceData] = useState(null);
  const [tickers, setTickers] = useState([]);
  const [stats, setStats] = useState(null);
  const [cumulativeReturns, setCumulativeReturns] = useState(null);
  
  const [minVarPortfolio, setMinVarPortfolio] = useState(null);
  const [maxSharpePortfolio, setMaxSharpePortfolio] = useState(null);
  const [frontierData, setFrontierData] = useState(null);

  const processData = (aligned, parsedTickers) => {
    setPriceData(aligned);
    setTickers(parsedTickers);
    
    const simpleRets = calculateSimpleReturns(aligned.prices);
    setCumulativeReturns(calculateCumulativeReturns(simpleRets));
    
    const computedStats = calculateStats(simpleRets);
    setStats(computedStats);
    
    // Reset optimization when new data loads
    setMinVarPortfolio(null);
    setMaxSharpePortfolio(null);
    setFrontierData(null);
  };

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    const parsedTickers = tickerString.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    
    try {
      const rawData = await fetchFromYahoo(parsedTickers, new Date(startDate), new Date(endDate));
      const aligned = alignData(rawData);
      
      if (aligned.dates.length < 3) {
        throw new Error('No se encontraron suficientes datos. Verifica los tickers y el rango de fechas.');
      }
      
      processData(aligned, parsedTickers);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error al obtener datos de Yahoo Finance');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await parseUploadedFile(file);
      const aligned = alignData(rawData);
      const parsedTickers = Object.keys(aligned.prices);
      
      if (aligned.dates.length < 3) {
        throw new Error('El archivo no contiene suficientes datos (mínimo 3 filas).');
      }
      
      setTickerString(parsedTickers.join(', '));
      processData(aligned, parsedTickers);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.message || 'Error al procesar el archivo. Verifica el formato (primera columna: fechas, demás columnas: precios por ticker).');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = () => {
    if (!stats) return;
    setError(null);
    try {
      const rf = riskFreeRate / 100;
      
      const minVar = findMinVariancePortfolio(stats.covMatrix, stats.annualizedReturns);
      minVar.sharpe = minVar.risk > 0 ? (minVar.return - rf) / minVar.risk : 0;
      setMinVarPortfolio(minVar);
      
      const maxSharpe = findMaxSharpePortfolio(stats.covMatrix, stats.annualizedReturns, rf);
      setMaxSharpePortfolio(maxSharpe);
      
      const frontier = generateEfficientFrontier(stats.covMatrix, stats.annualizedReturns, rf, 100);
      setFrontierData(frontier);
      
    } catch (err) {
      console.error('Optimization error:', err);
      setError('Error durante la optimización: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleExportXLSX = () => {
    if (priceData) {
      exportToXLSX(priceData.dates, priceData.prices, tickers);
    }
  };

  const handleExportFrontierPNG = () => {
    alert('Use el botón de cámara (📷) en la barra superior de cada gráfica para exportar como PNG.');
  };

  let individualAssets = [];
  if (stats && tickers.length > 0) {
    individualAssets = tickers.map((ticker, i) => ({
      risk: stats.annualizedVols[i],
      return: stats.annualizedReturns[i],
      ticker
    }));
  }

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-lg ml-4">&times;</button>
        </div>
      )}
      
      <TickerInput
        tickers={tickerString}
        setTickers={setTickerString}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        riskFreeRate={riskFreeRate}
        setRiskFreeRate={setRiskFreeRate}
        onFetchData={handleFetchData}
        onOptimize={handleOptimize}
        loading={loading}
        hasData={!!priceData}
        onFileUpload={handleFileUpload}
      />
      
      {(minVarPortfolio || maxSharpePortfolio) && (
        <div className="mt-6">
          <KPICards minVarPortfolio={minVarPortfolio} maxSharpePortfolio={maxSharpePortfolio} />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        {frontierData && frontierData.length > 0 && (
          <EfficientFrontierChart
            frontierData={frontierData}
            minVarPortfolio={minVarPortfolio}
            maxSharpePortfolio={maxSharpePortfolio}
            individualAssets={individualAssets}
            tickers={tickers}
          />
        )}
        
        {(minVarPortfolio || maxSharpePortfolio) && (
          <AllocationChart
            minVarPortfolio={minVarPortfolio}
            maxSharpePortfolio={maxSharpePortfolio}
            tickers={tickers}
          />
        )}
        
        {cumulativeReturns && priceData && (
          <ReturnsChart
            dates={priceData.dates.slice(1)}
            cumulativeReturns={cumulativeReturns}
            tickers={tickers}
          />
        )}
        
        {stats && (
          <CovarianceHeatmap
            corrMatrix={stats.corrMatrix}
            tickers={tickers}
          />
        )}
      </div>
      
      {priceData && (
        <ExportButtons
          dates={priceData.dates}
          onExportXLSX={handleExportXLSX}
          onExportFrontierPNG={handleExportFrontierPNG}
        />
      )}
    </Layout>
  );
}
