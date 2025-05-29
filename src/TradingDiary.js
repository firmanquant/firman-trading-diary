import React, { useState, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';

// Komponen TradingView Chart
const TVChart = ({ symbol = "IDX:BBCA" }) => {
  useEffect(() => {
    const container = document.getElementById("tv_chart_container");
    if (!container) return;

    container.innerHTML = ""; // Reset chart

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: "tv_chart_container",
          symbol,
          interval: "D",
          timezone: "Asia/Jakarta",
          theme: "dark",
          style: "1",
          locale: "id",
          autosize: true,
        });
      } else {
        console.error("TradingView widget failed to load.");
      }
    };

    script.onerror = () => {
      console.error("Failed to load TradingView script.");
    };

    container.appendChild(script);
  }, [symbol]);

  return <div id="tv_chart_container" style={{ height: "350px" }} />;
};

// Kelas FirmanQuantStrategy
class FirmanQuantStrategy {
  constructor(params) {
    this.ema20Len = params.ema20Len;
    this.ema50Len = params.ema50Len;
    this.sma20Len = params.sma20Len;
    this.sma50Len = params.sma50Len;
    this.enableKalman = params.enableKalman;
    this.kalmanLen = params.kalmanLen;
    this.kalmanGain = params.kalmanGain;
    this.dmiLen = params.dmiLen;
    this.adxSmooth = params.adxSmooth;
    this.macdFast = params.macdFast;
    this.macdSlow = params.macdSlow;
    this.macdSignal = params.macdSignal;
    this.rsiLen = params.rsiLen;
    this.liquidityLookback = params.liquidityLookback;
    this.volumeThreshold = params.volumeThreshold;

    this.closes = [];
    this.volumes = [];
    this.highs = [];
    this.lows = [];

    this.ema20Values = [];
    this.ema50Values = [];
    this.sma20Values = [];
    this.sma50Values = [];
    this.kalmanValues = [];
    this.plusDIValues = [];
    this.minusDIValues = [];
    this.adxValues = [];
    this.macdLineValues = [];
    this.signalLineValues = [];
    this.rsiValues = [];

    this.tradeRecords = [];
    this.openPositions = [];
  }

  resetData() {
    this.closes = [];
    this.volumes = [];
    this.highs = [];
    this.lows = [];
    this.ema20Values = [];
    this.ema50Values = [];
    this.sma20Values = [];
    this.sma50Values = [];
    this.kalmanValues = [];
    this.plusDIValues = [];
    this.minusDIValues = [];
    this.adxValues = [];
    this.macdLineValues = [];
    this.signalLineValues = [];
    this.rsiValues = [];
    this.tradeRecords = [];
    this.openPositions = [];
  }

  processNewData(data) {
    this.closes.push(data.close);
    this.volumes.push(data.volume);
    this.highs.push(data.high);
    this.lows.push(data.low);

    this.calculateIndicators();
    this.generateSignals();
    this.updatePerformance();
  }

  calculateIndicators() {
    const idx = this.closes.length - 1;

    this.ema20Values.push(this.calcEMA(this.closes, this.ema20Len));
    this.ema50Values.push(this.calcEMA(this.closes, this.ema50Len));
    this.sma20Values.push(this.calcSMA(this.closes, this.sma20Len));
    this.sma50Values.push(this.calcSMA(this.closes, this.sma50Len));

    const kalmanVal = this.enableKalman
      ? this.kalmanFilter(this.closes[idx], this.kalmanGain)
      : NaN;
    this.kalmanValues.push(kalmanVal);

    const dmi = this.calcDMI(this.highs, this.lows, this.closes, this.dmiLen, this.adxSmooth);
    this.plusDIValues.push(dmi.plusDI);
    this.minusDIValues.push(dmi.minusDI);
    this.adxValues.push(dmi.adx);

    const macd = this.calcMACD(this.closes, this.macdFast, this.macdSlow, this.macdSignal);
    this.macdLineValues.push(macd.macdLine);
    this.signalLineValues.push(macd.signalLine);

    this.rsiValues.push(this.calcRSI(this.closes, this.rsiLen));
  }

