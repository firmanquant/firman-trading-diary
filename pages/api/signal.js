export default function handler(req, res) {
  const { symbol } = req.query;
  res.status(200).json({
    ema20: 100, ema50: 105, ema20Prev: 98, ema50Prev: 103,
    rsi: 55, macdLine: 1.2, signalLine: 1.0,
    macdLine_4H: 1.1, signalLine_4H: 1.0,
    plusDI: 25, minusDI: 18, adx: 20, atrPct: 2.5,
    kalman: 100, close: 102, groqAnalysis: `Analisis dummy untuk ${symbol}`
  });
}
