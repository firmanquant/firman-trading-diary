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

// Fungsi untuk mengambil data historis dari API
const fetchHistoricalData = async (ticker, timeframe = 'daily') => {
  try {
    const response = await fetch(`/api/stock?ticker=${ticker}&timeframe=${timeframe}`);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    let timeSeries;
    if (timeframe === 'weekly') {
      timeSeries = data['Weekly Time Series'];
    } else if (timeframe === '4h') {
      timeSeries = data['Time Series (60min)'];
    } else {
      timeSeries = data['Time Series (Daily)'];
    }

    if (!timeSeries) {
      throw new Error('No time series data available');
    }

    const historicalData = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      close: parseFloat(values['4. close']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
    }));

    return historicalData.slice(0, 50); // Ambil 50 bar terakhir
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return [];
  }
};

// Fungsi untuk menghitung EMA
const calcEMA = (data, length) => {
  if (data.length < length) return NaN;
  const multiplier = 2.0 / (length + 1);
  let ema = data.slice(0, length).reduce((sum, val) => sum + val.close, 0) / length;
  for (let i = length; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
  }
  return ema;
};

// Fungsi untuk menghitung RSI
const calcRSI = (data, length) => {
  if (data.length < length + 1) return NaN;

  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) avgGain += change;
    else avgLoss -= change;
  }

  avgGain /= length;
  avgLoss /= length;

  for (let i = length + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = Math.max(0, change);
    const loss = Math.max(0, -change);
    avgGain = ((avgGain * (length - 1)) + gain) / length;
    avgLoss = ((avgLoss * (length - 1)) + loss) / length;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// Fungsi untuk menghitung MACD
const calcMACD = (data, fastLen, slowLen, signalLen) => {
  const fastEMA = calcEMA(data, fastLen);
  const slowEMA = calcEMA(data, slowLen);
  const macdLine = fastEMA - slowEMA;

  const macdLineHistory = [];
  for (let i = data.length - 1; i >= 0; i--) {
    const emaFast = calcEMA(data.slice(i), fastLen);
    const emaSlow = calcEMA(data.slice(i), slowLen);
    macdLineHistory.push(emaFast - emaSlow);
  }
  const signalLine = calcEMA(macdLineHistory.map(val => ({ close: val })), signalLen);

  return { macdLine, signalLine };
};

// Fungsi Wilder's Smoothing
const wilderSmoothing = (values, period) => {
  const smoothed = [];
  const sum = values.slice(0, period).reduce((a, b) => a + b, 0);
  smoothed.push(sum / period);

  for (let i = period; i < values.length; i++) {
    const prev = smoothed[smoothed.length - 1];
    const newValue = (prev * (period - 1) + values[i]) / period;
    smoothed.push(newValue);
  }
  return smoothed;
};

// Fungsi untuk menghitung DMI/ADX
const calcDMI = (highs, lows, closes, diLen, adxSmooth) => {
  const trValues = [];
  const plusDMValues = [];
  const minusDMValues = [];

  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i].high - lows[i].low,
      Math.max(
        Math.abs(highs[i].high - closes[i - 1].close),
        Math.abs(lows[i].low - closes[i - 1].close)
      )
    );
    trValues.push(tr);

    const upMove = highs[i].high - highs[i - 1].high;
    const downMove = lows[i - 1].low - lows[i].low;

    const plusDM = (upMove > downMove && upMove > 0) ? upMove : 0;
    const minusDM = (downMove > upMove && downMove > 0) ? downMove : 0;

    plusDMValues.push(plusDM);
    minusDMValues.push(minusDM);
  }

  const smoothedTR = wilderSmoothing(trValues, diLen);
  const smoothedPlusDM = wilderSmoothing(plusDMValues, diLen);
  const smoothedMinusDM = wilderSmoothing(minusDMValues, diLen);

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
    dxValues.push(100 * (diDiff / diSum));
  }

  const adx = wilderSmoothing(dxValues, adxSmooth);

  return {
    plusDI: plusDI[plusDI.length - 1],
    minusDI: minusDI[minusDI.length - 1],
    adx: adx[adx.length - 1],
  };
};

// Fungsi untuk menghitung Kalman Filter
const calcKalman = (data, gain) => {
  let kalman = data[data.length - 1].close;
  for (let i = data.length - 2; i >= 0; i--) {
    kalman = kalman + gain * (data[i].close - kalman);
  }
  return kalman;
};

// Fungsi untuk menghitung ATR
const calcATR = (data, length) => {
  let trSum = 0;
  for (let i = 0; i < length && i < data.length - 1; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i + 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trSum += tr;
  }
  return trSum / length;
};

// Fungsi untuk menghitung indikator
const calculateIndicators = (dailyData, weeklyData, fourHourData) => {
  const close = dailyData[0].close;

  // EMA20 dan EMA50 (Daily)
  const ema20 = calcEMA(dailyData, 20);
  const ema50 = calcEMA(dailyData, 50);
  const ema20Prev = calcEMA(dailyData.slice(1), 20);
  const ema50Prev = calcEMA(dailyData.slice(1), 50);

  // EMA20 dan EMA50 (Weekly untuk Trend 1W)
  const ema20_1W = calcEMA(weeklyData, 20);
  const ema50_1W = calcEMA(weeklyData, 50);

  // RSI (Daily)
  const rsi = calcRSI(dailyData, 14);

  // MACD (Daily)
  const { macdLine, signalLine } = calcMACD(dailyData, 12, 26, 9);

  // MACD 4H
  const { macdLine: macdLine_4H, signalLine: signalLine_4H } = calcMACD(fourHourData, 12, 26, 9);

  // DMI/ADX (Daily)
  const { plusDI, minusDI, adx } = calcDMI(dailyData, dailyData, dailyData, 14, 14);

  // Kalman Filter (Daily)
  const kalman = calcKalman(dailyData, 0.5);

  // ATR (Daily)
  const atrValue = calcATR(dailyData, 14);
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
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [fourHourData, setFourHourData] = useState([]);
  const [indicators, setIndicators] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const daily = await fetchHistoricalData(ticker, 'daily');
      const weekly = await fetchHistoricalData(ticker, 'weekly');
      let fourHour = await fetchHistoricalData(ticker, '4h');

      if (fourHour.length === 0) {
        fourHour = [];
        for (let i = 0; i < daily.length; i += 2) {
          const slice = daily.slice(i, i + 2);
          if (slice.length > 0) {
            const close = slice[0].close;
            const high = Math.max(...slice.map(d => d.high));
            const low = Math.min(...slice.map(d => d.low));
            fourHour.push({ close, high, low });
          }
        }
      }

      setDailyData(daily);
      setWeeklyData(weekly);
      setFourHourData(fourHour);

      if (daily.length > 0 && weekly.length > 0 && fourHour.length > 0) {
        const calculatedIndicators = calculateIndicators(daily, weekly, fourHour);
        setIndicators(calculatedIndicators);
      }
    };

    fetchData();
  }, [ticker]);

  useEffect(() => {
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
          />
        ) : (
          <p>Loading indicators...</p>
        )}
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
