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

  return <div id="tv_chart_container" style={{ height: "500px" }} />;
};

// Fungsi untuk menghasilkan harga penutupan simulasi berdasarkan ticker
const simulateStockPrice = (ticker) => {
  // Gunakan karakter pertama ticker untuk menentukan kategori saham (simulasi sederhana)
  const firstChar = ticker.charAt(0).toUpperCase();
  let basePrice, range;

  // Simulasi kategori saham berdasarkan huruf awal (A-E: blue chip, F-J: menengah, K-Z: kecil)
  if (firstChar >= 'A' && firstChar <= 'E') {
    // Blue chip (contoh: BBCA, BBNI) - Harga tinggi
    basePrice = 8000;
    range = 1000;
  } else if (firstChar >= 'F' && firstChar <= 'J') {
    // Saham menengah (contoh: INDF, ICBP) - Harga menengah
    basePrice = 4000;
    range = 500;
  } else {
    // Saham kecil (contoh: KPIG, ZBRA) - Harga rendah
    basePrice = 500;
    range = 100;
  }

  // Gunakan ticker untuk menghasilkan variasi unik (menggunakan hash sederhana)
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variation = (hash % 1000) - 500; // Variasi acak berdasarkan ticker (-500 hingga +500)

  return {
    close: basePrice + variation + (Math.random() - 0.5) * range, // Harga penutupan simulasi
    closePrev: basePrice + variation + (Math.random() - 0.5) * range * 0.9, // Harga penutupan kemarin
  };
};

// Fungsi simulasi untuk menghitung indikator berdasarkan harga penutupan kemarin
const simulateIndicators = (close, closePrev) => {
  // Simulasi EMA (menggunakan pendekatan sederhana karena tidak ada data historis)
  const alpha20 = 2 / (20 + 1);
  const alpha50 = 2 / (50 + 1);
  const ema20 = closePrev * (1 - alpha20) + close * alpha20; // Simulasi EMA20
  const ema50 = closePrev * (1 - alpha50) + close * alpha50; // Simulasi EMA50
  const ema20Prev = closePrev * (1 - alpha20) + (closePrev * 0.99) * alpha20; // Simulasi EMA20 kemarin
  const ema50Prev = closePrev * (1 - alpha50) + (closePrev * 0.99) * alpha50; // Simulasi EMA50 kemarin

  // Simulasi RSI (menggunakan perubahan harga sederhana)
  const change = close - closePrev;
  const gain = change > 0 ? change : 0;
  const loss = change < 0 ? -change : 0;
  const avgGain = gain * 0.5; // Simulasi rata-rata gain
  const avgLoss = loss * 0.5; // Simulasi rata-rata loss
  const rs = avgGain / (avgLoss || 1); // Hindari pembagian dengan 0
  const rsi = 100 - (100 / (1 + rs));

  // Simulasi MACD
  const macdFast = closePrev * (1 - 2 / (12 + 1)) + close * (2 / (12 + 1)); // Simulasi EMA12
  const macdSlow = closePrev * (1 - 2 / (26 + 1)) + close * (2 / (26 + 1)); // Simulasi EMA26
  const macdLine = macdFast - macdSlow;
  const signalLine = macdLine * 0.9; // Simulasi signal line (pendekatan sederhana)

  // Simulasi DMI/ADX
  const plusDI = Math.random() * 50; // Simulasi +DI
  const minusDI = Math.random() * 50; // Simulasi -DI
  const adx = Math.random() * 50; // Simulasi ADX

  // Simulasi Kalman Filter
  const kalmanGain = 0.5;
  const kalman = closePrev + kalmanGain * (close - closePrev);

  return {
    ema20,
    ema50,
    ema20Prev,
    ema50Prev,
    rsi,
    macdLine,
    signalLine,
    plusDI,
    minusDI,
    adx,
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
  const [prices, setPrices] = useState(() => simulateStockPrice('BBCA'));

  // Perbarui harga penutupan saat ticker berubah
  useEffect(() => {
    const newPrices = simulateStockPrice(ticker);
    setPrices(newPrices);
  }, [ticker]);

  // Simpan entries ke localStorage setiap kali entries berubah
  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const indicators = simulateIndicators(prices.close, prices.closePrev);

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
          rsi={indicators.rsi}
          macdLine={indicators.macdLine}
          signalLine={indicators.signalLine}
          plusDI={indicators.plusDI}
          minusDI={indicators.minusDI}
          adx={indicators.adx}
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
