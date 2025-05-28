import React, { useState } from 'react';
import './index.css';

const TradingDiary = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: '',
    ticker: '',
    entry: '',
    exit: '',
    reason: '',
    emotion: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEntry = () => {
    const entryPrice = parseFloat(form.entry);
    const exitPrice = parseFloat(form.exit);
    const result = exitPrice - entryPrice;
    const percent = (entryPrice && exitPrice)
      ? ((result / entryPrice) * 100).toFixed(2)
      : null;

    setEntries([
      ...entries,
      {
        ...form,
        entry: entryPrice,
        exit: exitPrice,
        result: result.toFixed(2),
        percent,
      }
    ]);

    setForm({
      date: '',
      ticker: '',
      entry: '',
      exit: '',
      reason: '',
      emotion: ''
    });
  };

  const totalTrades = entries.length;
  const wins = entries.filter((e) => parseFloat(e.result) > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(2) : '0.00';
  const totalGainLoss = entries.reduce((acc, e) => acc + parseFloat(e.result), 0).toFixed(2);

  return (
    <div className="container">
      <h1>📘 Firman Trading Diary</h1>
      
      <div className="form-grid">
        <input type="date" name="date" value={form.date} onChange={handleChange} placeholder="Tanggal" />
        <input type="text" name="ticker" value={form.ticker} onChange={handleChange} placeholder="Ticker" />
        <input type="number" name="entry" value={form.entry} onChange={handleChange} placeholder="Entry Price" />
        <input type="number" name="exit" value={form.exit} onChange={handleChange} placeholder="Exit Price" />
        <input type="text" name="reason" value={form.reason} onChange={handleChange} placeholder="Alasan Setup" />
        <input type="text" name="emotion" value={form.emotion} onChange={handleChange} placeholder="Catatan Emosi" />
        <button onClick={handleAddEntry}>+ Tambah Entry</button>
      </div>

      <div className="summary">
        <h2>📊 Ringkasan Performa</h2>
        <p>Total Trade: {totalTrades}</p>
        <p>Win Rate: {winRate}%</p>
        <p>Total Gain/Loss: {totalGainLoss}</p>
      </div>

      <table className="diary-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Ticker</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Hasil</th>
            <th>% Gain</th>
            <th>Alasan</th>
            <th>Emosi</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>{entry.ticker}</td>
              <td>{entry.entry}</td>
              <td>{entry.exit}</td>
              <td>{entry.result}</td>
              <td>{entry.percent ? `${entry.percent}%` : '-'}</td>
              <td>{entry.reason}</td>
              <td>{entry.emotion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradingDiary;