  calcEMA(data, length) {
    if (data.length < length) return NaN;
    const multiplier = 2.0 / (length + 1);

    let ema = data.slice(0, length).reduce((sum, val) => sum + val, 0) / length;

    for (let i = length; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  calcSMA(data, length) {
    if (data.length < length) return NaN;
    const slice = data.slice(data.length - length);
    return slice.reduce((sum, val) => sum + val, 0) / length;
  }

  kalmanFilter(currentValue, gain) {
    if (this.kalmanValues.length === 0) return currentValue;
    const prevKalman = this.kalmanValues[this.kalmanValues.length - 1];
    return prevKalman + gain * (currentValue - prevKalman);
  }

  calcDMI(highs, lows, closes, diLen, adxSmooth) {
    const trValues = [];
    const plusDMValues = [];
    const minusDMValues = [];

    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trValues.push(tr);

      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];

      const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
      const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;

      plusDMValues.push(plusDM);
      minusDMValues.push(minusDM);
    }

    const smoothedTR = this.wilderSmoothing(trValues, diLen);
    const smoothedPlusDM = this.wilderSmoothing(plusDMValues, diLen);
    const smoothedMinusDM = this.wilderSmoothing(minusDMValues, diLen);

    const plusDI = [];
    const minusDI = [];
    for (let i = 0; i < smoothedTR.length; i++) {
      plusDI.push(100 * smoothedPlusDM[i] / smoothedTR[i]);
      minusDI.push(100 * smoothedMinusDM[i] / smoothedTR[i]);
    }

    const dxValues = [];
    for (let i = 0; i < plusDI.length; i++) {
      const diDiff = Math.abs(plusDI[i] - minusDI[i]);
      const diSum = plusDI[i] + minusDI[i];
      dxValues.push(diSum > 0 ? 100 * (diDiff / diSum) : 0);
    }

    const adx = this.wilderSmoothing(dxValues, adxSmooth);

    return {
      plusDI: plusDI.length > 0 ? plusDI[plusDI.length - 1] : NaN,
      minusDI: minusDI.length > 0 ? minusDI[minusDI.length - 1] : NaN,
      adx: adx.length > 0 ? adx[adx.length - 1] : NaN,
    };
  }

  wilderSmoothing(values, period) {
    if (values.length < period) return [];

    const smoothed = [];
    const initialSum = values.slice(0, period).reduce((sum, val) => sum + val, 0);
    smoothed.push(initialSum / period);

    for (let i = period; i < values.length; i++) {
      const prev = smoothed[smoothed.length - 1];
      const newValue = (prev * (period - 1) + values[i]) / period;
      smoothed.push(newValue);
    }

    return smoothed;
  }

  calcMACD(closes, fastLen, slowLen, signalLen) {
    const fastEMA = this.calcEMA(closes, fastLen);
    const slowEMA = this.calcEMA(closes, slowLen);
    const macdLine = fastEMA - slowEMA;

    const macdLineHistory = [...this.macdLineValues, macdLine];
    const signalLine = this.calcEMA(macdLineHistory, signalLen);

    return {
      macdLine,
      signalLine,
      histogram: macdLine - signalLine,
    };
  }

