// TradingDiary.js (FINAL VERSION)
import React, { useState, useRef, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TradingDiary = () => {
  const [date, setDate] = useState(new Date());
  const [symbol, setSymbol] = useState('BBCA');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [entries, setEntries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    new window.TradingView.widget({
      symbol: `IDX:${symbol}`,
      interval: 'D',
      container_id: 'tv-container',
      theme: 'dark',
      locale: 'id',
      autosize: true,
    });
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    const fetchGroq = async () => {
      try {
        const res = await fetch(`/api/groq?symbol=${symbol}`);
        const data = await res.text();
        setGroqAnalysis(data);
      } catch (err) {
        setGroqAnalysis('Gagal memuat analisis.');
      }
    };
    fetchGroq();
  }, [symbol]);

  const handleAddEntry = () => {
    if (!symbol || !entry || !exit) return;
    const gainLoss = ((parseFloat(exit) - parseFloat(entry)) / parseFloat(entry)) * 100;
    setEntries(prev => [...prev, {
      date: date.toISOString().split('T')[0],
      symbol: symbol.toUpperCase(),
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      gainLoss: gainLoss.toFixed(2),
      reason,
      emotion
    }]);
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const handleDelete = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const totalTrade = entries.length;
  const winRate = totalTrade > 0 ? (entries.filter(e => parseFloat(e.gainLoss) > 0).length / totalTrade) * 100 : 0;
  const totalGain = entries.reduce((acc, e) => acc + parseFloat(e.gainLoss), 0);

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
        <DatePicker selected={date} onChange={date => setDate(date)} dateFormat="dd/MM/yyyy" />
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="Ticker" />
        <input value={entry} onChange={e => setEntry(e.target.value)} placeholder="Entry" type="number" />
        <input value={exit} onChange={e => setExit(e.target.value)} placeholder="Exit" type="number" />
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleAddEntry}>+ Tambah Entry</button>
      </div>

      <div className="summary-dashboard-container">
        <div className="summary-card"><h2>Total Trade</h2><p>{totalTrade}</p></div>
        <div className="summary-card"><h2>Win Rate</h2><p>{winRate.toFixed(1)}%</p></div>
        <div className="summary-card"><h2>Gain/Loss</h2><p style={{ color: totalGain >= 0 ? '#2ecc71' : '#e74c3c' }}>{totalGain.toFixed(2)}</p></div>
      </div>

      <div className="analysis-layout">
        <div className="tv-chart" id="tv-container" ref={containerRef}></div>
        <SignalDashboard symbol={symbol} groqAnalysis={groqAnalysis} />
      </div>

      <button className="toggle-table-btn" onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      {showTable && (
        <table>
          <thead>
            <tr>
              <th>Tanggal</th><th>Kode</th><th>Entry</th><th>Exit</th><th>Gain/Loss %</th><th>Alasan</th><th>Emosi</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td>{e.date}</td>
                <td>{e.symbol}</td>
                <td>{e.entry}</td>
                <td>{e.exit}</td>
                <td style={{ color: e.gainLoss >= 0 ? '#2ecc71' : '#e74c3c' }}>{e.gainLoss}%</td>
                <td>{e.reason}</td>
                <td>{e.emotion}</td>
                <td><button onClick={() => handleDelete(i)}>Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingDiary;
