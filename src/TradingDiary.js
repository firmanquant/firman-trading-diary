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
  const [showTable, setShowTable] = useState(true);
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

  const handleSubmit = () => {
    setEntries([...entries, {
      date,
      symbol,
      entry,
      exit,
      reason,
      emotion,
    }]);
    setSymbol('');
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const totalTrade = entries.length;
  const winRate = (() => {
    const wins = entries.filter(e => parseFloat(e.exit) > parseFloat(e.entry)).length;
    return totalTrade ? ((wins / totalTrade) * 100).toFixed(1) + '%' : '0%';
  })();
  const gainLoss = (() => {
    const total = entries.reduce((acc, e) => acc + (parseFloat(e.exit) - parseFloat(e.entry)), 0);
    return total.toFixed(2);
  })();

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1 className="title">Firman Trading Diary</h1>

      <div className="form">
        <DatePicker selected={date} onChange={(d) => setDate(d)} />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Kode Saham" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" />
        <button onClick={handleSubmit} style={{ backgroundColor: 'green', color: 'white' }}>Simpan</button>
        <button onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>

      {/* Layout 3 Kolom */}
      <div className="content" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="left" style={{ flex: 1 }}>
          <p><strong>🧠 Analisis Groq</strong></p>
          <pre style={{ background: '#222', padding: 10, color: '#0f0' }}>{groqAnalysis}</pre>
        </div>

        <div className="middle" style={{ flex: 2 }}>
          <p><strong>📊 Chart</strong></p>
          <div ref={containerRef} style={{ height: '400px', marginBottom: '20px' }} />
        </div>

        <div className="right" style={{ flex: 1 }}>
          <p><strong>📈 Dashboard Mini</strong></p>
          {signalData && <SignalDashboard {...signalData} />}
        </div>
      </div>

      {/* Ringkasan & Tabel */}
      {showTable && (
        <>
          <div style={{ marginTop: 30 }}>
            <p><strong>🔢 Ringkasan:</strong></p>
            <ul>
              <li>Total Trade: {totalTrade}</li>
              <li>Win Rate: {winRate}</li>
              <li>Gain/Loss: {gainLoss}</li>
            </ul>
          </div>

          <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse', color: 'white' }}>
            <thead style={{ backgroundColor: '#333' }}>
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
              {entries.map((item, idx) => (
                <tr key={idx} style={{ textAlign: 'center' }}>
                  <td>{item.date.toLocaleDateString()}</td>
                  <td>{item.symbol}</td>
                  <td>{item.entry}</td>
                  <td>{item.exit}</td>
                  <td>{item.reason}</td>
                  <td>{item.emotion}</td>
                  <td>
                    <button onClick={() => handleDelete(idx)} style={{ color: 'red' }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default TradingDiary;
