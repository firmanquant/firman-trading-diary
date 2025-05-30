// pages/api/groq.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768', // Ganti ke 'llama2-70b-4096' jika model ini error
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    // Tangkap dan parse hasil dari Groq
    const data = await groqRes.json();

    // Cek struktur respons Groq
    const response = data?.choices?.[0]?.message?.content;

    if (!response) {
      return res.status(500).json({
        error: 'Invalid response from Groq',
        details: data // Bisa dibaca di console dev
      });
    }

    res.status(200).json({ response });
  } catch (err) {
    console.error('Groq API Error:', err);
    res.status(500).json({ error: 'Failed to fetch from Groq' });
  }
}
