import * as XLSX from 'xlsx';

export async function fetchFromYahoo(tickers, startDate, endDate) {
  const p1 = Math.floor(startDate.getTime() / 1000);
  const p2 = Math.floor(endDate.getTime() / 1000);
  const symbols = tickers.join(',');

  const url = `/.netlify/functions/yahoo-proxy?symbols=${encodeURIComponent(symbols)}&period1=${p1}&period2=${p2}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch from Yahoo Proxy: ${errorData.error || response.statusText}`);
  }

  const { data } = await response.json();
  
  const prices = {};
  let dates = [];
  
  if (tickers.length > 0 && data[tickers[0]]) {
     dates = data[tickers[0]].dates;
  }

  for (const ticker of tickers) {
    if (data[ticker]) {
      prices[ticker] = data[ticker].adjClose;
    } else {
      prices[ticker] = [];
    }
  }

  return { dates, prices };
}

export function parseUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('File does not contain enough data.');
        }

        const headers = jsonData[0];
        const dates = [];
        const prices = {};
        
        const tickers = headers.slice(1);
        tickers.forEach(t => {
          prices[t] = [];
        });

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue;
          
          dates.push(row[0]);
          tickers.forEach((t, idx) => {
            prices[t].push(row[idx + 1]);
          });
        }

        resolve({ dates, prices });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function alignData(rawData) {
  const { dates, prices } = rawData;
  const tickers = Object.keys(prices);
  
  const combined = dates.map((date, i) => {
    const row = { date };
    tickers.forEach(t => {
      row[t] = prices[t][i];
    });
    return row;
  });

  const validRows = combined.filter(row => {
    return tickers.every(t => row[t] !== null && row[t] !== undefined && !isNaN(row[t]));
  });
  
  validRows.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || Number(a.date);
    const timeB = new Date(b.date).getTime() || Number(b.date);
    return timeA - timeB;
  });

  const alignedDates = [];
  const alignedPrices = {};
  tickers.forEach(t => { alignedPrices[t] = []; });

  validRows.forEach(row => {
    alignedDates.push(row.date);
    tickers.forEach(t => {
      alignedPrices[t].push(row[t]);
    });
  });

  return { dates: alignedDates, prices: alignedPrices };
}
