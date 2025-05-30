// TradingDiary.js (FINAL VERSION)
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import SignalDashboard from './SignalDashboard';

const PAGE_SIZE = 20;

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

  const containerRef = useRef(null);

  // Load TradingView widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    new window.TradingView.widget({
      autosize: true,
      symbol: `IDX:${symbol || 'BBCA'}`,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      container_id: containerRef.current,
    });
  }, [symbol]);

  useEffect(() => {
    async function fetchSignal() {
      const res = await fetch(`/api/signal?symbol=${symbol}`);
      const data = await res.json();
      setSignalData(data);
    }
    if (symbol) fetchSignal();
  }, [symbol]);

  useEffect(() => {
    async function fetchGroq() {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Analisis teknikal untuk ${symbol}` }),
      });
      const data = await res.json();
      setGroqAnalysis(data.response || 'Gagal memuat analisis.');
    }
    if (symbol) fetchGroq();
  }, [symbol]);

  const saveEntry = () => {
    const newEntry = { date, symbol, entry, exit, reason, emotion };
    setEntries([newEntry, ...entries]);
    setSymbol('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const deleteEntry = (index) => {
    const newList = entries.filter((_, i) => i !== index);
    setEntries(newList);
  };

  const paginated = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);

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
        <button onClick={saveEntry}>Simpan</button>
        <button onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>

      {/* Layout 3 Kolom */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <p><strong>🧠 Analisis Groq</strong></p>
          <pre style={{ background: '#222', padding: 10, color: '#0f0' }}>{groqAnalysis}</pre>
        </div>

        <div style={{ flex: 2 }}>
          <p><strong>📊 Chart</strong></p>
          <div ref={containerRef} style={{ height: '400px', background: '#111' }} />
        </div>

        <div style={{ flex: 1 }}>
          <p><strong>📈 Dashboard Mini</strong></p>
          {signalData && <SignalDashboard {...signalData} />}
        </div>
      </div>

      {/* Ringkasan */}
      {showTable && (
        <div style={{ marginTop: '30px' }}>
          <h3>📊 Ringkasan:</h3>
          <ul>
            <li>Total Trade: {entries.length}</li>
            <li>Win Rate: {((entries.filter(e => parseFloat(e.exit) > parseFloat(e.entry)).length / entries.length) * 100).toFixed(1)}%</li>
            <li>Gain/Loss: {
              entries.reduce((acc, e) => acc + (parseFloat(e.exit) - parseFloat(e.entry)), 0).toFixed(2)
            }</li>
          </ul>

          <table style={{ width: '100%', color: 'white', marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kode</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Alasan</th>
                <th>Emosi</th>
                <th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, i) => (
                <tr key={i}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.symbol}</td>
                  <td>{item.entry}</td>
                  <td>{item.exit}</td>
                  <td>{item.reason}</td>
                  <td>{item.emotion}</td>
                  <td><button onClick={() => deleteEntry(i)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '10px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ margin: '0 5px' }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingDiary;
