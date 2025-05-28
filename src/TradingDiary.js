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

  return <div id="tv_chart_container" style={{ height: "400px" }} />;
};

// Fungsi untuk menghasilkan data historis simulasi (50 bar terakhir)
const simulateHistoricalData = (ticker, numBars = 50) => {
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
    const close = prevClose + (Math.random() - 0.5) * range * 0.1;
    const high = close + Math.random() * range * 0.05;
    const low = close - Math.random() * range * 0.05;
    historicalData.push({ close, high, low });
    prevClose = close;
  }

  return historicalData.reverse(); // Bar terbaru di indeks 0
};

// Fungsi untuk menghitung EMA
const calcEMA = (prices, length) => {
  const alpha = 2 / (length + 1);
  let ema = prices[prices.length - 1].close; // Mulai dengan harga pertama
  for (let i = prices.length - 2; i >= 0; i--) {
    ema = prices[i].close * alpha + ema * (1 - alpha);
  }
  return ema;
};

// Fungsi untuk menghitung RSI
const calcRSI = (prices, length) => {
  let gains = 0, losses = 0;
  for (let i = 0; i < length && i < prices.length - 1; i++) {
    const change = prices[i].close - prices[i + 1].close;
    if (change > 0) gains += change;
    else losses += -change;
  }
  const avgGain = gains / length;
  const avgLoss = losses / length;
  const rs = avgGain / (avgLoss || 1);
  return 100 - (100 / (1 + rs));
};

// Fungsi untuk menghitung MACD
const calcMACD = (prices, fastLength, slowLength, signalLength) => {
  const emaFast = calcEMA(prices, fastLength);
  const emaSlow = calcEMA(prices, slowLength);
  const macdLine = emaFast - emaSlow;

  // Simulasi signal line (EMA dari MACD Line)
  const macdValues = [];
  for (let i = prices.length - 1; i >= 0; i--) {
    const emaFast_i = calcEMA(prices.slice(i), fastLength);
    const emaSlow_i = calcEMA(prices.slice(i), slowLength);
    macdValues.push(emaFast_i - emaSlow_i);
  }
  const signalLine = calcEMA(macdValues.map(val => ({ close: val })), signalLength);

  return { macdLine, signalLine };
};

// Fungsi untuk menghitung DMI/ADX
const calcDMI = (prices, diLength, adxSmooth) => {
  let trSum = 0, plusDMSum = 0, minusDMSum = 0;
  for (let i = 0; i < diLength && i < prices.length - 1; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevHigh = prices[i + 1].high;
    const prevLow = prices[i + 1].low;
    const prevClose = prices[i + 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
    const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;

    trSum += tr;
    plusDMSum += plusDM;
    minusDMSum += minusDM;
  }

  const plusDI = (plusDMSum / trSum) * 100;
  const minusDI = (minusDMSum / trSum) * 100;

  // Simulasi ADX
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1) * 100;
  const adxValues = Array(adxSmooth).fill(dx); // Simulasi sederhana
  const adx = calcEMA(adxValues.map(val => ({ close: val })), adxSmooth);

  return { plusDI, minusDI, adx };
};

// Fungsi untuk menghitung Kalman Filter
const calcKalman = (prices, gain) => {
  let kalman = prices[prices.length - 1].close;
  for (let i = prices.length - 2; i >= 0; i--) {
    kalman = kalman + gain * (prices[i].close - kalman);
  }
  return kalman;
};

// Fungsi untuk menghitung ATR
const calcATR = (prices, length) => {
  let trSum = 0;
  for (let i = 0; i < length && i < prices.length - 1; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i + 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trSum += tr;
  }
  return trSum / length;
};

// Fungsi untuk menghitung indikator berdasarkan data historis
const simulateIndicators = (historicalData) => {
  const close = historicalData[0].close;

  // EMA20 dan EMA50
  const ema20 = calcEMA(historicalData, 20);
  const ema50 = calcEMA(historicalData, 50);
  const ema20Prev = calcEMA(historicalData.slice(1), 20);
  const ema50Prev = calcEMA(historicalData.slice(1), 50);

  // Trend 1W (simulasi dengan mengelompokkan data harian ke mingguan)
  const weeklyData = [];
  for (let i = 0; i < historicalData.length; i += 5) {
    const weekSlice = historicalData.slice(i, i + 5);
    if (weekSlice.length > 0) {
      const close = weekSlice[0].close;
      const high = Math.max(...weekSlice.map(d => d.high));
      const low = Math.min(...weekSlice.map(d => d.low));
      weeklyData.push({ close, high, low });
    }
  }
  const ema20_1W = calcEMA(weeklyData, 20);
  const ema50_1W = calcEMA(weeklyData, 50);

  // RSI
  const rsi = calcRSI(historicalData, 14);

  // MACD
  const { macdLine, signalLine } = calcMACD(historicalData, 12, 26, 9);

  // MACD 4H (simulasi dengan mengelompokkan data harian ke 4 jam)
  const fourHourData = [];
  for (let i = 0; i < historicalData.length; i += 2) {
    const fourHourSlice = historicalData.slice(i, i + 2);
    if (fourHourSlice.length > 0) {
      const close = fourHourSlice[0].close;
      const high = Math.max(...fourHourSlice.map(d => d.high));
      const low = Math.min(...fourHourSlice.map(d => d.low));
      fourHourData.push({ close, high, low });
    }
  }
  const { macdLine: macdLine_4H, signalLine: signalLine_4H } = calcMACD(fourHourData, 12, 26, 9);

  // DMI/ADX
  const { plusDI, minusDI, adx } = calcDMI(historicalData, 14, 14);

  // Kalman Filter
  const kalman = calcKalman(historicalData, 0.5);

  // ATR
  const atrValue = calcATR(historicalData, 14);
  const atrPct = (atrValue / close) * 100;

  return {
    ema20,
    ema50,
    ema20Prev,
    ema50Prev,
    ema20_1W,
    ema50_1W,
    rsi,
    macdLine,
    signalLine,
    macdLine_4H,
    signalLine_4H,
    plusDI,
    minusDI,
    adx,
    atrPct,
    kalman,
    close,
  };
};

const TradingDiary = () => {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('tradingEntries');
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
  const [historicalData, setHistoricalData] = useState(() => simulateHistoricalData('BBCA'));

  useEffect(() => {
    const newHistoricalData = simulateHistoricalData(ticker);
    setHistoricalData(newHistoricalData);
  }, [ticker]);

  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const indicators = simulateIndicators(historicalData);

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
    setEntries([...entries, newEntry]);
    setForm({ date: '', ticker: '', entry: '', exit: '', reason: '', emotion: '' });
    alert('Entri berhasil ditambahkan!');
  };

  const handleDelete = (index) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus entri ini?')) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
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

  return (
    <div className="container">
      <h1>📘 Firman Trading Diary</h1>

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
        />
      </div>

      {entries.length > 0 && (
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
            {entries.map((e, i) => (
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
            ))}
          </tbody>
        </table>
      )}

      <TVChart symbol={`IDX:${ticker}`} />
    </div>
  );
};

export default TradingDiary;
