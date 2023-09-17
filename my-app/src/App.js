import React, { useState, useEffect, useRef } from "react";
import { formatData } from "./utils";
import Navi from "./Nav";
import Candlechart from "./components/Candlechart";
import TradingViewWidget from "./components/TradingView";
import "./styles.css";

export default function App() {
  const [currencies, setcurrencies] = useState([]);
  const [pair, setpair] = useState("BTC-USD");
  const [TVpair, setTVpair] = useState("BTCUSD");
  const [price, setprice] = useState("0.00");
  const [pastData, setpastData] = useState({});
  const [prices, setprices] = useState([]);
  const [ticker, setticker] = useState({index:0, pair: ""});
  const [tickers, settickers] = useState([]);

  const ws = useRef(null);

  let first = useRef(false);
  const url = "https://api.pro.coinbase.com";

  
   useEffect(() => {
    
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");

    let pairs = [];
    let pairs2 = []

    const apiCall = async () => {
      await fetch(url + "/products")
        .then((res) => res.json())
        .then((data) => (pairs = data));
      
      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === "USD") {
          return pair;
        }
        return null;
      });

      filtered = filtered.sort((a, b) => {
        if (a.base_currency < b.base_currency) {
          return -1;
        }
        if (a.base_currency > b.base_currency) {
          return 1;
        }
        return 0;
      });
      pairs2 = filtered
      setcurrencies(filtered);

      first.current = true;
    };

    apiCall();
   

    const apiCall2 = async () => {
      
      let prices = [];

      await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD")
        .then((res) => res.json())
        .then((data) => (prices = data));
  
        let pricesArr = Object.entries(prices.data.rates);
        
        let filtered = pricesArr.filter((pair) => {
            let curr = pairs2?.filter((cur) => {
            if (cur.id.includes(`${pair[0]}-USD`)) {
              return cur;
            }
            return null;
          })
          if(curr.length>0){
          let toUSD = 1/pair[1]
          let toUSD2 = toUSD.toString().substring(0,7)
          pair[1] = "$" + toUSD2
          return pair;
          }
          return null;
      });
      setprices(filtered);
    };
    
    apiCall2();
    const interval = setInterval(() => {
      apiCall2();
    }, 3000);
    return () => clearInterval(interval);
     
  }, []);
