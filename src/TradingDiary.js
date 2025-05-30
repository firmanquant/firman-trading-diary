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
  const [currentPage, setCurrentPage] = useState(1);
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [signalData, setSignalData] = useState(null);
  const containerRef = useRef(null);

  const itemsPerPage = 20;

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trading-entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('trading-entries', JSON.stringify(entries));
  }, [entries]);

  const handleSave = () => {
    if (!symbol || !entry || !exit) return;
    const newEntry = {
      date: date.toLocaleDateString('id-ID'),
      symbol,
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      reason: reason || 'x',
      emotion: emotion || 'x'
    };
    setEntries([newEntry, ...entries]);
    setSymbol('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
    setShowTable(true);
  };

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index + (currentPage - 1) * itemsPerPage, 1);
    setEntries(updated);
  };

  const fetchGroq = async () => {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Analisis saham ${symbol}` }),
      });
      const data = await res.json();
      setGroqAnalysis(data.response || 'Gagal memuat analisis.');
    } catch (err) {
      setGroqAnalysis('Gagal memuat analisis.');
    }
  };

  const fetchSignal = async () => {
    try {
      const res = await fetch(`/api/signal?symbol=${symbol}`);
      const data = await res.json();
      setSignalData(data);
    } catch (err) {
      setSignalData(null);
    }
  };

  useEffect(() => {
    if (symbol.length < 1) return;
    fetchGroq();
    fetchSignal();
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

  // Summary Calculation
  const totalTrade = entries.length;
  const winRate =
    entries.length > 0
      ? (
          (entries.filter((e) => e.exit > e.entry).length / entries.length) *
          100
        ).toFixed(1)
      : 0;
  const gainLoss = entries
    .reduce((sum, e) => sum + (e.exit - e.entry), 0)
    .toFixed(2);

  // Pagination
  const pageCount = Math.ceil(entries.length / itemsPerPage);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      </div>

      <button className="toggle-table-btn" onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      <div className="analysis-layout">
        <div className="groq-box">
          <h3>🧠 Analisis Groq</h3>
          <p>{groqAnalysis}</p>
        </div>
        <div className="tv-chart">
          <h3>📊 Chart</h3>
          <div ref={containerRef} style={{ height: '400px' }} />
        </div>
        <div className="dashboard-box">
          {signalData && <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} />}
        </div>
      </div>

      {showTable && (
        <>
          <div className="summary-dashboard-container">
            <div className="summary-card">
              <h2>Total Trade</h2>
              <p>{totalTrade}</p>
            </div>
            <div className="summary-card">
              <h2>Win Rate</h2>
              <p>{winRate}%</p>
            </div>
            <div className="summary-card">
              <h2>Gain/Loss</h2>
              <p>{gainLoss}</p>
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
                    <button onClick={() => handleDelete(idx)} style={{ backgroundColor: '#ff4d4d', color: 'white' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  margin: '0 5px',
                  backgroundColor: currentPage === i + 1 ? '#4fc3f7' : '#222',
                  color: 'white',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '4px',
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
