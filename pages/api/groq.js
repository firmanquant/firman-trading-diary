export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // <- ENV var diatur di Vercel Dashboard
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }),
    });

    const data = await groqRes.json();

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      'Tidak ada hasil analisis dari model.';

    res.status(200).json({ response: text });
  } catch (err) {
    console.error('GROQ API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
