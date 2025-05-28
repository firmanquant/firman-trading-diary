import React, { useState, useEffect } from 'react';

const TVChart = ({ symbol = "IDX:BBCA" }) => {
  useEffect(() => {
    const container = document.getElementById("tv_chart_container");
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        container_id: "tv_chart_container",
        symbol,
        interval: "D",
        timezone: "Asia/Jakarta",
        theme: "dark",
        style: "1",
        locale: "id",
        autosize: true,
      });
    };

    container.innerHTML = ""; // Clear chart before reload
    container.appendChild(script);
  }, [symbol]);

  return <div id="tv_chart_container" style={{ height: "500px", marginTop: "2rem" }} />;
};

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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = () => {
    const newEntry = {
      ...form,
      entry: parseFloat(form.entry),
      exit: parseFloat(form.exit),
    };
    setEntries([...entries, newEntry]);
    setForm({ date: '', ticker: '', entry: '', exit: '', reason: '', emotion: '' });
  };

  const calcResult = (entry, exit) => {
    if (isNaN(entry) || isNaN(exit)) return 'NaN';
    return exit - entry;
  };

  const calcGain = (entry, exit) => {
    if (isNaN(entry) || entry === 0) return 'NaN';
    return (((exit - entry) / entry) * 100).toFixed(2);
  };

  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => calcResult(e.entry, e.exit) > 0).length;
  const totalGainLoss = entries.reduce((sum, e) => sum + (parseFloat(e.exit) - parseFloat(e.entry) || 0), 0);

  return (
    <div className="container">
      <h1>📘 Firman Trading Diary</h1>
      <div className="form">
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <input name="ticker" placeholder="Ticker" value={form.ticker} onChange={handleChange} />
        <input name="entry" type="number" placeholder="Entry Price" value={form.entry} onChange={handleChange} />
        <input name="exit" type="number" placeholder="Exit Price" value={form.exit} onChange={handleChange} />
        <input name="reason" placeholder="Alasan Setup" value={form.reason} onChange={handleChange} />
        <input name="emotion" placeholder="Catatan Emosi" value={form.emotion} onChange={handleChange} />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      <div className="summary-card">
        <h2>📊 Ringkasan Performa</h2>
        <p>Total Trade: {totalTrades}</p>
        <p>Win Rate: {totalTrades ? ((winningTrades / totalTrades) * 100).toFixed(2) : 0}%</p>
        <p>Total Gain/Loss: {totalGainLoss.toFixed(2)}</p>
      </div>

      <table>
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
          {entries.map((e, i) => (
            <tr key={i}>
              <td>{e.date}</td>
              <td>{e.ticker}</td>
              <td>{e.entry}</td>
              <td>{e.exit}</td>
              <td>{calcResult(e.entry, e.exit)}</td>
              <td>{calcGain(e.entry, e.exit)}%</td>
              <td>{e.reason}</td>
              <td>{e.emotion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <TVChart symbol="IDX:BBCA" />
    </div>
  );
};

export default TradingDiary;
