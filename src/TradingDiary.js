// src/TradingDiary.js
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

  // Stats
  const totalTrades = entries.length;
  const wins = entries.filter(e => Number(e.exit) > Number(e.entry)).length;
  const losses = entries.filter(e => Number(e.exit) < Number(e.entry)).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

  return (
    <div className="container p-4">
      <h1 className="title text-2xl font-bold text-cyan-400 mb-4">Firman Trading Diary</h1>

      <div className="form grid grid-cols-6 gap-2 mb-4">
        <DatePicker selected={date} onChange={(d) => setDate(d)} className="px-2 py-1 rounded" />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Kode Saham" className="px-2 py-1 rounded" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" className="px-2 py-1 rounded" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" className="px-2 py-1 rounded" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" className="px-2 py-1 rounded" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" className="px-2 py-1 rounded" />
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-1 rounded col-span-6">Simpan</button>
      </div>

      <div className="three-column-layout grid grid-cols-3 gap-4 items-start">
        <div className="left-box bg-zinc-900 p-4 rounded min-h-[480px]">
          <h3 className="text-pink-300 font-semibold mb-2">🧠 Analisis Groq</h3>
          <p>{groqAnalysis || 'Memuat analisis...'}</p>
        </div>

        <div className="center-box bg-black p-2 rounded min-h-[480px]">
          <div ref={containerRef} id="tvchart" style={{ minHeight: '400px' }} />
        </div>

        <div className="right-box bg-zinc-900 p-4 rounded min-h-[480px]">
          <h3 className="text-white font-semibold mb-2">📈 Dashboard Mini</h3>
          {signalData ? (
            <SignalDashboard {...signalData} />
          ) : (
            <p className="text-gray-400">Memuat sinyal...</p>
          )}
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => setShowTable(!showTable)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        </button>
      </div>

      {showTable && (
        <div className="mt-6">
          <div className="text-sm text-white mb-2">
            <p>Total Trade: {totalTrades}</p>
            <p>Win Rate: {winRate}%</p>
            <p>Gain: {wins} | Loss: {losses}</p>
          </div>

          <table className="w-full text-sm text-white border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2">Tanggal</th>
                <th>Symbol</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Alasan</th>
                <th>Emosi</th>
                <th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className="text-center border-t border-gray-700">
                  <td className="p-2">{entry.date}</td>
                  <td>{entry.symbol}</td>
                  <td>{entry.entry}</td>
                  <td>{entry.exit}</td>
                  <td>{entry.reason}</td>
                  <td>{entry.emotion}</td>
                  <td>
                    <button onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-300">
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradingDiary;
