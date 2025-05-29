import React, { useEffect, useState } from 'react';

const SignalDashboard = ({ signal }) => {
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const {
    rsi,
    macdTrend,
    diTrend,
    trend1W,
    trendEMA,
    atrPct,
    adx,
    kalmanDiff,
    macd4HTrend,
    buySignal,
    sellSignal,
    symbol
  } = signal || {};

  useEffect(() => {
    const fetchGroqAnalysis = async () => {
      try {
        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Buat analisis singkat berdasarkan data berikut:\n
Symbol: ${symbol}\n
RSI: ${rsi}\nMACD: ${macdTrend}\nTrend EMA: ${trendEMA}\nTrend 1W: ${trend1W}\nATR: ${atrPct}\nADX: ${adx}\nDI+/DI-: ${diTrend}\nKalman Diff: ${kalmanDiff}\nMACD 4H: ${macd4HTrend}`
          })
        });

        const data = await response.json();
        setGroqAnalysis(data.response || 'Gagal memuat analisis.');
      } catch (err) {
        setGroqAnalysis('Gagal memuat analisis.');
      }
    };

    if (symbol) fetchGroqAnalysis();
  }, [symbol]);

  return (
    <div className="dashboard">
      <h2>
