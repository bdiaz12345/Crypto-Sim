import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Plot from 'react-plotly.js';
import { BallTriangle } from 'react-loader-spinner';
import '../styles/dashboard.css'

const coins = [{name: 'ethereum', price: ''}, {name: 'bitcoin', price: ''}, {name: 'dogecoin', price: ''}]

function Dashboard() {
    const [coinData, setCoinData] = useState(coins);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (coin) => {
        let data = { index: [], price: [], volumes: [] };
        let result = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1&interval=1m`)
            .then(result => {
                return result.data
            })
        for (const item of result.prices) {
            data.index.push(item[0]);
            data.price.push(item[1]);
        }
        for (const item of result.total_volumes) data.volumes.push(item[1]);
        return data;
      };

    const coinsWithPrices = () => 
        coinData.map(coin => {
            fetchData(coin.name).then(res => {
                coin.price = res
            })
            return coin
        });


    useEffect(() => {
        fetchCoins();
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        refreshEveryMinute();
    }, []);

    const refreshEveryMinute = () => setInterval(() => {
        fetchCoins();
        setTimeout(() => {
            setIsLoading(false)
        }, 2000);
        console.log('refreshed minute')
    }, 5000);

    const fetchCoins = () => {
        setCoinData(coinsWithPrices());
    }

    return (
        <>
            <h1 className="available-funds">Available Funds: $10,000</h1>
            {isLoading ?
                <div className="loading-spinner">
                    <BallTriangle color="dodgerblue" height={100} width={100} />
                </div>
            :
            <div style={{position: 'fixed', top: '20vh', overflow: 'scroll', height: '80vh', boxShadow: '0 5px 10px 0 rgba(0, 0, 0, .15)', width: '99vw'}}>
                <div className="plot-div">

                    <Plot
                        divId='1'
                        layout={{
                            title: {
                                text: 'Ethereum'
                            },
                            plot_bgcolor: 'aliceblue',
                            paper_bgcolor: 'aliceblue',
                            showlegend: false,
                            xaxis: {
                                domain: [1, 1],
                                anchor: "y2",
                            },
                            yaxis: {
                                domain: [0.1, 1],
                                anchor: "x",
                            },
                            yaxis2: {
                                showticklabels: false,
                                domain: [0, 0.1],
                                anchor: "x",
                            },
                            grid: {
                                roworder: "bottom to top",
                            },
                            width: window.innerWidth * .92
                        }}
                        config={{ responsive: false, displayModeBar: false }}
                        data={
                            [{
                                x: coinData[0].price ? coinData[0].price.index.map((t) => new Date(t)) : null,
                                y: coinData[0].price ? coinData[0].price.price : null,
                                xaxis: "x",
                                yaxis: "y1",
                                type: "scatter",
                                mode: "lines+markers",
                                marker: { color: "blue", size: 2 }
                            }]
                        }
                        />
                        <div className="price-trade">
                            <h2>Price: ${coinData[0].price ? coinData[0].price.price[coinData[0].price.price.length - 1].toString().slice(0, 4) : null}</h2>
                            <button className="trade-button">Trade</button>
                        </div>
                </div>
                <div className="plot-div">
                        <Plot
                        divId='2'
                        layout={{
                            title: {
                                text: 'BitCoin'
                            },
                            plot_bgcolor: 'aliceblue',
                            paper_bgcolor: 'aliceblue',
                            showlegend: false,
                            xaxis: {
                                domain: [1, 1],
                                anchor: "y2",
                            },
                            yaxis: {
                                domain: [0.1, 1],
                                anchor: "x",
                            },
                            yaxis2: {
                                showticklabels: false,
                                domain: [0, 0.1],
                                anchor: "x",
                            },
                            grid: {
                                roworder: "bottom to top",
                            },
                            width: window.innerWidth * .92
                        }}
                        config={{ responsive: false, displayModeBar: false }}
                        data={
                            [{
                                x: coinData[1].price ? coinData[1].price.index.map((t) => new Date(t)) : null,
                                y: coinData[1].price ? coinData[1].price.price : null,
                                xaxis: "x",
                                yaxis: "y1",
                                type: "scatter",
                                mode: "lines+markers",
                                marker: { color: "orange", size: 2 }
                            }]
                        }
                        />
                        <div className="price-trade">
                            <h2>Price: ${coinData[1].price ? coinData[1].price.price[coinData[1].price.price.length - 1].toString().slice(0, 5) : null}</h2>
                            <button className="trade-button">Trade</button>
                        </div>
                    </div>
                    <div className="plot-div">

                        <Plot
                        divId='3'
                        layout={{
                            title: {
                                text: 'DogeCoin'
                            },
                            plot_bgcolor: 'aliceblue',
                            paper_bgcolor: 'aliceblue',
                            showlegend: false,
                            xaxis: {
                                domain: [1, 1],
                                anchor: "y2",
                            },
                            yaxis: {
                                domain: [0.1, 1],
                                anchor: "x",
                            },
                            yaxis2: {
                                showticklabels: false,
                                domain: [0, 0.1],
                                anchor: "x",
                            },
                            grid: {
                                roworder: "bottom to top",
                            },
                            width: window.innerWidth * .92
                        }}
                        config={{ responsive: false, displayModeBar: false }}
                        data={
                            [{
                                x: coinData[2].price ? coinData[2].price.index.map((t) => new Date(t)) : null,
                                y: coinData[2].price ? coinData[2].price.price : null,
                                xaxis: "x",
                                yaxis: "y1",
                                type: "scatter",
                                mode: "lines+markers",
                                marker: { color: "red", size: 2 }
                            }]
                        }
                        />
                        <div className="price-trade">
                            <h2>Price: ${coinData[2].price ? coinData[2].price.price[coinData[2].price.price.length - 1].toString().slice(0, 6) : null}</h2>
                            <button className="trade-button">Trade</button>
                        </div>
                    </div>
                </div>
            }
            
		</>
    )
}

export default Dashboard;