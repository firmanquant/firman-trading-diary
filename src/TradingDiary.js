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
  const [currentPage, setCurrentPage] = useState(1);

  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [signalData, setSignalData] = useState(null);
  const containerRef = useRef(null);

  const entriesPerPage = 20;
  const paginatedEntries = entries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const totalPages = Math.ceil(entries.length / entriesPerPage);

  // Load saved entries
  useEffect(() => {
    const saved = localStorage.getItem('tradingEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  // Fetch dummy signal data
  useEffect(() => {
    if (!symbol) return;
    fetch(`/api/signal?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setSignalData(data))
      .catch(() => setSignalData(null));
  }, [symbol]);

  // Fetch dummy Groq analysis
  useEffect(() => {
    if (!symbol) return;
    fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Berikan analisis teknikal untuk saham ${symbol}` })
    })
      .then((res) => res.json())
      .then((data) => setGroqAnalysis(data.response || 'Gagal memuat analisis.'))
      .catch(() => setGroqAnalysis('Gagal memuat analisis.'));
  }, [symbol]);

  // Load TradingView chart
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

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index + (currentPage - 1) * entriesPerPage, 1);
    setEntries(updated);
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

      <div className="analysis-layout">
        <div className="groq-box">
          <h3>🧠 Analisis Groq</h3>
          <p>{groqAnalysis}</p>
        </div>

        <div className="tv-chart" ref={containerRef} id="tvchart" />

        <div className="dashboard-box">
          <h3>📈 Dashboard Mini</h3>
          {signalData ? <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} /> : <p>Memuat sinyal...</p>}
        </div>
      </div>

      {showTable && (
        <>
          <div className="summary-dashboard-container">
            <div className="summary-card">
              <h2>Total Trade</h2>
              <p>{entries.length}</p>
            </div>
            <div className="summary-card">
              <h2>Win Rate</h2>
              <p>
                {entries.length > 0
                  ? (
                      (entries.filter((e) => parseFloat(e.exit) > parseFloat(e.entry)).length / entries.length) *
                      100
                    ).toFixed(1) + '%'
                  : '0%'}
              </p>
            </div>
            <div className="summary-card">
              <h2>Gain/Loss</h2>
              <p>
                {entries
                  .reduce((acc, e) => acc + (parseFloat(e.exit) - parseFloat(e.entry)), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <table>
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
              {paginatedEntries.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.date}</td>
                  <td>{item.symbol}</td>
                  <td>{item.entry}</td>
                  <td>{item.exit}</td>
                  <td>{item.reason}</td>
                  <td>{item.emotion}</td>
                  <td>
                    <button onClick={() => handleDelete(idx)} style={{ background: 'red', color: 'white' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  margin: '0 4px',
                  padding: '4px 8px',
                  background: currentPage === i + 1 ? '#2ecc71' : '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4
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
