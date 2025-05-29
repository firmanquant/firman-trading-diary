import React, { useState, useEffect, useRef } from 'react';
import SignalDashboard from './SignalDashboard';

const TVChart = ({ symbol }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container || !window.TradingView) return;

    container.innerHTML = '';
    const widgetOptions = {
      symbol: `IDX:${symbol}`,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      autosize: true,
      container_id: 'tradingview-chart'
    };
    widgetRef.current = new window.TradingView.widget(widgetOptions);

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
    script.id = 'tradingview-script';
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('tradingview-script');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  return <div id="tradingview-chart" ref={containerRef} className="chart-container" />;
};

const TradingDiary = () => {
  const [ticker, setTicker] = useState('BBCA');
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [indicators, setIndicators] = useState({});

  const fetchGroqAnalysis = async () => {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Analisis teknikal saham ${ticker}` })
      });
      const data = await res.json();
      setGroqAnalysis(data.response || 'Tidak ada respon.');
    } catch (e) {
      setGroqAnalysis('Gagal memuat analisis.');
    }
  };

  useEffect(() => {
    fetchGroqAnalysis();

    // dummy indikator agar dashboard merespons perubahan ticker
    setIndicators({
      ema20: 45 + Math.random() * 10,
      ema50: 43 + Math.random() * 10,
      ema20Prev: 44 + Math.random() * 10,
      ema50Prev: 42 + Math.random() * 10,
      ema20_1W: 43 + Math.random() * 10,
      ema50_1W: 41 + Math.random() * 10,
      rsi: 60 + Math.random() * 10,
      macdLine: 1 + Math.random(),
      signalLine: 1 + Math.random(),
      macdLine_4H: 0.4 + Math.random(),
      signalLine_4H: 0.3 + Math.random(),
      plusDI: 25 + Math.random() * 5,
      minusDI: 15 + Math.random() * 5,
      adx: 30 + Math.random() * 10,
      atrPct: 1.5 + Math.random(),
      kalman: 100 + Math.random() * 10,
      close: 105 + Math.random() * 10
    });
  }, [ticker]);

  return (
    <div className="container">
      <h1>Firman Trading Diary</h1>
      <div className="top-bar">
        <input type="text" placeholder="Ticker" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} />
        <button onClick={() => setTicker(ticker)}>+ Tambah Entry</button>
      </div>

      <TVChart symbol={ticker} />

      <div className="summary">
        <div className="card">
          <h3>Total Trade</h3>
          <p>0</p>
        </div>
        <div className="card">
          <h3>Win Rate</h3>
          <p>0%</p>
        </div>
        <div className="card">
          <h3>Gain/Loss</h3>
          <p style={{ color: 'lime' }}>+0.00</p>
        </div>
      </div>

      <SignalDashboard {...indicators} groqAnalysis={groqAnalysis} />
    </div>
  );
};

export default TradingDiary;
