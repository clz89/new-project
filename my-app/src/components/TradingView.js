
import React, { useState, useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

export default function TradingViewWidget({pair}) {
  const onLoadScriptRef = useRef();
  
  const [interval, setinvterval] = useState("60")

  useEffect(
    () => {
      onLoadScriptRef.current = createWidget;

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }

      tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

      return () => onLoadScriptRef.current = null;

      function createWidget() {
        if (document.getElementById('tradingview_64214') && 'TradingView' in window) {
          const widget = new window.TradingView.widget({
            autosize: false,
            width: 1400,
            height: 650,
            symbol: `COINBASE:${pair}`,
            interval: interval,
            timezone: "America/Los_Angeles",
            theme: "dark",
            style: "1",
            locale: "en",
            enable_publishing: false,
            withdateranges: true,
            allow_symbol_change: true,
            details: false,
            hotlist: false,
            studies: ["STD;MA%1Cross", "STD;RSI"],
            container_id: "tradingview_64214",
            
          });
         
        } 
      }
    },
    [pair]
  );


  return (
    <div className='tradingview-widget-container'>
      <div id='tradingview_64214' />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a>
      </div>
    </div>
  );
}
