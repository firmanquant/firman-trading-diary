// src/api/groq.js
export const getGroqAnalysis = async (symbol) => {
  // Dummy response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response: `Analisis teknikal untuk saham ${symbol}: Tren naik, volume meningkat, dan sinyal beli kuat.`
      });
    }, 1000);
  });
};
