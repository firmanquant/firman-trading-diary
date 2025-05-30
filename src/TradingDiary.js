// TradingDiary.js (Final Layout Presisi)
import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

const TVChart = ({ symbol = 'IDX:BBCA' }) => {
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
      container_id: 'tv-container',
    });

    return () => {
      if (widgetRef.current?.remove) widgetRef.current.remove();
    };
  }, [symbol]);

  return <div id="tv-container" className="tv-chart" ref={containerRef} />;
};

const TradingDiary = () => {
  const [symbol, setSymbol] = useState('IDX:BBCA');

  const fakeData = {
    ema20: 50,
    ema50: 45,
    ema20Prev: 48,
    ema50Prev: 43,
    ema20_1W: 60,
    ema50_1W: 50,
    rsi: 60,
    macdLine: 2,
    signalLine: 1.5,
    macdLine_4H: 1.8,
    signalLine_4H: 1.4,
    plusDI: 25,
    minusDI: 15,
    adx: 30,
    atrPct: 1.8,
    kalman: 100,
    close: 50,
    groqAnalysis: '',
  };

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>
      <div className="form">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Masukkan simbol (mis. IDX:BBCA)"
        />
        <button onClick={() => {}}>+ Tambah Entry</button>
      </div>

      {/* Ringkasan Performa */}
      <div className="summary-dashboard-container">
        <div className="summary-card">
          <h2>Total Trade</h2>
          <p>0</p>
        </div>
        <div className="summary-card">
          <h2>Win Rate</h2>
          <p>0.0%</p>
        </div>
        <div className="summary-card">
          <h2>Gain/Loss</h2>
          <p style={{ color: '#2ecc71' }}>+0.00</p>
        </div>
      </div>

      {/* Layout Grid: Analisis Groq | Chart | Dashboard Mini */}
      <div className="analysis-layout">
        <div className="groq-box">
          <h3>🧠 Analisis Groq</h3>
          <p>{fakeData.groqAnalysis || 'Gagal memuat analisis.'}</p>
        </div>

        <TVChart symbol={symbol} />

        <div className="dashboard-box">
          <SignalDashboard {...fakeData} />
        </div>
      </div>

      <button className="toggle-table-btn">Tampilkan Tabel</button>
    </div>
  );
};

export default TradingDiary;
