export default function handler(req, res) {
  const { prompt } = req.body;

  const dummyResponse = `Analisis teknikal untuk ${prompt || 'Saham'}:
- Trend saat ini: Bullish
- Indikator RSI: Netral
- Rekomendasi: Tunggu konfirmasi breakout`;

  res.status(200).json({ response: dummyResponse });
}