useEffect(() => {
  const interval = setInterval(() => {
    let newdata = []
    let cur = prices.filter((cur, i) => {
      let curid=`${cur[0]}-USD`
      if(i===ticker.index){
        const apiCall3 = async () => {
          await fetch(`https://api.exchange.coinbase.com/products/${curid}/ticker`)
          .then((res) => res.json())
          .then((data) => (newdata = data));
          newdata["cur"] = curid
          let idx = []
          if(prices.length<=tickers.length){
            let filtered = tickers.map((tick, i) => {
              if(tick.cur===curid){
                console.log(curid)
                idx.push(newdata)
                if(idx.length>1){
                  let newreturn = {cur: ""}
                  return newreturn;
                }else{
                  if (newdata.message) {
                    return {cur: curid}
                  }else{
                  return newdata;
                  }
                }
                
              }
              return tick;
            })
           
            settickers(filtered)
          }else{
          settickers([...tickers, newdata])
          }
        }
        apiCall3() 
        setticker({index: i+1, pair: curid})
        return cur;
      }else{
        return null;
      }
    })
    if(cur.length<1){
      setticker({index: 0, pair: ""})
    }
    
  }, 300);
  return () => clearInterval(interval);
}, [ticker, prices, tickers.length, tickers])

  useEffect(() => {
    ws.current.onopen = () => {
    if(price==="0.00"){
     let msg = {
      type: "subscribe",
      product_ids: [pair],
      channels: ["ticker"]
    };
    let jsonMsg = JSON.stringify(msg);
    ws.current.send(jsonMsg);

     ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      if (data.type !== "ticker") {
        return;
      }

      if (data.product_id === pair) {
        console.log("yo")
        setprice(data.price);
      }
    }
    };
    }
  }, [price, pair])

  useEffect(() => {
    if (!first.current) {
      
      return;
    }

    let msg = {
      type: "subscribe",
      product_ids: [pair],
      channels: ["ticker"]
    };
    let jsonMsg = JSON.stringify(msg);
    ws.current.send(jsonMsg);

    let historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`;
    const fetchHistoricalData = async () => {
      let dataArr = [];
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data) => (dataArr = data));
      if(dataArr.message==='NotFound'){
        setprice("Not Found")
        setpastData([])
        return;
      }  
      //let formattedData = formatData(dataArr);
      setpastData(dataArr?.reverse());
      
    
    };

    fetchHistoricalData();
    ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      if (data.type !== "ticker") {
        return;
      }

      if (data.product_id === pair) {
        console.log("yo")
        setprice(data.price);
      }
    };
  }, [pair]);   


  const handleSelect = (e) => {
    let data = e.coinbase
    let TVdata = e.tradingview
    let unsubMsg = {
      type: "unsubscribe",
      product_ids: [pair],
      channels: ["ticker"]
    };
    let unsub = JSON.stringify(unsubMsg);

    ws.current.send(unsub);
    console.log()
    setpair(data);
    setTVpair(TVdata)
  };
 

  const handleAllPairs = () => {
    let newdata = []
    let newdata2 = []
      currencies.map((cur) => {
      
         const apiCall3 = async () => {
        await fetch(`https://api.exchange.coinbase.com/products/${cur.id}/ticker`)
        .then((res) => res.json())
        .then((data) => (newdata = data));
      }
      apiCall3() 
        console.log(newdata)
        return newdata2.push(newdata);
      })
     console.log(newdata2)
  }

  return (
    <div className="main">
            <Navi/>
    <div className="container">
        <span style={{marginBottom:0, marginTop:10, color:"black"}}><b>{pair ? pair : "No coin selected"}</b></span>
        <span><b>{`$${price}`}</b></span>
      <div className="dashboard"> 
      <div>
        <div styles={{}} className="cur-head">
              <span><b>List:</b></span>
              <span><b>Coins:</b></span>
              <span style={{marginRight:25}}><b>Price:</b></span>
        </div>
        <div className="cur-list">
        {prices?.map((cur, idx) => {
            return(
            <button onClick={e => handleSelect({coinbase:`${cur[0]}-USD`, tradingview: `${cur[0]}USD`})} className={`${cur[0]}-USD`!== pair ? "cur-divs" : "cur-divs cur-highlight"} key={idx} value={`${cur[0]}-USD`}>
                
                  <span><b>{idx + 1}</b></span>
                  <span><b>{cur[0]}</b></span>
                  <span style={{width:52}}><b>{pair===`${cur[0]}-USD` ? price : cur[1]}</b></span>
                
            </button>)
          }) 
          }
      </div>
      </div>
      <div>
       <div className="cur-list">
        {tickers!==null &&
        tickers?.map((tick, i) => {
          let TVtick = tick.cur.slice(-0,-4)
          console.log(TVtick)
          return(
            <button onClick={e => handleSelect({coinbase: tick.cur, tradingview: `${TVtick}USD`})} className={tick.cur!== pair ? "cur-divs" : "cur-divs cur-highlight"} key={i} value={tick.cur}>
                
            <span><b>{i+1}</b></span>
            <span><b>{tick?.cur}</b></span>
            <span><b>{tick?.price}</b></span>
            <span style={{width:70}}><b>{`$${tick?.volume * tick?.price}`}</b></span>
      </button>
          )
        })}
        </div>
        </div>
      </div>
      {/*<Dashboard price={price} data={pastData} />*/}
      {/*
        <select name="currency" value={pair} onChange={handleSelect}>
          {currencies?.map((cur, idx) => {
            return (
              <option key={idx} value={cur.id}>
                {cur.id}
              </option>
            );
          })}
        </select>
        */ }
        
      <TradingViewWidget pair={TVpair} />
    </div>
    </div>
  );
}
