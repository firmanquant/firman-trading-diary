// TradingDiary.js (FINAL VERSION with working signal + groq + layout fix)
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState, useRef, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';
import DatePicker from 'react-datepicker';

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
  const [signalData, setSignalData] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchSignal() {
      const res = await fetch(`/api/signal?symbol=${symbol}`);
      const data = await res.json();
      setSignalData(data);
    }
    fetchSignal();
  }, [symbol]);

  useEffect(() => {
    async function fetchGroq() {
      const prompt = `Berikan analisis teknikal untuk saham ${symbol}`;
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setGroqAnalysis(data.response || 'Gagal memuat analisis.');
    }
    fetchGroq();
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
      container_id: containerRef.current,
    });
  }, [symbol]);

  const handleSave = () => {
    const newEntry = { date, symbol, entry, exit, reason, emotion };
    setEntries([...entries, newEntry]);
  };

  return (
    <div className="container">
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
        <DatePicker selected={date} onChange={(d) => setDate(d)} />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Kode Saham" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleSave}>Simpan</button>
        <button onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {signalData && <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} />}
        <div ref={containerRef} style={{ height: '400px' }} />
      </div>

      {showTable && (
        <table className="entry-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Alasan</th>
              <th>Emosi</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item, idx) => (
              <tr key={idx}>
                <td>{item.date.toLocaleDateString()}</td>
                <td>{item.symbol}</td>
                <td>{item.entry}</td>
                <td>{item.exit}</td>
                <td>{item.reason}</td>
                <td>{item.emotion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingDiary;
