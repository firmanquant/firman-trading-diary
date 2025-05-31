// src/TradeTable.js
import React from "react";

const TradeTable = ({ journal, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Symbol</th>
          <th>Entry</th>
          <th>Exit</th>
          <th>Alasan</th>
          <th>Emosi</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {journal.map((entry, i) => (
          <tr key={i}>
            <td>{entry.date}</td>
            <td>{entry.symbol}</td>
            <td>{entry.entry}</td>
            <td>{entry.exit}</td>
            <td>{entry.reason}</td>
            <td>{entry.emotion}</td>
            <td>
              <button onClick={() => onDelete(i)}>❌</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TradeTable;
