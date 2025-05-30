// TradingDiary.js (Final: Layout Presisi)

import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

const TVChart = ({ symbol = "IDX:BBCA" }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container || !window.TradingView) return;
    container.innerHTML = '';

    widgetRef.current = new window.TradingView.widget({
      symbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      autosize: true,
      container_id: 'tv-container'
    });

    return () => {
      if (widgetRef.current?.remove) widgetRef.current.remove();
    };
  }, [symbol]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.TradingView) return;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.id = 'tv-script';
    document.head.appendChild(script);
    return () => {
      const old = document.getElementById('tv-script');
      if (old) document.head.removeChild(old);
    };
  }, []);

  return <div id="tv-container" ref={containerRef} className="tv-chart" />;
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
    date: '', ticker: '', entry: '', exit: '', reason: '', emotion: ''
  });

  const [ticker, setTicker] = useState('BBCA');
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const fetchGroqAnalysis = async () => {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Analisis teknikal saham ${ticker}` })
      });
      const data = await res.json();
      setGroqAnalysis(data.response || 'Tidak ada respon.');
    } catch {
      setGroqAnalysis('Gagal memuat analisis.');
    }
  };

  useEffect(() => {
    if (ticker) fetchGroqAnalysis();
  }, [ticker]);

  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'ticker') setTicker(value.toUpperCase());
  };

  const handleAdd = () => {
    const { date, ticker, entry, exit } = form;
    if (!date || !ticker || !entry || !exit) return alert('Lengkapi semua kolom wajib.');

    const entryNum = parseFloat(entry);
    const exitNum = parseFloat(exit);
    if (isNaN(entryNum) || entryNum <= 0 || isNaN(exitNum) || exitNum <= 0)
      return alert('Entry dan Exit harus angka positif.');

    setEntries(prev => [...prev, { ...form, entry: entryNum, exit: exitNum }]);
    setForm({ date: '', ticker: '', entry: '', exit: '', reason: '', emotion: '' });
  };

  const handleDelete = idx => {
    if (window.confirm('Yakin hapus entri ini?')) {
      setEntries(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const stats = entries.reduce((acc, e) => {
    const gain = e.exit - e.entry;
    acc.total++;
    acc.gain += gain;
    if (gain > 0) acc.wins++;
    return acc;
  }, { total: 0, gain: 0, wins: 0 });

  const winRate = stats.total ? (stats.wins / stats.total) * 100 : 0;

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="ticker" placeholder="Ticker" value={form.ticker} onChange={handleChange} />
        <input name="entry" type="number" placeholder="Entry" value={form.entry} onChange={handleChange} />
        <input name="exit" type="number" placeholder="Exit" value={form.exit} onChange={handleChange} />
        <input name="reason" placeholder="Alasan" value={form.reason} onChange={handleChange} />
        <input name="emotion" placeholder="Emosi" value={form.emotion} onChange={handleChange} />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      <div className="analysis-wrapper">
        <div className="groq-box">
          <h3>Analisis Groq:</h3>
          <p>{groqAnalysis}</p>
        </div>

        <TVChart symbol={`IDX:${ticker}`} />

        <div className="mini-dashboard-box">
          <SignalDashboard
            ema20={50} ema50={45} ema20Prev={48} ema50Prev={46} ema20_1W={49} ema50_1W={47}
            rsi={60} macdLine={1.5} signalLine={1.2} macdLine_4H={0.5} signalLine_4H={0.4}
            plusDI={25} minusDI={15} adx={30} atrPct={1.8}
            kalman={form.entry || 100} close={form.exit || 105}
            groqAnalysis={groqAnalysis}
          />
        </div>
      </div>

      <div className="summary-dashboard-container">
        <div className="summary-card"><h2>Total Trade</h2><p>{stats.total}</p></div>
        <div className="summary-card"><h2>Win Rate</h2><p>{winRate.toFixed(1)}%</p></div>
        <div className="summary-card"><h2>Gain/Loss</h2><p style={{ color: stats.gain >= 0 ? 'limegreen' : 'red' }}>{stats
