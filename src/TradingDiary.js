import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

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

  // Fetch analisis Grok
  const fetchGroqAnalysis = async () => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Berikan analisis teknikal untuk saham ${ticker} di pasar IDX.`
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGroqAnalysis(data.response);
      } else {
        setGroqAnalysis('Gagal memuat analisis: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      setGroqAnalysis('Gagal memuat analisis: ' + error.message);
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

    // Update indikator dengan data baru
    setIndicators(prev => ({
      ...prev,
      close: Number(form.exit),
      // Simulasi data lain untuk SignalDashboard
      // Dalam aplikasi nyata, data ini harus diambil dari FirmanQuantStrategy
      ema20: Number(form.exit) * 1.02, // Contoh
      ema50: Number(form.exit) * 1.01, // Contoh
      ema20Prev: prev.ema20 || Number(form.exit) * 1.02,
      ema50Prev: prev.ema50 || Number(form.exit) * 1.01,
      ema20_1W: Number(form.exit) * 1.03, // Contoh
      ema50_1W: Number(form.exit) * 1.02, // Contoh
      rsi: 69, // Contoh
      macdLine: 0.5, // Contoh
      signalLine: 0.3, // Contoh
      macdLine_4H: 0.4, // Contoh
      signalLine_4H: 0.2, // Contoh
      plusDI: 25, // Contoh
      minusDI: 15, // Contoh
      adx: 76.01, // Contoh
      atrPct: 2.0, // Contoh
      kalman: Number(form.exit) * 0.99 // Contoh
    }));

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
