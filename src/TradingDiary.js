// TradingDiary.js (FINAL - Perbaikan Total)
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
    if (!symbol || !entry || !exit) return;
    const gainLoss = ((exit - entry) / entry) * 100;
    setEntries(prev => [...prev, {
      date: new Date().toLocaleDateString('id-ID'),
      symbol,
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
        <div className="groq-box">
          <h3>
