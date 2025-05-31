// src/api/signal.js
export const getSignalData = async (symbol) => {
  // Dummy signal data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ema20: 100,
        ema50: 105,
        ema20Prev: 98,
        ema50Prev: 102,
        ema20_1W: 97,
        ema50_1W: 99,
        rsi: 55,
        macdLine: 1.2,
        signalLine: 0.8,
        macdLine_4H: 1.0,
        signalLine_4H: 0.9,
        plusDI: 25,
        minusDI: 18,
        adx: 20,
        atrPct: 2.3,
        kalman: 102,
        close: 103
      });
    }, 1000);
  });
};
