// File: src/SignalDashboard.js

import React from 'react';

const SignalDashboard = ({
  ema20,
  ema50,
  ema20Prev,
  ema50Prev,
  ema20_1W,
  ema50_1W,
  rsi,
  macdLine,
  signalLine,
  macdLine_4H,
  signalLine_4H,
  plusDI,
  minusDI,
  adx,
  atrPct,
  kalman,
  close,
  groqAnalysis,
}) => {
  // Logic sinyal
  const emaCrossUp = ema20Prev < ema50Prev && ema20 > ema50;
  const emaCrossDown = ema20Prev > ema50Prev && ema20 < ema50;

  const buySignal =
    emaCrossUp &&
    rsi > 50 &&
    macdLine > signalLine &&
    plusDI > minusDI &&
    adx > 20 &&
    kalman !== null &&
    close > kalman;

  const sellSignal =
    emaCrossDown &&
    rsi < 50 &&
    macdLine < signalLine &&
    minusDI > plusDI &&
    adx > 20 &&
    kalman !== null &&
    close < kalman;

  const trend = ema20 > ema50 ? '🟢 Uptrend' : ema20 < ema50 ? '🔴 Downtrend' : 'Sideways';
  const macdTrend = macdLine > signalLine ? 'Bullish 📈' : 'Bearish 📉';
  const diTrend = plusDI > minusDI ? '+DI Dominan 📈' : '-DI Dominan 📉';
  const trend1W = ema20_1W > ema50_1W ? '🟢 Bullish' : '🔴 Bearish';
  const atrStatus = atrPct < 1 ? '🟡 Sideways' : atrPct <= 2.5 ? '🟢 Normal' : '🔴 Volatile';
  const kalmanDiff = kalman !== null ? (close - kalman).toFixed(2) : 'N/A';
  const macd4HTrend = macdLine_4H > signalLine_4H ? '🟢 Bullish' : '🔴 Bearish';

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Mini</h2>

      <div className="dashboard-row">
        <p><strong>Sinyal:</strong> {buySignal ? 'BELI ✅' : sellSignal ? 'JUAL ❌' : 'TIDAK ADA'}</p>
        <p><strong>EMA Trend:</strong> {trend}</p>
        <p><strong>RSI:</strong> {rsi !== undefined ? rsi.toFixed(0) : 'N/A'}</p>
      </div>

      <div className="dashboard-row">
        <p><strong>MACD:</strong> {macdTrend}</p>
        <p><strong>DI+/DI-:</strong> {diTrend}</p>
        <p><strong>Trend 1W:</strong> {trend1W}</p>
      </div>

      <div className="dashboard-row">
        <p><strong>ADX:</strong> {adx !== undefined ? adx.toFixed(2) : 'N/A'}</p>
        <p><strong>ATR:</strong> {atrPct !== undefined ? `${atrPct.toFixed(2)}% ${atrStatus}` : 'N/A'}</p>
        <p><strong>Kalman Diff:</strong> {kalmanDiff}</p>
      </div>

      <div className="dashboard-row">
        <p><strong>4H MACD:</strong> {macd4HTrend}</p>
      </div>

      <div className="groq-analysis">
        <strong>Analisis Groq:</strong>
        <p>{groqAnalysis || 'Memuat analisis...'}</p>
      </div>
    </div>
  );
};

export default SignalDashboard;
