import React, { useState, useEffect, useRef } from 'react';

// Komponen TradingView Chart (Diperbaiki dengan cleanup)
const TVChart = ({ symbol = "IDX:BBCA" }) => {
  const containerRef = useRef(null);

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
      container_id: container.id
    };

    const widget = new window.TradingView.widget(widgetOptions);

    return () => {
      // Cleanup widget saat komponen di-unmount
      if (widget && typeof widget.remove === 'function') {
        widget.remove();
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
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('tradingview-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: "350px" }} />;
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

  // Simulasi analisis AI
  const fetchGroqAnalysis = async () => {
    try {
      // Implementasi sebenarnya menggunakan API
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
    if (!date || !ticker || !entry || !exit) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    const newEntry = {
      ...form,
      entry: Number(parseFloat(entry).toFixed(2)),
      exit: Number(parseFloat(exit).toFixed(2))
    };

    setEntries(prev => [...prev, newEntry]);
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
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Firman Trading Diary</h1>

      {/* Form Input */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
          style={{ padding: '8px' }}
        />
        <input
          name="ticker"
          placeholder="Ticker (ex: BBCA)"
          value={form.ticker}
          onChange={handleChange}
          required
          style={{ padding: '8px' }}
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
          style={{ padding: '8px' }}
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
          style={{ padding: '8px' }}
        />
        <input
          name="reason"
          placeholder="Alasan Setup"
          value={form.reason}
          onChange={handleChange}
          style={{ padding: '8px' }}
        />
        <input
          name="emotion"
          placeholder="Catatan Emosi"
          value={form.emotion}
          onChange={handleChange}
          style={{ padding: '8px' }}
        />
        <button 
          onClick={handleAdd}
          style={{ 
            gridColumn: '1 / -1',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          + Tambah Entry
        </button>
      </div>

      {/* TradingView Chart */}
      <TVChart symbol={`IDX:${ticker}`} />

      {/* Ringkasan Performa */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        margin: '20px 0',
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Total Trade</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTrades}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Win Rate</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Gain/Loss</h3>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: totalGainLoss >= 0 ? 'green' : 'red'
          }}>
            {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Toggle Tabel */}
      <button 
        onClick={() => setShowTable
