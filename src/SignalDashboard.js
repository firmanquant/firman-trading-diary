import React from 'react';

const SignalDashboard = ({
  ema20,
  ema50,
  ema20Prev,
  ema50Prev,
  rsi,
  macdLine,
  signalLine,
  plusDI,
  minusDI,
  adx,
  kalman,
  close
}) => {
  // ===== LOGIC SINYAL =====
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

  const trend =
    ema20 > ema50 ? '🔼 Uptrend' : ema20 < ema50 ? '🔽 Downtrend' : 'Sideways';
  const macdTrend = macdLine > signalLine ? 'Bullish' : 'Bearish';
  const diTrend = plusDI > minusDI ? '+DI Dominan' : '-DI Dominan';

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Mini</h2>
      <p><strong>Sinyal:</strong> {buySignal ? 'BELI ✅' : sellSignal ? 'JUAL ❌' : 'TIDAK ADA'}</p>
      <p><strong>Trend EMA:</strong> {trend}</p>
      <p><strong>RSI:</strong> {rsi?.toFixed(2)}</p>
      <p><strong>MACD:</strong> {macdTrend}</p>
      <p><strong>DI+/DI-:</strong> {diTrend}</p>
      <p><strong>ADX:</strong> {adx?.toFixed(2)}</p>
    </div>
  );
};

export default SignalDashboard;
