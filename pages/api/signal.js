export default async function handler(req, res) {
  const { symbol } = req.query;

  const dummySignal = {
    symbol: symbol || 'BBCA',
    signal: 'BUY',
    strength: 'STRONG',
    lastPrice: 5925,
    support: 5800,
    resistance: 6150,
  };

  res.status(200).json(dummySignal);
}
