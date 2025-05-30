// TradingDiary.js (FINAL VERSION)
import 'react-datepicker/dist/react-datepicker.css'; // ✅ hanya sekali
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
  const containerRef = useRef(null);

  const [signalData, setSignalData] = useState(null);

  useEffect(() => {
    // Update TradingView widget
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

  useEffect(() => {
    // Fetch Signal data
    const fetchSignals = async () => {
      try {
        const res = await fetch(`/api/signals?symbol=${symbol}`);
        const json = await res.json();
        setSignalData(json);
      } catch (err) {
        console.error('Error fetching signals:', err);
        setSignalData(null);
      }
    };

    // Fetch Groq analysis
    const fetchGroq = async () => {
      try {
        const res = await fetch('/api/groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });
        const json = await res.json();
        setGroqAnalysis(json.analysis || '');
      } catch (err) {
        console.error('Groq error:', err);
        setGroqAnalysis('');
      }
    };

    if (symbol.length > 0) {
      fetchSignals();
      fetchGroq();
    }
  }, [symbol]);

  const handleSubmit = () => {
    const newEntry = { date, symbol, entry, exit, reason, emotion };
    setEntries([...entries, newEntry]);
    setEntry('');
    setExit('');
    setReason('');
    setEmotion('');
  };

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center text-cyan-400 mb-4">📘 Firman Trading Diary</h1>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <DatePicker selected={date} onChange={(d) => setDate(d)} className="text-black p-2 rounded" />
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol (e.g. BBRI)" className="p-2 text-black rounded" />
        <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Entry" className="p-2 text-black rounded" />
        <input value={exit} onChange={(e) => setExit(e.target.value)} placeholder="Exit" className="p-2 text-black rounded" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan" className="p-2 text-black rounded" />
        <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Emosi" className="p-2 text-black rounded" />
      </div>

      <button onClick={handleSubmit} className="bg-green-500 px-4 py-2 rounded text-white mb-6">+ Tambah Entry</button>

      {/* TradingView Chart */}
      <div ref={containerRef} className="w-full h-[400px] mb-8"></div>

      {/* Signal Dashboard */}
      {signalData ? (
        <SignalDashboard {...signalData} groqAnalysis={groqAnalysis} />
      ) : (
        <p className="text-red-400">Memuat data indikator...</p>
      )}
    </div>
  );
};

export default TradingDiary;
