// src/SignalDashboard.js (Final Revisi)
import React from 'react';

const SignalDashboard = ({
  ticker, signal, confidence, notes,
  ema20, ema50, ema20Prev, ema50Prev,
  ema20_1W, ema50_1W,
  rsi, macdLine, signalLine,
  macdLine_4H, signalLine_4H,
  plusDI, minusDI, adx, atrPct,
  kalman, close
}) => {
  const isBullish = macdLine > signalLine;
  const isBullish4H = macdLine_4H > signalLine_4H;
  const emaTrend = ema20 >= ema50 && ema20Prev >= ema50Prev ? 'Uptrend' : 'Downtrend';
  const trend1W = ema20_1W >= ema50_1W ? 'Bullish' : 'Bearish';
  const diTrend = plusDI > minusDI ? '+DI Dominan' : '-DI Dominan';
  const atrLabel = atrPct > 3 ? 'Volatile' : 'Normal';

  const finalSignal = (
    emaTrend === 'Uptrend' &&
    isBullish &&
    isBullish4H &&
    plusDI > minusDI
  ) ? 'BELI ✅' : 'TIDAK ADA ❌';

  return (
    <div className="dashboard-box">
      <h3 className="text-lg font-bold text-cyan-400 mb-2">📊 Dashboard Mini</h3>
      {ticker && <p className="text-sm mb-2 font-semibold">{ticker}</p>}

      <div className="dashboard-grid">
        <div><strong>Sinyal:</strong> {finalSignal}</div>
        <div><strong>MACD:</strong> {isBullish ? 'Bullish 🔴' : 'Bearish 🔴'}</div>
        <div><strong>ADX:</strong> {adx}</div>
        <div><strong>4H MACD:</strong> {isBullish4H ? 'Bullish 🔴' : 'Bearish 🔴'}</div>
        <div><strong>EMA Trend:</strong> {emaTrend}</div>
        <div><strong>DI+/DI-:</strong> {diTrend}</div>
        <div><strong>ATR:</strong> {atrLabel}</div>
        <div><strong>RSI:</strong> {rsi}</div>
        <div><strong>Trend 1W:</strong> {trend1W}</div>
        <div><strong>Kalman:</strong> {kalman}</div>
      </div>

      {(confidence || notes) && (
        <div className="mt-4 text-green-300 text-sm">
          {confidence && <p><strong>Confidence:</strong> {confidence}</p>}
          {notes && <p><strong>Notes:</strong> {notes}</p>}
        </div>
      )}
    </div>
  );
};

export default SignalDashboard;
