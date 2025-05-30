export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({
      response: `📊 Ini adalah analisis teknikal dummy untuk simbol: ${req.body.prompt}`
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
