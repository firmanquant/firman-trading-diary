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
    basePrice = 8000; // Harga dasar tinggi
    range = 1000; // Rentang fluktuasi
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
    basePrice: basePrice + variation,
    range,
  };
};

// Fungsi simulasi untuk menghitung indikator berdasarkan harga penutupan
const simulateIndicators = (closePrice) => {
  const ema20 = closePrice * 1.02;
  const ema50 = closePrice * 1.01;
  const ema20Prev = closePrice * 1.015;
  const ema50Prev = closePrice * 1.005;
  const rsi = Math.random() * 100;
  const macdLine = (Math.random() - 0.5) * 2;
  const signalLine = macdLine * 0.9;
  const plusDI = Math.random() * 50;
  const minusDI = Math.random() * 50;
  const adx = Math.random() * 50;
  const kalman = closePrice * 0.99;

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
  const [currentClose, setCurrentClose] = useState(() => {
    const stock = simulateStockPrice('BBCA');
    return stock.basePrice + (Math.random() - 0.5) * stock.range;
  });

  // Perbarui harga penutupan saat ticker berubah
  useEffect(() => {
    const selectedStock = simulateStockPrice(ticker);
    const newBasePrice = selectedStock.basePrice;
    const newPrice = newBasePrice + (Math.random() - 0.5) * selectedStock.range;
    setCurrentClose(newPrice);
  }, [ticker]);

  // Simulasi fluktuasi harga setiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClose(prev => {
        const selectedStock = simulateStockPrice(ticker);
        const fluctuation = (Math.random() - 0.5) * selectedStock.range * 0.1; // Fluktuasi lebih kecil
        return prev + fluctuation;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [ticker]);

  // Simpan entries ke localStorage setiap kali entries berubah
  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const indicators = simulateIndicators(currentClose);

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
          close={currentClose}
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
