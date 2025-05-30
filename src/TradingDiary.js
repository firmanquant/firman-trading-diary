import React, { useState, useRef, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';

const TradingDiary = () => {
  const [symbol, setSymbol] = useState('BBCA');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [entries, setEntries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('Gagal memuat analisis.');

  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  const fullSymbol = `IDX:${symbol}`;

  // Dummy signal values untuk demonstrasi awal (gantilah dari API backend / local logic jika ada)
  const [signalData, setSignalData] = useState({
    ema20: 100, ema50: 95, ema20Prev: 99, ema50Prev: 94,
    ema20_1W: 102, ema50_1W: 97,
    rsi: 60, macdLine: 1.2, signalLine: 0.8,
    macdLine_4H: 0.9, signalLine_4H: 0.7,
    plusDI: 25, minusDI: 18, adx: 30,
    atrPct: 1.8, kalman: 100, close: 101
  });

  useEffect(() => {
    if (!window.TradingView || !containerRef.current) return;

    containerRef.current.innerHTML = ''; // bersihkan container dulu
    widgetRef.current = new window.TradingView.widget({
      container_id: 'tv-container',
      symbol: fullSymbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      width: '100%',
      height: 500,
      autosize: true
    });

    return () => widgetRef.current?.remove();
  }, [fullSymbol]);

  const handleAddEntry = () => {
    if (!symbol || !entry || !exit) return;
    const gainLoss = ((parseFloat(exit) - parseFloat(entry)) / parseFloat(entry)) * 100;

    setEntries(prev => [
      ...prev,
      {
        date: new Date().toLocaleDateString('id-ID'),
        symbol,
        entry: parseFloat(entry),
        exit: parseFloat(exit),
        gainLoss: gainLoss.toFixed(2),
        reason,
        emotion
      }
    ]);

    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const totalTrade = entries.length;
  const winRate = totalTrade > 0 ? entries.filter(e => e.gainLoss > 0).length / totalTrade * 100 : 0;
  const totalGain = entries.reduce((acc, e) => acc + parseFloat(e.gainLoss), 0);

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
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
          <p>{winRate.toFixed(1)}%</p>
        </div>
        <div className="summary-card">
          <h2>Gain/Loss</h2>
          <p style={{ color: totalGain >= 0 ? '#2ecc71' : '#e74c3c' }}>{totalGain.toFixed(2)}</p>
        </div>
      </div>

      <div className="analysis-layout">
        {/* Chart Section */}
        <div className="tv-chart" ref={containerRef} id="tv-container" />

        {/* Dashboard and Groq */}
        <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} />
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingDiary;
