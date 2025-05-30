// pages/api/signal.js

export default function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  // Simulasi dummy data — kamu bisa ganti dengan fetch API/data asli nanti
  const response = {
    ema20: 5000,
    ema50: 5100,
    ema20Prev: 5050,
    ema50Prev: 5150,
    ema20_1W: 4950,
    ema50_1W: 5200,
    rsi: 45,
    macdLine: -10,
    signalLine: -5,
    macdLine_4H: -3,
    signalLine_4H: -4,
    plusDI: 18,
    minusDI: 25,
    adx: 22,
    atrPct: 2.5,
    kalman: 5001,
    close: 4998,
  };

  res.status(200).json(response);
}
