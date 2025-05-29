import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

// Komponen TradingView Chart
const TVChart = ({ symbol = "IDX:BBCA" }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container || !window.TradingView) return;

    container.innerHTML = '';

    const widgetOptions = {
      symbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      autosize: true,
      container_id: 'tradingview-chart',
    };

    widgetRef.current = new window.TradingView.widget(widgetOptions);

    return () => {
      if (widgetRef.current?.remove) {
        widgetRef.current.remove();
      }
    };
  }, [symbol]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.TradingView) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.id = 'tradingview-script';

    script.onload = () => console.log('TradingView script loaded');
    script.onerror = () => console.error('Failed to load TradingView script');

    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('tradingview-script');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  return <div id="tradingview-chart" ref={containerRef} style={{ height: 350 }} />;
};

const TradingDiary = () => {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('tradingEntries');
      return saved ? JSON.parse(saved) : [];
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
    emotion: '',
  });

  const [ticker, setTicker] = useState('BBCA');
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const fetchGroqAnalysis = async () => {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Analisis teknikal saham ${ticker}` }),
      });

      const data = await res.json();
      setGroqAnalysis(data.response || 'Tidak ada respon.');
    } catch (error) {
      setGroqAnalysis('Gagal memuat analisis.');
    }
  };

  useEffect(() => {
    if (ticker) fetchGroqAnalysis();
  }, [ticker]);

  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'ticker') setTicker(value.toUpperCase());
  };

  const handleAdd = () => {
    const { date, ticker, entry, exit } = form;
    const entryNum = parseFloat(entry);
    const exitNum = parseFloat(exit);

    if (!date || !ticker || !entry || !exit) {
      alert('Isi semua kolom wajib!');
      return;
    }

    if (isNaN(entryNum) || isNaN(exitNum) || entryNum <= 0 || exitNum <= 0) {
      alert('Entry dan Exit harus angka positif.');
      return;
    }

    const newEntry = {
      ...form,
      entry: entryNum,
      exit: exitNum,
    };

    setEntries((prev) => [...prev, newEntry]);

    setForm({
      date: '',
      ticker: '',
      entry: '',
      exit: '',
      reason: '',
      emotion: '',
    });
  };

  const handleDelete = (index) => {
    if (window.confirm('Hapus entri ini?')) {
      setEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const stats = entries.reduce(
    (acc, e) => {
      const profit = e.exit - e.entry;
      acc.total += 1;
      acc.gain += profit;
      if (profit > 0) acc.wins += 1;
      return acc;
    },
    { total: 0, gain: 0, wins: 0 }
  );

  const winRate = stats.total ? ((stats.wins / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="container">
      <h1>Firman Trading Diary</h1>

      <div className="form">
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="ticker" placeholder="Ticker (contoh: BBCA)" value={form.ticker} onChange={handleChange} />
        <input name="entry" type="number" placeholder="Entry Price" value={form.entry} onChange={handleChange} />
        <input name="exit" type="number" placeholder="Exit Price" value={form.exit} onChange={handleChange} />
        <input name="reason" placeholder="Alasan Setup" value={form.reason} onChange={handleChange} />
        <input name="emotion" placeholder="Catatan Emosi" value={form.emotion} onChange={handleChange} />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      <TVChart symbol={`IDX:${ticker}`} />

      <div className="summary-dashboard-container">
        <div className="summary-card">
          <h2>Total Trade</h2>
          <p>{stats.total}</p>
        </div>
        <div className="summary-card">
          <h2>Win Rate</h2>
          <p>{winRate}%</p>
        </div>
        <div className="summary-card">
          <h2>Gain/Loss</h2>
          <p style={{ color: stats.gain >= 0 ? 'green' : 'red' }}>
            {stats.gain >= 0 ? '+' : ''}
            {stats.gain.toFixed(2)}
          </p>
        </div>
      </div>

      <button className="toggle-table-btn" onClick={() => setShowTable((p) => !p)}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

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
            {entries.map((e, i) => (
              <tr key={i}>
                <td>{e.date}</td>
                <td>{e.ticker}</td>
                <td>{e.entry.toFixed(2)}</td>
                <td>{e.exit.toFixed(2)}</td>
                <td style={{ color: e.exit - e.entry >= 0 ? 'green' : 'red' }}>
                  {(e.exit - e.entry).toFixed(2)}
                </td>
                <td>{e.reason}</td>
                <td>{e.emotion}</td>
                <td>
                  <button onClick={() => handleDelete(i)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SignalDashboard
        ema20={50}
        ema50={45}
        ema20Prev={48}
        ema50Prev={46}
        ema20_1W={49}
        ema50_1W={47}
        rsi={69}
        macdLine={1.5}
        signalLine={1.9}
        macdLine_4H={-0.2}
        signalLine_4H={0.1}
        plusDI={30}
        minusDI={25}
        adx={76.01}
        atrPct={0.67}
        kalman={72.52}
        close={100}
        groqAnalysis={groqAnalysis}
      />
    </div>
  );
};

export default TradingDiary;
