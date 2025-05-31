export async function getGroqAnalysis(prompt) {
  const dummyResponse = `Analisis teknikal untuk ${prompt || 'Saham'}:
– Trend saat ini: Bullish
– Indikator RSI: Netral
– Rekomendasi: Tunggu konfirmasi breakout`;

  return { response: dummyResponse };
}
