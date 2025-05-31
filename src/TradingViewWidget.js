// src/TradingViewWidget.js
import React, { useEffect, useRef } from "react";

const TradingViewWidget = ({ symbol }) => {
  const container = useRef();

  useEffect(() => {
    if (!symbol || symbol.length < 4) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `IDX:${symbol}`,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "12M",
      colorTheme: "dark",
      trendLineColor: "#37a6ef",
      underLineColor: "rgba(55, 166, 239, 0.15)",
      isTransparent: false,
      autosize: true,
    });

    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }
  }, [symbol]);

  return <div className="tradingview-widget-container" ref={container} style={{ height: 400 }} />;
};

export default TradingViewWidget;
