export async function getSignalData(symbol) {
  const dummySignal = {
    ticker: symbol || 'BBRI',
    signal: 'Buy',
    confidence: 'High',
    notes: 'Golden cross terdeteksi pada MA50 dan MA200.'
  };

  return dummySignal;
}
