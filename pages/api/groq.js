export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  const dummyResponse = `Analisis untuk: ${prompt}
- Trend: Naik
- Rekomendasi: Beli
- Support: 5800
- Resistance: 6200`;

  res.status(200).json({ response: dummyResponse });
}