  calcRSI(closes, length) {
    if (closes.length < length + 1) return NaN;

    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i <= length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) avgGain += change;
      else avgLoss -= change;
    }

    avgGain /= length;
    avgLoss /= length;

    for (let i = length + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (length - 1) + gain) / length;
      avgLoss = (avgLoss * (length - 1) + loss) / length;
    }

    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  generateSignals() {
    const idx = this.closes.length - 1;

    if (idx < 1) return;

    const emaCrossUp =
      this.ema20Values[idx] > this.ema50Values[idx] &&
      this.ema20Values[idx - 1] <= this.ema50Values[idx - 1];

    const emaCrossDown =
      this.ema20Values[idx] < this.ema50Values[idx] &&
      this.ema20Values[idx - 1] >= this.ema50Values[idx - 1];

    const buySignal =
      emaCrossUp &&
      this.rsiValues[idx] > 50 &&
      this.macdLineValues[idx] > this.signalLineValues[idx] &&
      this.plusDIValues[idx] > this.minusDIValues[idx] &&
      this.adxValues[idx] > 20 &&
      !isNaN(this.kalmanValues[idx]) &&
      this.closes[idx] > this.kalmanValues[idx];

    const sellSignal =
      emaCrossDown &&
      this.rsiValues[idx] < 50 &&
      this.macdLineValues[idx] < this.signalLineValues[idx] &&
      this.minusDIValues[idx] > this.plusDIValues[idx] &&
      this.adxValues[idx] > 20 &&
      !isNaN(this.kalmanValues[idx]) &&
      this.closes[idx] < this.kalmanValues[idx];

    if (buySignal) {
      this.openPositions.push({
        entryTime: Date.now(),
        entryPrice: this.closes[idx],
        type: 'LONG',
      });
    }

    if (sellSignal && this.openPositions.length > 0) {
      const position = this.openPositions.shift();
      this.tradeRecords.push({
        position,
        exitPrice: this.closes[idx],
        exitTime: Date.now(),
        profit: this.closes[idx] - position.entryPrice,
      });
    }
  }

  updatePerformance() {}

  getPerformanceSummary() {
    const totalProfit = this.tradeRecords.reduce((sum, trade) => sum + trade.profit, 0);
    const winCount = this.tradeRecords.filter(t => t.profit > 0).length;
    const winRate = this.tradeRecords.length > 0 ? (winCount / this.tradeRecords.length) * 100 : 0;

    return {
      totalTrades: this.tradeRecords.length,
      totalProfit,
      winRate,
      winTrades: winCount,
      lossTrades: this.tradeRecords.length - winCount,
    };
  }

  getLatestIndicators() {
    const idx = this.closes.length - 1;
    return {
      ema20: this.ema20Values[idx],
      ema50: this.ema50Values[idx],
      ema20Prev: idx > 0 ? this.ema20Values[idx - 1] : NaN,
      ema50Prev: idx > 0 ? this.ema50Values[idx - 1] : NaN,
      rsi: this.rsiValues[idx],
      macdLine: this.macdLineValues[idx],
      signalLine: this.signalLineValues[idx],
      plusDI: this.plusDIValues[idx],
      minusDI: this.minusDIValues[idx],
      adx: this.adxValues[idx],
      kalman: this.kalmanValues[idx],
      close: this.closes[idx],
    };
  }

  calcEMAForData(data, length) {
    if (data.length < length) return NaN;
    const multiplier = 2.0 / (length + 1);
    let ema = data.slice(0, length).reduce((sum, val) => sum + val, 0) / length;
    for (let i = length; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  calcMACDForData(data, fastLen, slowLen, signalLen) {
    const fastEMA = this.calcEMAForData(data, fastLen);
    const slowEMA = this.calcEMAForData(data, slowLen);
    const macdLine = fastEMA - slowEMA;

    const macdLineHistory = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const emaFast = this.calcEMAForData(data.slice(i), fastLen);
      const emaSlow = this.calcEMAForData(data.slice(i), slowLen);
      macdLineHistory.push(emaFast - emaSlow);
    }
    const signalLine = this.calcEMAForData(macdLineHistory, signalLen);

    return {
      macdLine,
      signalLine,
      histogram: macdLine - signalLine,
    };
  }
}

// Fungsi untuk menghasilkan data historis simulasi dengan seed
const simulateHistoricalData = (ticker, numBars = 50) => {
  const mulberry32 = (seed) => {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) & 0xFFFFFFFF;
  }

  const firstChar = ticker.charAt(0).toUpperCase();
  let basePrice, range;

  if (firstChar >= 'A' && firstChar <= 'E') {
    basePrice = 8000;
    range = 1000;
  } else if (firstChar >= 'F' && firstChar <= 'J') {
    basePrice = 4000;
    range = 500;
  } else {
    basePrice = 500;
    range = 100;
  }

  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variation = (hash % 1000) - 500;

  const historicalData = [];
  let prevClose = basePrice + variation;
  for (let i = 0; i < numBars; i++) {
    const random = mulberry32(seed + i);
    const close = prevClose + (random - 0.5) * range * 0.1;
    const high = close + random * range * 0.05;
    const low = close - random * range * 0.05;
    const volume = 1000000 + random * 500000;
    historicalData.push({ close, high, low, volume });
    prevClose = close;
  }

  return historicalData.reverse();
};

// Fungsi untuk menghitung ATR
const calcATR = (data, length) => {
  let trSum = 0;
  for (let i = 0; i < length && i < data.length - 1; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i + 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trSum += tr;
  }
  return trSum / length;
};

