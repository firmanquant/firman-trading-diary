import React, { useState, useEffect } from 'react';
import SignalDashboard from './SignalDashboard';

// Komponen TradingView Chart
const TVChart = ({ symbol = "IDX:BBCA" }) => {
  useEffect(() => {
    const container = document.getElementById("tv_chart_container");
    if (!container) return;

    container.innerHTML = ""; // Reset chart

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
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
      } else {
        console.error("TradingView widget failed to load.");
      }
    };

    script.onerror = () => {
      console.error("Failed to load TradingView script.");
    };

    container.appendChild(script);
  }, [symbol]);

  return <div id="tv_chart_container" style={{ height: "350px" }} />;
};

// Kelas FirmanQuantStrategy
class FirmanQuantStrategy {
  // ... (tetap sama seperti sebelumnya)
}

// Fungsi untuk menghasilkan data historis simulasi dengan seed
const simulateHistoricalData = (ticker, numBars = 50) => {
  // ... (tetap sama seperti sebelumnya)
};

// Fungsi untuk menghitung ATR
const calcATR = (data, length) => {
  // ... (tetap sama seperti sebelumnya)
};

const TradingDiary = () => {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('tradingEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  const [form, setForm] = useState({
    date: '',
    ticker: '',
    entry: '',
    exit: '',
    reason: '',
    emotion: ''
  });

  const [ticker, setTicker] = useState('BBCA');
  const [strategy, setStrategy] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [fourHourData, setFourHourData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [groqAnalysis, setGroqAnalysis] = useState('');

  const fetchGroqAnalysis = async () => {
    // ... (tetap sama seperti sebelumnya)
  };

  useEffect(() => {
    // ... (tetap sama seperti sebelumnya)
  }, [ticker]);

  useEffect(() => {
    if (indicators) {
      fetchGroqAnalysis();
    }
  }, [indicators, ticker]);

  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'ticker') {
      setTicker(value.toUpperCase() || 'BBCA');
    }
  };

  const handleAdd = () => {
    if (!form.date || !form.ticker || !form.entry || !form.exit) {
      alert('Harap isi semua kolom wajib: Tanggal, Ticker, Entry Price, dan Exit Price.');
      return;
    }

    const newEntry = {
      ...form,
      entry: parseFloat(form.entry),
      exit: parseFloat(form.exit),
    };

    setEntries(prevEntries => [...prevEntries, newEntry]);

    setForm({
      date: '',
      ticker: '',
      entry: '',
      exit: '',
      reason: '',
      emotion: ''
    });

    alert('Entri berhasil ditambahkan!');
  };

  const handleDelete = (index) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus entri ini?')) {
      setEntries(prevEntries => prevEntries.filter((_, i) => i !== index));
      alert('Entri berhasil dihapus!');
    }
  };

  const calcResult = (entry, exit) => {
    if (isNaN(entry) || isNaN(exit)) return 'Data Tidak Valid';
    return (exit - entry);
  };

  const calcGain = (entry, exit) => {
    if (isNaN(entry) || entry === 0) return 'Data Tidak Valid';
    return (((exit - entry) / entry) * 100);
  };

  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => calcResult(e.entry, e.exit) > 0).length;
  const totalGainLoss = entries.reduce(
    (sum, e) => sum + (parseFloat(e.exit) - parseFloat(e.entry)),
    0
  );

  const toggleTable = () => {
    setShowTable(prevShowTable => !prevShowTable);
  };

  return (
    <div className="container">
      <h1>Firman Trading Diary</h1>

      <div className="form">
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          placeholder="Tanggal"
        />
        <input
          name="ticker"
          placeholder="Ticker (contoh: BBCA)"
          value={form.ticker}
          onChange={handleChange}
        />
        <input
          name="entry"
          type="number"
          placeholder="Entry Price"
          value={form.entry}
          onChange={handleChange}
        />
        <input
          name="exit"
          type="number"
          placeholder="Exit Price"
          value={form.exit}
          onChange={handleChange}
        />
        <input
          name="reason"
          placeholder="Alasan Setup"
          value={form.reason}
          onChange={handleChange}
        />
        <input
          name="emotion"
          placeholder="Catatan Emosi"
          value={form.emotion}
          onChange={handleChange}
        />
        <button onClick={handleAdd}>+ Tambah Entry</button>
      </div>

      {/* Komponen TradingView Chart */}
      <TVChart symbol={`IDX:${ticker}`} />

      {/* Summary Dashboard */}
      <div className="summary-dashboard-container">
        <h2>Ringkasan Performa</h2>
        <p>Total Trade: {totalTrades}</p>
        <p>Win Rate: {totalTrades > 0 ? ((winningTrades / totalTrades) * 100) : 0}%</p>
        <p>Total Gain/Loss: {totalGainLoss.toFixed(2)}</p>
      </div>

      {/* Tabel Entri */}
      {showTable && (
        <div className="entries-table">
          <h2>Daftar Entri</h2>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Ticker</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Result</th>
                <th>Gain%</th>
                <th>Alasan</th>
                <th>Emosi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.ticker}</td>
                  <td>{entry.entry}</td>
                  <td>{entry.exit}</td>
                  <td>{calcResult(entry.entry, entry.exit)}</td>
                  <td>{calcGain(entry.entry, entry.exit)}%</td>
                  <td>{entry.reason}</td>
                  <td>{entry.emotion}</td>
                  <td>
                    <button onClick={() => handleDelete(index)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={toggleTable}>
        {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
      </button>

      {/* Analisis Groq */}
      {groqAnalysis && (
        <div className="groq-analysis">
          <h2>Analisis Saham {ticker}</h2>
          <p>{groqAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default TradingDiary;
