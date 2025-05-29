import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

// Pastikan FirmanQuantStrategy tersedia
// Saya asumsikan FirmanQuantStrategy ada di file SignalDashboard.js
// Jika tidak, Anda perlu membuat file terpisah untuk FirmanQuantStrategy
import { FirmanQuantStrategy } from './SignalDashboard';

// Komponen TradingView Chart
const TVChart = ({ symbol = "IDX:BBCA" }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.TradingView) return;

    container.innerHTML = ""; // Reset chart

    const widgetOptions = {
      symbol,
      interval: "D",
      timezone: "Asia/Jakarta",
      theme: "dark",
      style: "1",
      locale: "id",
      autosize: true,
      container_id: "tv_chart_container"
    };

    widgetRef.current = new window.TradingView.widget(widgetOptions);

    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        widgetRef.current.remove();
      }
    };
  }, [symbol]);

  // Load script TradingView
  useEffect(() => {
    if (window.TradingView) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.id = 'tradingview-script';
    
    script.onload = () => console.log('TradingView script loaded');
    script.onerror = () => console.error('Failed to load TradingView script');
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('tradingview-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return <div id="tv_chart_container" ref={containerRef} style={{ height: "350px" }} />;
};

const TradingDiary = () => {
  // State management
  const [entries, setEntries] = useState(() => {
    try {
      const savedEntries = localStorage.getItem('tradingEntries');
      return savedEntries ? JSON.parse(savedEntries) : [];
    } catch {
      return [];
    }
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
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [indicators, setIndicators] = useState({
    ema20: null,
    ema50: null,
    ema20Prev: null,
    ema50Prev: null,
    ema20_1W: null,
    ema50_1W: null,
    rsi: null,
    macdLine: null,
    signalLine: null,
    macdLine_4H: null,
    signalLine_4H: null,
    plusDI: null,
    minusDI: null,
    adx: null,
    atrPct: null,
    kalman: null,
    close: null
  });

  const strategyRef = useRef(null);

  // Inisialisasi strategi
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
      volumeThreshold: 1.5
    };

    strategyRef.current = new FirmanQuantStrategy(strategyParams);

    // Inisialisasi dengan data awal
    const initialData = {
      open: 9400, // Harga awal (contoh dari tampilan aplikasi)
      high: 9400 * 1.01,
      low: 9400 * 0.99,
      close: 9400,
      volume: 236985000, // Volume dari tampilan aplikasi
      timestamp: Date.now()
    };
    strategyRef.current.processNewData(initialData);

    // Update indikator awal
    const idx = strategyRef.current.closes.length - 1;
    setIndicators({
      ema20: strategyRef.current.ema20Values[idx],
      ema50: strategyRef.current.ema50Values[idx],
      ema20Prev: idx > 0 ? strategyRef.current.ema20Values[idx - 1] : null,
      ema50Prev: idx > 0 ? strategyRef.current.ema50Values[idx - 1] : null,
      ema20_1W: strategyRef.current.ema20Values[idx] * 1.01, // Simulasi untuk 1W
      ema50_1W: strategyRef.current.ema50Values[idx] * 1.005, // Simulasi untuk 1W
      rsi: strategyRef.current.rsiValues[idx],
      macdLine: strategyRef.current.macdLineValues[idx],
      signalLine: strategyRef.current.signalLineValues[idx],
      macdLine_4H: strategyRef.current.macdLineValues[idx] * 0.8, // Simulasi untuk 4H
      signalLine_4H: strategyRef.current.signalLineValues[idx] * 0.8, // Simulasi untuk 4H
      plusDI: strategyRef.current.plusDIValues[idx],
      minusDI: strategyRef.current.minusDIValues[idx],
      adx: strategyRef.current.adxValues[idx],
      atrPct: 2.0, // Contoh dari tampilan aplikasi
      kalman: strategyRef.current.kalmanValues[idx],
      close: strategyRef.current.closes[idx]
    });
  }, []);

  // Simulasi analisis AI (seperti versi sukses)
  const fetchGroqAnalysis = async () => {
    try {
      const fakeAnalysis = `Analisis teknis ${ticker}: Tren bullish terdeteksi. 
      Rekomendasi: Akumulasi pada area support. Target harga +5% dari level saat ini.`;
      
      setGroqAnalysis(fakeAnalysis);
    } catch (error) {
      setGroqAnalysis(`Gagal memuat analisis: ${error.message}`);
    }
  };

  // Efek untuk analisis saham
  useEffect(() => {
    if (ticker) {
      fetchGroqAnalysis();
    }
  }, [ticker]);

  // Penyimpanan data ke localStorage
  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  // Handler functions
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'ticker' && value.trim()) {
      setTicker(value.toUpperCase());
    }
  };

  const handleAdd = () => {
    const { date, ticker, entry, exit } = form;
    const entryNum = Number(entry);
    const exitNum = Number(exit);

    if (!date || !ticker || !entry || !exit) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    if (isNaN(entryNum) || entryNum <= 0 || isNaN(exitNum) || exitNum <= 0) {
      alert('Harga Entry dan Exit harus angka positif!');
      return;
    }

    const newEntry = {
      ...form,
      entry: Number(parseFloat(entry).toFixed(2)),
      exit: Number(parseFloat(exit).toFixed(2))
    };

    setEntries(prev => [...prev, newEntry]);

    // Proses data dengan strategi
    if (strategyRef.current) {
      strategyRef.current.processNewData({
        open: Number(form.entry),
        high: Number(form.entry) * 1.01,
        low: Number(form.entry) * 0.99,
        close: Number(form.exit),
        volume: 1000000,
        timestamp: Date.now()
      });

      // Update indikator
      const idx = strategyRef.current.closes.length - 1;
      setIndicators({
        ema20: strategyRef.current.ema20Values[idx],
        ema50: strategyRef.current.ema50Values[idx],
        ema20Prev: idx > 0 ? strategyRef.current.ema20Values[idx - 1] : null,
        ema50Prev: idx > 0 ? strategyRef.current.ema50Values[idx - 1] : null,
        ema20_1W: strategyRef.current.ema20Values[idx] * 1.01, // Simulasi untuk 1W
        ema50_1W: strategyRef.current.ema50Values[idx] * 1.005, // Simulasi untuk 1W
        rsi: strategyRef.current.rsiValues[idx],
        macdLine: strategyRef.current.macdLineValues[idx],
        signalLine: strategyRef.current.signalLineValues[idx],
        macdLine_4H: strategyRef.current.macdLineValues[idx] * 0.8, // Simulasi untuk 4H
        signalLine_4H: strategyRef.current.signalLineValues[idx] * 0.8, // Simulasi untuk 4H
        plusDI: strategyRef.current.plusDIValues[idx],
        minusDI: strategyRef.current.minusDIValues[idx],
        adx: strategyRef.current.adxValues[idx],
        atrPct: 2.0, // Contoh dari tampilan aplikasi
        kalman: strategyRef.current.kalmanValues[idx],
        close: strategyRef.current.closes[idx]
      });
    }

    setForm({
      date: '',
      ticker: '',
      entry: '',
      exit: '',
      reason: '',
      emotion: ''
    });
  };

  const handleDelete = (index) => {
    if (window.confirm('Hapus entri ini?')) {
      setEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Perhitungan statistik
  const calculateStats = () => {
    const stats = {
      totalTrades: entries.length,
      winningTrades: 0,
      totalGainLoss: 0,
      winRate: 0
    };

    entries.forEach(e => {
      const result = e.exit - e.entry;
      stats.totalGainLoss += result;
      if (result > 0) stats.winningTrades++;
    });

    if (stats.totalTrades > 0) {
      stats.winRate = (stats.winningTrades / stats.totalTrades) * 100;
    }

    return stats;
  };

  const { totalTrades, winRate, totalGainLoss } = calculateStats();

  return (
    <div className="container">
      <h1>Firman Trading Diary</h1>

      {/* Form Input */}
      <div className="form">
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="ticker"
          placeholder="Ticker (ex: BBCA)"
          value={form.ticker}
          onChange={handleChange}
          required
        />
        <input
          name="entry"
          type="number"
          placeholder="Entry Price"
          value={form.entry}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
        />
        <input
          name="exit"
          type="number"
          placeholder="Exit Price"
          value={form.exit}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
        />
        <input
          name="reason"
          placeholder="Alasan Setup"
          value={form.reason}
          onChange={handleChange}
        />
        <input
          name="emotion"
          placeholder="Catatan Emosi"
          value={form.emotion}
          onChange={handleChange}
        />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      {/* TradingView Chart */}
      <TVChart symbol={`IDX:${ticker}`} />

      {/* Ringkasan Performa dan Dashboard */}
      <div className="summary-dashboard-container">
        <div className="summary-card">
          <h2>📈 Ringkasan Performa</h2>
          <p><strong>Total Trade:</strong> {totalTrades}</p>
          <p><strong>Win Rate:</strong> {winRate.toFixed(1)}%</p>
          <p>
            <strong>Gain/Loss:</strong> 
            <span style={{ color: totalGainLoss >= 0 ? 'green' : 'red' }}>
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)}
            </span>
          </p>
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
          groqAnalysis={groqAnalysis}
        />
      </div>

      {/* Toggle Tabel */}
      <button 
        className="toggle-table-btn"
        onClick={() => setShowTable(prev => !prev)}
      >
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      {/* Tabel Entri */}
      {showTable && (
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Ticker</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Profit</th>
              <th>Alasan</th>
              <th>Emosi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.ticker}</td>
                <td>{entry.entry.toFixed(2)}</td>
                <td>{entry.exit.toFixed(2)}</td>
                <td style={{ color: (entry.exit - entry.entry) >= 0 ? 'green' : 'red' }}>
                  {(entry.exit - entry.entry).toFixed(2)}
                </td>
                <td>{entry.reason}</td>
                <td>{entry.emotion}</td>
                <td>
                  <button onClick={() => handleDelete(index)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingDiary;
