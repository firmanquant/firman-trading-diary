// pages/TradingDiary.js
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
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

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const containerRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trading-diary-entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    localStorage.setItem('trading-diary-entries', JSON.stringify(entries));
  }, [entries]);

  // Fetch dummy Groq
  useEffect(() => {
    if (!symbol) return;
    fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Analisa teknikal saham ${symbol}` }),
    })
      .then(res => res.json())
      .then(data => setGroqAnalysis(data.response || 'Tidak tersedia'));
  }, [symbol]);

  // Fetch dummy Signal
  useEffect(() => {
    if (!symbol || symbol.length < 2) return;
    fetch(`/api/signal?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => setSignalData(data))
      .catch(() => setSignalData(null));
  }, [symbol]);

  // Load TradingView chart
  useEffect(() => {
    if (!window.TradingView || !containerRef.current || !symbol) return;
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
    const newEntry = {
      date,
      symbol,
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      reason,
      emotion,
    };
    setEntries([newEntry, ...entries]);
    setSymbol('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const handleDelete = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const total = entries.length;
  const winCount = entries.filter(e => e.exit > e.entry).length;
  const gainLoss = entries.reduce((sum, e) => sum + (e.exit - e.entry), 0);
  const winRate = total ? (winCount / total * 100).toFixed(1) : 0;

  const paginated = entries.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', color: '#39f' }}>Firman Trading Diary</h1>
      <div className="form" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <DatePicker selected={date} onChange={(d) => setDate(d)} />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Kode Saham" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleSave} style={{ background: 'green', color: '#fff' }}>Simpan</button>
        <button onClick={() => setShowTable(!showTable)} style={{ background: '#0c0', color: '#fff' }}>
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>

      {/* Layout 3 kolom */}
      <div className="content" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="left" style={{ flex: 1 }}>
          <p><strong>🧠 Analisis Groq</strong></p>
          <pre style={{ background: '#222', padding: 10, color: '#0f0' }}>{groqAnalysis}</pre>
        </div>
        <div className="middle" style={{ flex: 2 }}>
          <p><strong>📊 Chart</strong></p>
          <div ref={containerRef} style={{ height: '400px' }} />
        </div>
        <div className="right" style={{ flex: 1 }}>
          <p><strong>📈 Dashboard Mini</strong></p>
          {signalData && <SignalDashboard {...signalData} />}
        </div>
      </div>

      {showTable && (
        <>
          <div style={{ marginTop: 20 }}>
            <p><strong>📉 Ringkasan:</strong></p>
            <ul>
              <li>Total Trade: {total}</li>
              <li>Win Rate: {winRate}%</li>
              <li>Gain/Loss: {gainLoss.toFixed(2)}</li>
            </ul>
          </div>

          <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111', color: '#fff' }}>
                <th>Tanggal</th><th>Kode</th><th>Entry</th><th>Exit</th><th>Alasan</th><th>Emosi</th><th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e, i) => (
                <tr key={i} style={{ textAlign: 'center' }}>
                  <td>{new Date(e.date).toLocaleDateString('id-ID')}</td>
                  <td>{e.symbol}</td>
                  <td>{e.entry}</td>
                  <td>{e.exit}</td>
                  <td>{e.reason}</td>
                  <td>{e.emotion}</td>
                  <td>
                    <button onClick={() => handleDelete((currentPage - 1) * perPage + i)} style={{ background: '#f44', color: '#fff' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  margin: 3,
                  background: i + 1 === currentPage ? '#09f' : '#333',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 10px',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TradingDiary;
