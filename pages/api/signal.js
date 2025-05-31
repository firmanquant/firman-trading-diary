export async function getSignalData(symbol) {
  // Simulasi response dummy
  return {
    signal: 'Buy',
    confidence: '85%',
    updatedAt: new Date().toLocaleString()
  };
}
