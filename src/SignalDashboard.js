// SignalDashboard.js (FINAL)
import React from 'react';

const SignalDashboard = ({
  ema20, ema50, ema20Prev, ema50Prev,
  ema20_1W, ema50_1W,
  rsi, macdLine, signalLine,
  macdLine_4H, signalLine_4H,
  plusDI, minusDI, adx, atrPct,
  kalman, close, groqAnalysis
}) => {
  const isBullish = macdLine > signalLine;
  const isBullish4H = macdLine_4H > signalLine_4H;
  const emaTrend = ema20 > ema50 && ema20Prev > ema50Prev ? 'Uptrend' : 'Downtrend';
  const trend1W = ema20_1W > ema50_1W ? 'Bullish' : 'Bearish';
  const diTrend = plusDI > minusDI ? '+DI Dominan' : '-DI Dominan';
  const atrLabel = atrPct > 3 ? 'Volatile' : 'Normal';

  const signal = (
    emaTrend === 'Uptrend' &&
    isBullish &&
    isBullish4H &&
    plusDI > minusDI
  ) ? 'BELI ✅' : 'TIDAK ADA';

  return (
    <div className="analysis-layout">
      {/* Dashboard Mini */}
      <div className="dashboard-box">
        <h3>📊 Dashboard Mini</h3>
        <div className="dashboard-grid">
          <div><strong>Sinyal:</strong> {signal}</div>
          <div><strong>MACD:</strong> {isBullish ? 'Bullish 🟢' : 'Bearish 🔴'}</div>
          <div><strong>ADX:</strong> {adx}</div>
          <div><strong>4H MACD:</strong> {isBullish4H ? 'Bullish 🟢' : 'Bearish 🔴'}</div>
          <div><strong>EMA Trend:</strong> {emaTrend}</div>
          <div><strong>DI+/DI-:</strong> {diTrend}</div>
          <div><strong>ATR:</strong> {atrPct ? `${atrPct}% ${atrLabel}` : 'N/A'}</div>
          <div><strong>RSI:</strong> {rsi || 'N/A'}</div>
          <div><strong>Trend 1W:</strong> {trend1W}</div>
          <div><strong>Kalman Diff:</strong> {kalman || 'N/A'}</div>
        </div>
      </div>

      {/* Analisis Groq */}
      <div className="groq-box">
        <h3>🧠 Analisis Groq</h3>
        <p>{groqAnalysis || 'Gagal memuat analisis.'}</p>
      </div>
    </div>
  );
};

export default SignalDashboard;
