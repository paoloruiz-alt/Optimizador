export const handler = async (event) => {
  try {
    const { symbols, period1, period2 } = event.queryStringParameters || {};
    
    if (!symbols || !period1 || !period2) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: symbols, period1, period2' })
      };
    }

    const tickers = symbols.split(',').map(s => s.trim());
    const data = {};

    for (const symbol of tickers) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=div,splits`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          return { statusCode: 429, body: JSON.stringify({ error: 'Rate limit exceeded' }) };
        }
        return { statusCode: response.status, body: JSON.stringify({ error: `Failed to fetch data for ${symbol}` }) };
      }

      const json = await response.json();
      
      if (!json.chart.result || json.chart.result.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: `No data found for ${symbol}` }) };
      }

      const result = json.chart.result[0];
      const rawTimestamps = result.timestamp || [];
      const dates = rawTimestamps.map(ts => new Date(ts * 1000).toISOString().split('T')[0]);
      const adjClose = (result.indicators && result.indicators.adjclose && result.indicators.adjclose[0].adjclose) ? result.indicators.adjclose[0].adjclose : [];

      data[symbol] = {
        dates,
        adjClose
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};
