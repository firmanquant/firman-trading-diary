import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TradingDiary() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("tradingDiary");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: "",
    ticker: "",
    entry: "",
    exit: "",
    reason: "",
    emotion: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const result = parseFloat(form.exit) - parseFloat(form.entry);
    const percent = ((result / parseFloat(form.entry)) * 100).toFixed(2);
    const newEntry = { ...form, result: result.toFixed(2), percent };
    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem("tradingDiary", JSON.stringify(updated));
    setForm({ date: "", ticker: "", entry: "", exit: "", reason: "", emotion: "" });
  };

  const totalTrades = entries.length;
  const winTrades = entries.filter((e) => parseFloat(e.result) > 0).length;
  const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(2) : 0;
  const totalGain = entries.reduce((sum, e) => sum + parseFloat(e.result), 0).toFixed(2);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1a1a1a', color: '#f0f0f0', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📘 Firman Trading Diary</h1>

      <div style={{ marginBottom: '2rem' }}>
        <input name="date" placeholder="Tanggal (yyyy-mm-dd)" value={form.date} onChange={handleChange} />
        <input name="ticker" placeholder="Ticker" value={form.ticker} onChange={handleChange} />
        <input name="entry" placeholder="Entry Price" value={form.entry} onChange={handleChange} />
        <input name="exit" placeholder="Exit Price" value={form.exit} onChange={handleChange} />
        <textarea name="reason" placeholder="Alasan Setup" value={form.reason} onChange={handleChange} />
        <textarea name="emotion" placeholder="Catatan Emosi" value={form.emotion} onChange={handleChange} />
        <button onClick={handleSubmit}>+ Tambah Entry</button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>📊 Ringkasan Performa</h2>
        <p>Total Trade: {totalTrades}</p>
        <p>Win Rate: {winRate}%</p>
        <p>Total Gain/Loss: {totalGain}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>📈 Grafik Profit</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={entries}>
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="percent" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2>📄 Catatan</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <td>{e.result}</td>
                <td>{e.percent}%</td>
                <td>{e.reason}</td>
                <td>{e.emotion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