const TradingDiary = () => {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('tradingEntries');
    console.log('Initial entries from localStorage:', savedEntries); // Debug
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [form, setForm] = useState({
    date: '',
    ticker: '',
    entry: '',
    exit: '',
    reason: '',
    emotion: ''
  });
  const [ticker, setTicker] = useState('BBCA');
  const [strategy, setStrategy] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [fourHourData, setFourHourData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState(''); // State untuk Groq

  // Fungsi untuk memanggil API Groq
  const fetchGroqAnalysis = async () => {
    if (!indicators) {
      console.log('Indicators not ready yet.');
      return;
    }

    console.log('Fetching Groq analysis...');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Available' : 'Not Available');

    const prompt = `
      Analisis saham ${ticker} berdasarkan indikator berikut:
      - EMA Trend (1D): ${indicators.ema20 > indicators.ema50 ? 'Uptrend' : 'Downtrend'}
      - EMA Trend (1W): ${indicators.ema20_1W > indicators.ema50_1W ? 'Uptrend' : 'Downtrend'}
      - RSI: ${indicators.rsi}
      - MACD (1D): ${indicators.macdLine > indicators.signalLine ? 'Bullish' : 'Bearish'}
      - MACD (4H): ${indicators.macdLine_4H > indicators.signalLine_4H ? 'Bullish' : 'Bearish'}
      - DMI (DI+/DI-): ${indicators.plusDI > indicators.minusDI ? 'DI+ Dominan' : 'DI- Dominan'}
      - ADX: ${indicators.adx}
      - ATR: ${indicators.atrPct}%
      - Kalman Diff: ${(indicators.close - indicators.kalman).toFixed(2)}
      Berikan analisis singkat dan rekomendasi trading (beli/jual/tahan) dalam 3-5 kalimat.
    `;

    console.log('Prompt sent to Groq:', prompt);

    try {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt })
  });

  console.log('Groq API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error response:', errorText);
    setGroqAnalysis(`Gagal mengambil analisis dari Groq: ${errorText}`);
    return;
  }

  const data = await response.json();
  setGroqAnalysis(data.response || 'Tidak ada analisis dari Groq.');
} catch (error) {
  console.error('Error calling Groq API:', error.message);
  setGroqAnalysis(`Gagal mengambil analisis dari Groq: ${error.message}`);
}}

  };

  useEffect(() => {
    const strategyParams = {
      ema20Len: 20,
      ema50Len: 50,
      sma20Len: 20,
      sma50Len: 50,
      enableKalman: true,
      kalmanLen: 20,
      kalmanGain: 0.5,
      dmiLen: 14,
      adxSmooth: 14,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      rsiLen: 14,
      liquidityLookback: 50,
      volumeThreshold: 1.5,
    };

    const newStrategy = new FirmanQuantStrategy(strategyParams);
    setStrategy(newStrategy);

    const daily = simulateHistoricalData(ticker);
    const weekly = [];
    for (let i = 0; i < daily.length; i += 5) {
      const slice = daily.slice(i, i + 5);
      if (slice.length > 0) {
        const close = slice[0].close;
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const volume = slice[0].volume;
        weekly.push({ close, high, low, volume });
      }
    }

    const fourHour = [];
    for (let i = 0; i < daily.length; i += 2) {
      const slice = daily.slice(i, i + 2);
      if (slice.length > 0) {
        const close = slice[0].close;
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const volume = slice[0].volume;
        fourHour.push({ close, high, low, volume });
      }
    }

    setDailyData(daily);
    setWeeklyData(weekly);
    setFourHourData(fourHour);

    newStrategy.resetData();
    daily.forEach(data => newStrategy.processNewData(data));

    const latestIndicators = newStrategy.getLatestIndicators();
    const atrValue = calcATR(daily, 14);
    const atrPct = (atrValue / latestIndicators.close) * 100;
    const ema20_1W = newStrategy.calcEMAForData(weekly.map(d => d.close), 20);
    const ema50_1W = newStrategy.calcEMAForData(weekly.map(d => d.close), 50);
    const { macdLine: macdLine_4H, signalLine: signalLine_4H } = newStrategy.calcMACDForData(
      fourHour.map(d => d.close),
      12,
      26,
      9
    );

    console.log('Daily Data:', daily.slice(0, 5));
    console.log('Weekly Data:', weekly.slice(0, 5));
    console.log('Four Hour Data:', fourHour.slice(0, 5));
    console.log('Latest Indicators:', {
      ...latestIndicators,
      ema20_1W,
      ema50_1W,
      macdLine_4H,
      signalLine_4H,
      atrPct,
    });

    setIndicators({
      ...latestIndicators,
      ema20_1W,
      ema50_1W,
      macdLine_4H,
      signalLine_4H,
      atrPct,
    });
  }, [ticker]);

  useEffect(() => {
    if (indicators) {
      fetchGroqAnalysis();
    }
  }, [indicators, ticker]);

  useEffect(() => {
    console.log('Entries updated:', entries); // Debug
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'ticker') {
      setTicker(value.toUpperCase() || 'BBCA');
    }
  };

  const handleAdd = () => {
    if (!form.date || !form.ticker || !form.entry || !form.exit) {
      alert('Harap isi semua kolom wajib: Tanggal, Ticker, Entry Price, dan Exit Price.');
      return;
    }

    const newEntry = {
      ...form,
      entry: parseFloat(form.entry),
      exit: parseFloat(form.exit),
    };
    setEntries(prevEntries => {
      const updatedEntries = [...prevEntries, newEntry];
      console.log('New entry added:', newEntry); // Debug
      console.log('Updated entries:', updatedEntries); // Debug
      return updatedEntries;
    });
    setForm({ date: '', ticker: '', entry: '', exit: '', reason: '', emotion: '' });
    alert('Entri berhasil ditambahkan!');
  };

  const handleDelete = (index) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus entri ini?')) {
      setEntries(prevEntries => {
        const newEntries = prevEntries.filter((_, i) => i !== index);
        console.log('Entry deleted, new entries:', newEntries); // Debug
        return newEntries;
      });
      alert('Entri berhasil dihapus!');
    }
  };

  const calcResult = (entry, exit) => {
    if (isNaN(entry) || isNaN(exit)) return 'Data Tidak Valid';
    return (exit - entry).toFixed(2);
  };

  const calcGain = (entry, exit) => {
    if (isNaN(entry) || entry === 0) return 'Data Tidak Valid';
    return (((exit - entry) / entry) * 100).toFixed(2);
  };

  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => calcResult(e.entry, e.exit) > 0).length;
  const totalGainLoss = entries.reduce((sum, e) => sum + (parseFloat(e.exit) - parseFloat(e.entry) || 0), 0);

  const toggleTable = () => {
    setShowTable(prevShowTable => {
      const newShowTable = !prevShowTable;
      console.log('showTable toggled to:', newShowTable); // Debug
      console.log('Entries at toggle:', entries); // Debug
      return newShowTable;
    });
  };

