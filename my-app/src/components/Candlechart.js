import React, { Component } from "react";
import Chart from "react-apexcharts";


function Candles({price, data, pair}) {
  console.log("yonjd")
  const newdata = data.length>0 ? data : null
  let emptySeries = [{
    data:[]
  }]
  let series =  [{
    data: newdata?.map((v) => {
      const ts = v[0];
      let date = new Date(ts * 1000);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let yearslice = year.toString().slice(0-2)
      let final = `${month}-${day}-${yearslice}`;
  
      return {
        x:final,
        y:[v[3], v[2], v[1], v[4]]
      }
    })
    }]
  
  let options =  {
    
    chart: {
      zoom: {
        type: 'xy',  
        autoScaleYaxis: true,   
    }
    },
    title: {
      text: 'CandleStick Chart',
      align: 'left'
    },
    xaxis: {
      type: 'category',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      
    }
  };
  if (price === "0.00") {
    return <h2>please select a currency pair</h2>;
  }
return (
<div className="dashboard">
  <span style={{marginBottom:-20, marginTop:10, color:"black"}}><b>{pair}</b></span>
<h2>{`$${price}`}</h2>
<div className="chart-container" id="chart">
<Chart options={options} series={series.length>0 ? series : emptySeries} type="candlestick" height={500} />
</div>
</div>
);
}
export default Candles;