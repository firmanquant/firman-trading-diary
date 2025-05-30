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
  const isBullish = macdLine > signalLine;
  const isBullish4H = macdLine_4H > signalLine_4H;
  const emaTrend = ema20 > ema50 && ema20Prev > ema50Prev ? 'Uptrend' : 'Downtrend';
  const trend1W = ema20_1W > ema50_1W ? 'Bullish' : 'Bearish';
  const diTrend = plusDI > minusDI ? '+DI Dominan' : '-DI Dominan';
  const atrLabel = atrPct > 3 ? 'Volatile' : 'Normal';
  const signal = emaTrend === 'Uptrend' && isBullish && isBullish4H && plusDI > minusDI ? 'BELI ✅' : 'TIDAK ADA';

  return (
    <div className="analysis-wrapper">
      <div className="groq-box">
        <h3>Analisis Groq:</h3>
        <p>{groqAnalysis || 'Gagal memuat analisis.'}</p>
      </div>

      <div className="mini-dashboard-box">
        <h3>🌃 Dashboard Mini</h3>
        <p><strong>Sinyal:</strong> {signal}</p>
        <p><strong>MACD:</strong> {isBullish ? 'Bullish' : 'Bearish'} </p>
        <p><strong>ADX:</strong> {adx}</p>
        <p><strong>4H MACD:</strong> {isBullish4H ? 'Bullish' : 'Bearish'}</p>
        <p><strong>EMA Trend:</strong> {emaTrend}</p>
        <p><strong>DI+/DI-:</strong> {diTrend}</p>
        <p><strong>ATR:</strong> {atrPct}% {atrLabel}</p>
        <p><strong>RSI:</strong> {rsi}</p>
        <p><strong>Trend 1W:</strong> {trend1W}</p>
        <p><strong>Kalman Diff:</strong> {(close - kalman).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SignalDashboard;
