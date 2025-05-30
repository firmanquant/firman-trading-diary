// pages/api/signal.js (Dummy version with fallback validation)

export default function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol || symbol.length < 2) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  const dummySignal = {
    ema20: 5000,
    ema50: 5100,
    ema20Prev: 4950,
    ema50Prev: 5050,
    ema20_1W: 4800,
    ema50_1W: 5000,
    rsi: 47.5,
    macdLine: -1.2,
    signalLine: -1.0,
    macdLine_4H: -0.5,
    signalLine_4H: -0.6,
    plusDI: 20,
    minusDI: 25,
    adx: 22,
    atrPct: 3.2,
    kalman: 4998,
    close: 5001,
    support: 4800,
    resistance: 5200
  };

  res.status(200).json(dummySignal);
}
