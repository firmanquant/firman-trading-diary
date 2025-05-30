import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SignalDashboard from './SignalDashboard';

const TradingDiary = () => {
  const [date, setDate] = useState(new Date());
  const [symbol, setSymbol] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [entries, setEntries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [signalData, setSignalData] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('tradingEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!symbol) return;
    fetch(`/api/signal?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setSignalData(data))
      .catch(() => setSignalData(null));
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Analisis teknikal untuk ${symbol}` })
    })
      .then((res) => res.json())
      .then((data) => setGroqAnalysis(data.response || 'Gagal memuat analisis.'))
      .catch(() => setGroqAnalysis('Gagal memuat analisis.'));
  }, [symbol]);

  useEffect(() => {
    if (!window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    new window.TradingView.widget({
      autosize: true,
      symbol: `IDX:${symbol}`,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      container_id: containerRef.current.id || 'tvchart',
    });
  }, [symbol]);

  const handleSave = () => {
    if (!symbol || !entry || !exit) return;
    const newEntry = {
      date: date.toLocaleDateString('id-ID'),
      symbol,
      entry,
      exit,
      reason: reason || 'x',
      emotion: emotion || 'x'
    };
    setEntries([newEntry, ...entries]);
    setSymbol('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>
      <div className="form">
        <DatePicker selected={date} onChange={(d) => setDate(d)} />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Kode Saham" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleSave}>Simpan</button>
      </div>

      <button className="toggle-table-btn" onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      {/* Layout 3 kolom */}
      <div className="three-column-layout">
        <div className="left-box">
          <h3>🧠 Analisis Groq</h3>
          <p>{groqAnalysis}</p>
        </div>

        <div className="center-box">
          <div ref={containerRef} id="tvchart" style={{ minHeight: '400px' }} />
        </div>

        <div className="right-box">
          <h3>📈 Dashboard Mini</h3>
          {signalData ? <SignalDashboard {...signalData} /> : <p>Memuat sinyal...</p>}
        </div>
      </div>
    </div>
  );
};

export default TradingDiary;
