// SignalDashboard.js (final presisi produksi, responsif & sinkron layout)
import React, { useEffect, useState } from 'react';

const SignalDashboard = ({
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
  ema20,
  ema50,
  ema20Prev,
  ema50Prev,
  ema20_1W,
  ema50_1W,
  groqAnalysis,
  symbol
}) => {
  const [localGroq, setLocalGroq] = useState(groqAnalysis || '');

  useEffect(() => {
    setLocalGroq(groqAnalysis || '');
  }, [groqAnalysis]);

  const macdTrend = macdLine > signalLine ? 'Bullish' : 'Bearish';
  const macd4HTrend = macdLine_4H > signalLine_4H ? 'Bullish' : 'Bearish';
  const emaTrend = ema20 > ema50 ? 'Uptrend' : 'Downtrend';
  const prevEmaTrend = ema20Prev > ema50Prev ? 'Uptrend' : 'Downtrend';
  const weeklyTrend = ema20_1W > ema50_1W ? 'Bullish' : 'Bearish';
  const diTrend = plusDI > minusDI ? '+DI Dominan' : '-DI Dominan';
  const signal = (macdTrend === 'Bullish' && emaTrend === 'Uptrend' && adx > 20) ? 'BELI ✅' : 'TIDAK ADA';
  const atrStatus = atrPct > 3 ? 'Volatile' : 'Normal';

  return (
    <div className="signal-dashboard">
      <h3>📊 Dashboard Mini</h3>
      <div className="signal-grid">
        <div><strong>Sinyal:</strong> {signal}</div>
        <div><strong>MACD:</strong> {macdTrend} <span className="dot" /></div>
        <div><strong>ADX:</strong> {adx}</div>
        <div><strong>4H MACD:</strong> {macd4HTrend} <span className="dot" /></div>
        <div><strong>EMA Trend:</strong> {emaTrend} <span className="dot" /></div>
        <div><strong>DI+/DI-:</strong> {diTrend} <span className="dot" /></div>
        <div><strong>ATR:</strong> {atrPct}% {atrStatus} <span className="dot" /></div>
        <div><strong>RSI:</strong> {rsi}</div>
        <div><strong>Trend 1W:</strong> {weeklyTrend} <span className="dot" /></div>
        <div><strong>Kalman Diff:</strong> {kalman}</div>
      </div>
    </div>
  );
};

export default SignalDashboard;
