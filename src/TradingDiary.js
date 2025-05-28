import React, { useState, useEffect } from "react";

const TradingDiary = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    ticker: "",
    setup: "",
    entry: "",
    reason: "",
    result: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEntries([...entries, form]);
    setForm({
      date: "",
      ticker: "",
      setup: "",
      entry: "",
      reason: "",
      result: "",
    });
  };

  return (
    <div className="container">
      <h1>Firman Trading Diary</h1>
      <form onSubmit={handleSubmit} className="form">
        <input name="date" value={form.date} onChange={handleChange} placeholder="Tanggal" />
        <input name="ticker" value={form.ticker} onChange={handleChange} placeholder="Ticker" />
        <input name="setup" value={form.setup} onChange={handleChange} placeholder="Setup" />
        <input name="entry" value={form.entry} onChange={handleChange} placeholder="Entry" />
        <input name="reason" value={form.reason} onChange={handleChange} placeholder="Alasan Psikologis" />
        <input name="result" value={form.result} onChange={handleChange} placeholder="Hasil" />
        <button type="submit">Simpan</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Ticker</th>
            <th>Setup</th>
            <th>Entry</th>
            <th>Alasan</th>
            <th>Hasil</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td>{entry.date}</td>
              <td>{entry.ticker}</td>
              <td>{entry.setup}</td>
              <td>{entry.entry}</td>
              <td>{entry.reason}</td>
              <td>{entry.result}</td>
            </tr>
          ))}
        </tbody>
      </table><TVChart symbol="IDX:BBCA" />
    </div>
  );
};

const TVChart = ({ symbol = "IDX:BBCA" }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        container_id: "tv_chart_container",
        symbol: symbol,
        interval: "D",
        timezone: "Asia/Jakarta",
        theme: "dark",
        style: "1",
        locale: "id",
        autosize: true,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
      });
    };
    document.getElementById("tv_chart_container").innerHTML = "";
    document.getElementById("tv_chart_container").appendChild(script);
  }, [symbol]);

  return <div id="tv_chart_container" style={{ height: "500px", marginTop: "2rem" }} />;
};

export default TradingDiary;