export default TradingDiary;

      <div className="form">
        <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Tanggal" />
        <input name="ticker" placeholder="Ticker (contoh: BBCA)" value={form.ticker} onChange={handleChange} />
        <input name="entry" type="number" placeholder="Entry Price" value={form.entry} onChange={handleChange} />
        <input name="exit" type="number" placeholder="Exit Price" value={form.exit} onChange={handleChange} />
        <input name="reason" placeholder="Alasan Setup" value={form.reason} onChange={handleChange} />
        <input name="emotion" placeholder="Catatan Emosi" value={form.emotion} onChange={handleChange} />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      <div className="summary-dashboard-container">
        <div className="summary-card">
          <h2>📊 Ringkasan Performa</h2>
          <p>Total Trade: {totalTrades}</p>
          <p>Win Rate: {totalTrades ? ((winningTrades / totalTrades) * 100).toFixed(2) : 0}%</p>
          <p>Total Gain/Loss: {totalGainLoss.toFixed(2)}</p>
        </div>

        {indicators ? (
          <SignalDashboard
            ema20={indicators.ema20}
            ema50={indicators.ema50}
            ema20Prev={indicators.ema20Prev}
            ema50Prev={indicators.ema50Prev}
            ema20_1W={indicators.ema20_1W}
            ema50_1W={indicators.ema50_1W}
            rsi={indicators.rsi}
            macdLine={indicators.macdLine}
            signalLine={indicators.signalLine}
            macdLine_4H={indicators.macdLine_4H}
            signalLine_4H={indicators.signalLine_4H}
            plusDI={indicators.plusDI}
            minusDI={indicators.minusDI}
            adx={indicators.adx}
            atrPct={indicators.atrPct}
            kalman={indicators.kalman}
            close={indicators.close}
            groqAnalysis={groqAnalysis}
          />
        ) : (
          <p>Loading indicators...</p>
        )}
      </div>

      {entries.length > 0 && (
        <button className="toggle-table-btn" onClick={toggleTable}>
          {showTable ? 'Sembunyikan Hasil' : 'Lihat Hasil'}
        </button>
      )}

      {entries.length > 0 && showTable ? (
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Ticker</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Hasil</th>
              <th>% Gain</th>
              <th>Alasan</th>
              <th>Emosi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((e, i) => (
                <tr key={i}>
                  <td>{e.date}</td>
                  <td>{e.ticker}</td>
                  <td>{e.entry}</td>
                  <td>{e.exit}</td>
                  <td>{calcResult(e.entry, e.exit)}</td>
                  <td>{calcGain(e.entry, e.exit)}%</td>
                  <td>{e.reason || 'N/A'}</td>
                  <td>{e.emotion || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleDelete(i)}>Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">Tidak ada data entri.</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : entries.length === 0 && showTable ? (
        <p>Tidak ada data entri untuk ditampilkan.</p>
      ) : null}

      <TVChart symbol={`IDX:${ticker}`} />
    </div>
  );
};

export default TradingDiary;
