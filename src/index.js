import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import TradingDiary from './TradingDiary';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1 style={{ color: '#e0e0e0', textAlign: 'center' }}>Terjadi Kesalahan. Silakan Refresh Halaman.</h1>;
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <TradingDiary />
    </ErrorBoundary>
  </React.StrictMode>
);
