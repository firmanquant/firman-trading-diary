// File: src/SignalDashboard.js
import React from 'react';

const SignalDashboard = ({ signal = {}, groqAnalysis = '' }) => {
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
  } = signal;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">📊 Dashboard Mini</h2>
      <div className="dashboard-rows">
        <div className="dashboard-cell">
          <p><strong>Sinyal:</strong> {buySignal ? 'BELI ✅' : sellSignal ? 'JUAL ❌' : 'TIDAK ADA'}</p>
          <p><strong>MACD:</strong> {macdTrend}</p>
          <p><strong>ADX:</strong> {adx}</p>
          <p><strong>4H MACD:</strong> {macd4HTrend}</p>
        </div>
        <div className="dashboard-cell">
          <p><strong>EMA Trend:</strong> {trendEMA}</p>
          <p><strong>DI+/DI-:</strong> {diTrend}</p>
          <p><strong>ATR:</strong> {atrPct}</p>
        </div>
        <div className="dashboard-cell">
          <p><strong>RSI:</strong> {rsi}</p>
          <p><strong>Trend 1W:</strong> {trend1W}</p>
          <p><strong>Kalman Diff:</strong> {kalmanDiff}</p>
        </div>
      </div>
      <div className="groq-analysis">
        <strong>Analisis Groq:</strong>
        <p>{groqAnalysis || 'Gagal memuat analisis.'}</p>
      </div>
    </div>
  );
};

export default SignalDashboard;
