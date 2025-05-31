import React, { useState, useEffect } from "react";
import { fetchData } from "./lib/groq";
import { fetchSignal } from "./lib/signal";
import TradingViewWidget from "./TradingViewWidget";
import SignalDashboard from "./SignalDashboard";
import TradeTable from "./TradeTable";

const TradingDiary = () => {
  const [symbol, setSymbol] = useState("");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [reason, setReason] = useState("");
  const [emotion, setEmotion] = useState("");
  const [journal, setJournal] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("journal");
    if (stored) setJournal(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("journal", JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    if (!symbol || symbol.length < 4) {
      setAnalysis(null);
      setSignal(null);
      return;
    }
    setLoading(true);
    Promise.all([fetchData(symbol), fetchSignal(symbol)])
      .then(([a, s]) => {
        setAnalysis(a);
        setSignal(s);
      })
      .catch(() => {
        setAnalysis("error");
        setSignal("error");
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  const handleAdd = () => {
    if (!symbol || !entry || !exit) return;
    const newRow = {
      date: new Date().toLocaleDateString("en-GB"),
      symbol: symbol.toUpperCase(),
      entry,
      exit,
      reason,
      emotion,
    };
    setJournal([newRow, ...journal]);
    setEntry("");
    setExit("");
    setReason("");
    setEmotion("");
  };

  const handleDelete = (index) => {
    const updated = [...journal];
    updated.splice(index, 1);
    setJournal(updated);
  };

  const wins = journal.filter((j) => Number(j.exit) > Number(j.entry)).length;
  const losses = journal.filter((j) => Number(j.exit) < Number(j.entry)).length;
  const total = journal.length;
  const winRate = total ? ((wins / total) * 100).toFixed(1) : 0;

  const isSymbolValid = symbol && symbol.length >= 4;

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center text-sky-400">Firman Trading Diary</h1>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <input placeholder="05/31/2025" className="bg-black border p-1" disabled />
        <input placeholder="Kode Saham" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="bg-black border p-1" />
        <input placeholder="Entry" value={entry} onChange={(e) => setEntry(e.target.value)} className="bg-black border p-1" />
        <input placeholder="Exit" value={exit} onChange={(e) => setExit(e.target.value)} className="bg-black border p-1" />
        <input placeholder="Alasan" value={reason} onChange={(e) => setReason(e.target.value)} className="bg-black border p-1" />
        <input placeholder="Emosi" value={emotion} onChange={(e) => setEmotion(e.target.value)} className="bg-black border p-1" />
        <button onClick={handleAdd} className="bg-green-600 px-3">Simpan</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-3">
          <h2 className="text-pink-400 text-lg mb-2">🧠 Analisis Groq</h2>
          {loading ? (
            <p>Memuat analisis...</p>
          ) : !isSymbolValid ? null : analysis === "error" ? (
            <p className="text-red-400">Gagal memuat analisis.</p>
          ) : (
            <p>{analysis}</p>
          )}
        </div>

        <div className="bg-black p-3">
          {isSymbolValid && <TradingViewWidget symbol={symbol} />}
        </div>

        <div className="bg-zinc-900 p-3">
          <h2 className="text-pink-400 text-lg mb-2">📉 Dashboard Mini</h2>
          {loading ? (
            <p>Memuat sinyal...</p>
          ) : !isSymbolValid ? null : signal === "error" ? (
            <p className="text-red-400">Gagal memuat sinyal.</p>
          ) : (
            <SignalDashboard data={signal} />
          )}
        </div>
      </div>

      <div className="text-center mt-6">
        <button onClick={() => setShowTable(!showTable)} className="bg-green-600 px-4 py-1 rounded">
          {showTable ? "Sembunyikan Tabel" : "Tampilkan Tabel"}
        </button>
      </div>

      {showTable && (
        <>
          <div className="flex justify-center mt-4 gap-6">
            <div className="bg-black px-4 py-2 rounded">Total Trade<br /><strong>{total}</strong></div>
            <div className="bg-black px-4 py-2 rounded">Win Rate<br /><strong>{winRate}%</strong></div>
            <div className="bg-black px-4 py-2 rounded">Gain / Loss<br /><strong>{wins} / {losses}</strong></div>
          </div>
          <TradeTable journal={journal} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
};

export default TradingDiary;
