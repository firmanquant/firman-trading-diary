// TradingDiary.js (FINAL LENGKAP + Perbaikan Layout, Logika, dan Tabel)
import React, { useState, useRef, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';

const TradingDiary = () => {
  const [date, setDate] = useState('');
  const [symbol, setSymbol] = useState('BBCA');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [entries, setEntries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  const fullSymbol = `IDX:${symbol}`;

  useEffect(() => {
    if (!window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    widgetRef.current = new window.TradingView.widget({
      symbol: fullSymbol,
      interval: 'D',
      container_id: 'tv-container',
      theme: 'dark',
      locale: 'id',
      autosize: true,
    });
    return () => widgetRef.current?.remove();
  }, [fullSymbol]);

  const handleAddEntry = () => {
    if (!symbol || !entry || !exit || !date) return;
    const gainLoss = ((exit - entry) / entry) * 100;
    setEntries(prev => [...prev, {
      date,
      symbol,
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      gainLoss: gainLoss.toFixed(2),
      reason,
      emotion
    }]);
    setDate('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const totalTrade = entries.length;
  const winRate = totalTrade > 0
    ? (entries.filter(e => e.gainLoss > 0).length / totalTrade * 100).toFixed(1)
    : 0;
  const totalGain = entries.reduce((acc, e) => acc + parseFloat(e.gainLoss), 0).toFixed(2);

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="Ticker" />
        <input value={entry} onChange={e => setEntry(e.target.value)} placeholder="Entry" type="number" />
        <input value={exit} onChange={e => setExit(e.target.value)} placeholder="Exit" type="number" />
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleAddEntry}>+ Tambah Entry</button>
      </div>

      <div className="summary-dashboard-container">
        <div className="summary-card">
          <h2>Total Trade</h2>
          <p>{totalTrade}</p>
        </div>
        <div className="summary-card">
          <h2>Win Rate</h2>
          <p>{winRate}%</p>
        </div>
        <div className="summary-card">
          <h2>Gain/Loss</h2>
          <p style={{ color: totalGain >= 0 ? '#2ecc71' : '#e74c3c' }}>{totalGain}</p>
        </div>
      </div>

      <div className="analysis-layout">
        <div className="tv-chart" id="tv-container" ref={containerRef}></div>
        <SignalDashboard
          ema20={9800} ema50={9500} ema20Prev={9600} ema50Prev={9400}
          ema20_1W={9000} ema50_1W={9200}
          macdLine={1.5} signalLine={1.2}
          macdLine_4H={1.4} signalLine_4H={1.0}
          plusDI={25} minusDI={15} adx={30} atrPct={1.8}
          kalman={100} rsi={60} close={10000} groqAnalysis={groqAnalysis}
        />
      </div>

      <button className="toggle-table-btn" onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      {showTable && (
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Gain/Loss (%)</th>
              <th>Alasan</th>
              <th>Emosi</th>
              <th>Hapus</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td>{e.date}</td>
                <td>{e.symbol}</td>
                <td>{e.entry}</td>
                <td>{e.exit}</td>
                <td>{e.gainLoss}</td>
                <td>{e.reason}</td>
                <td>{e.emotion}</td>
                <td><button onClick={() => handleDelete(i)}>❌</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingDiary;
