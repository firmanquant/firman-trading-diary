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
  groqAnalysis
}) => {
  const emaTrend = ema20 > ema50 && ema20Prev > ema50Prev ? 'Uptrend' : 'Downtrend';
  const diTrend = plusDI > minusDI ? '+DI Dominan 📈' : '-DI Dominan 📉';
  const trend1W = ema20_1W > ema50_1W ? 'Bullish 🟢' : 'Bearish 🔴';
  const atrStatus = atrPct < 2.5 ? 'Normal 🟢' : 'Volatile 🔴';
  const kalmanDiff = kalman != null ? (close - kalman).toFixed(2) : 'N/A';
  const macd4HTrend = macdLine_4H > signalLine_4H ? 'Bullish 🟢' : 'Bearish 🔴';
  const buySignal = macdLine > signalLine && ema20 > ema50;
  const sellSignal = macdLine < signalLine && ema20 < ema50;

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Mini</h2>
      <div className="dashboard-row">
        <p><strong>Sinyal:</strong> {buySignal ? 'BELI ✅' : sellSignal ? 'JUAL ❌' : 'TIDAK ADA'}</p>
        <p><strong>EMA Trend:</strong> {emaTrend}</p>
        <p><strong>RSI:</strong> {rsi ? rsi.toFixed(0) : 'N/A'}</p>
      </div>
      <div className="dashboard-row">
        <p><strong>MACD:</strong> {macdLine > signalLine ? 'Bullish 🟢' : 'Bearish 🔴'}</p>
        <p><strong>DI+/DI-:</strong> {diTrend}</p>
        <p><strong>Trend 1W:</strong> {trend1W}</p>
      </div>
      <div className="dashboard-row">
        <p><strong>ADX:</strong> {adx ? adx.toFixed(2) : 'N/A'}</p>
        <p><strong>ATR:</strong> {atrPct ? `${atrPct.toFixed(2)}% ${atrStatus}` : 'N/A'}</p>
        <p><strong>Kalman Diff:</strong> {kalmanDiff}</p>
      </div>
      <div className="dashboard-row">
        <p><strong>4H MACD:</strong> {macd4HTrend}</p>
      </div>
      <div className="groq-analysis">
        <strong>Analisis Groq:</strong>
        <p>{groqAnalysis || 'Memuat analisis…'}</p>
      </div>
    </div>
  );
};

export default SignalDashboard;
