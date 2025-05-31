import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SignalDashboard from './SignalDashboard';
import { getGroqAnalysis } from './lib/groq';
import { getSignalData } from './lib/signal';

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

    getSignalData(symbol)
      .then((data) => setSignalData({ ...data, ticker: symbol }))
      .catch(() => setSignalData(null));

    getGroqAnalysis(symbol)
      .then((res) => setGroqAnalysis(res.response || 'Gagal memuat analisis.'))
      .catch(() => setGroqAnalysis('Gagal memuat analisis.'));
  }, [symbol]);

  useEffect(() => {
    if (!symbol || !window.TradingView || !containerRef.current) return;
    containerRef.current.innerHTML = '';

    new window.TradingView.widget({
      autosize: true,
      symbol: `IDX:${symbol}`,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      container_id: containerRef.current.id,
    });
  }, [symbol]);

  const handleSave = () => {
    if (!symbol || !entry || !exit) {
      alert('Mohon lengkapi kolom Kode Saham, Entry, dan Exit.');
      return;
    }

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
    updated.splice(index, 1);
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

      {showTable && (
        <div className="mt-4 table-entries">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Tanggal</th><th>Symbol</th><th>Entry</th><th>Exit</th><th>Alasan</th><th>Emosi</th><th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.date}</td>
                  <td>{entry.symbol}</td>
                  <td>{entry.entry}</td>
                  <td>{entry.exit}</td>
                  <td>{entry.reason}</td>
                  <td>{entry.emotion}</td>
                  <td><button onClick={() => handleDelete(i)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="three-column-layout mt-4">
        <div className="left-box">
          <h3>🧠 Analisis Groq</h3>
          <p>{groqAnalysis || 'Memuat analisis...'}</p>
        </div>

        <div className="center-box">
          <div ref={containerRef} id="tvchart" style={{ minHeight: '400px' }} />
        </div>

        <div className="right-box">
          <h3>📈 Dashboard Mini</h3>
          {signalData ? (
            <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} />
          ) : (
            <p>Memuat sinyal...</p>
          )}
        </div>
      </div>

      <div className="footer-controls text-center mt-8">
        <button className="toggle-table-btn" onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>
    </div>
  );
};

export default TradingDiary;
