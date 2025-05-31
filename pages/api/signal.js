export default function handler(req, res) {
  const { symbol } = req.query;

  const dummySignal = {
    ticker: symbol || 'BBRI',
    signal: 'Buy',
    confidence: 'High',
    notes: 'Golden cross terdeteksi pada MA50 dan MA200.'
  };

  res.status(200).json(dummySignal);
}
