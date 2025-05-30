// pages/api/groq.js (Dummy version)

export default function handler(req, res) {
  const { prompt } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const dummyResponse = `
Saham ${prompt.split(' ')[prompt.split(' ').length - 1]} saat ini menunjukkan potensi teknikal berikut:

- RSI berada di zona netral, memberi ruang untuk naik lebih lanjut.
- MACD menunjukkan momentum yang mulai menguat.
- Harga mendekati resistance penting, hati-hati potensi rejection.

Gunakan manajemen risiko dan konfirmasi tambahan sebelum mengambil keputusan.
  `;

  res.status(200).json({ response: dummyResponse.trim() });
}
