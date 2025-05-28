// File: pages/api/groq.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body || {};

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          { role: 'system', content: 'Kamu adalah analis teknikal profesional.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('Groq API error:', data);
      return res.status(groqResponse.status).json({ message: data });
    }

    const reply = data.choices?.[0]?.message?.content || 'Tidak ada analisis.';
    res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Groq API exception:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
