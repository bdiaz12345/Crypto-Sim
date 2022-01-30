import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios';
import Plot from 'react-plotly.js';
import { BallTriangle } from 'react-loader-spinner';
import '../styles/dashboard.css'
import Modal from 'react-modal';
import LoadingBar from 'react-top-loading-bar';

const phoneSize = window.matchMedia("(max-width: 500px)").matches

const user = JSON.parse(localStorage.getItem('cryptoUser')) ? JSON.parse(localStorage.getItem('cryptoUser')) : {}
console.log(user)

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    boxSizing: 'border-box',
    objectFit: 'contain',
    overFlow: 'none',
    height: phoneSize ? window.innerHeight * .8 : window.innerHeight * .7,
    padding: phoneSize ? '1rem .3rem' : '2rem 2rem 1rem 2rem',
    marginRight: 0,
    transform: 'translate(-50%, -50%)',
  },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('body');

const coins = [{name: 'ethereum', price: ''}, {name: 'bitcoin', price: ''}, {name: 'dogecoin', price: ''}, {name: 'litecoin', price: ''}]
let assets = []
const initialFunds = 10000

function Dashboard() {
    const [coinData, setCoinData] = useState(coins);
    const [buffer, setBuffer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState({});
    const [availableFunds, setAvailableFunds] = useState(user.availableFunds ? user.availableFunds : initialFunds);
    const [amountToBuy, setAmountToBuy] = useState(0);
    const [currentAssets, setCurrentAssets] = useState(user.assets ? user.assets : assets);
    const [currentAssetPrices, setCurrentAssetPrices] = useState([]);
    const [totalValue, setTotalValue] = useState(user.totalValue ? user.totalValue : initialFunds);
    const [progress, setProgress] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const [localData, setLocalData] = useState(user);

    const [modalIsOpen, setIsOpen] = React.useState(false);

    const ref = useRef(null);

    const handleInitialLoad = () => {
        ref.current.continuousStart();
      };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    function openModal(e) {
        setSelectedCoin(e)
        console.log(e)
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        // subtitle.style.color = '#f00';
    }

    function closeModal() {
        setIsOpen(false);
    }

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

    const resetTotal = () => {
        if (assets.length > 0) {
            let total = 0;
            assets.forEach(asset => {
                total += asset.price
            })
            console.log(total)
            setTotalValue(availableFunds + total)
            console.log(totalValue)
        } else {
            setTotalValue(availableFunds)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 10000)
        ref.current.complete();
    }, [coinData[2].price.length ? coinData[2].price : null])

    useEffect(() => {
        handleInitialLoad();
        refreshEveryMinute();
        if (currentAssets.length > 0) {
            let total = 0;
            currentAssets.forEach(asset => {
                total += asset.price
            })
            setTotalValue(availableFunds + total)
        }
        setTimeout(() => {
            const tempUser = {assets: currentAssets, totalValue: totalValue, availableFunds: availableFunds}
            console.log('user', JSON.parse(localStorage.getItem('cryptoUser')))
            if (!localData.length) {
                localStorage.setItem('cryptoUser', JSON.stringify(tempUser))
                setLocalData(JSON.parse(localStorage.getItem('cryptoUser')));
            }
        }, 10000)
    }, [])
    
    const refreshEveryMinute = () => setInterval(() => {
        if (selectedCoin) {
            console.log(currentAssetPrice)
            console.log({currentAssets: currentAssets, assets: assets, selectedCoin: selectedCoin})
        }
        setBuffer(true);
        fetchCoins();
        if (currentAssets.length > 0) {
            setCurrentAssets(currentAssets.map(asset => {
                coinData.forEach(coin => {
                    if (coin.name === asset.name) {
                        asset.price = coin.price.price[coin.price.price.length - 1] * asset.fraction
                    }
                })
                console.log(asset)
                setCurrentAssetPrices([...currentAssetPrices, asset.price.toString().slice(0, 6)])
                return asset
            }))
        }
        setBuffer(false);
    }, 10000);

    useEffect(() => {
        resetTotal();
    }, [refreshEveryMinute])


    const fetchCoins = () => {
        setCoinData(coinsWithPrices());
    }

    const onBuy = () => {
        if (amountToBuy > availableFunds) {
            setDisabled(true);
        } else {
            setDisabled(false)
            const fraction = amountToBuy / selectedCoin.price.price[selectedCoin.price.price.length - 1]
            setAvailableFunds(availableFunds - amountToBuy)
            assets.push({name: selectedCoin.name, price: selectedCoin.price.price[selectedCoin.price.price.length - 1] * fraction, fraction: fraction})
            setCurrentAssets(assets)
            setAmountToBuy(0)
            console.log('assets', currentAssets)
            localStorage.setItem('cryptoUser', JSON.stringify({assets: assets, availableFunds: availableFunds - amountToBuy, totalValue: totalValue}))
            setLocalData(JSON.parse(localStorage.getItem('cryptoUser')));
            console.log('local data', localData)
        }
    }

    const sellFunctionHandler = () => {
        currentAssets.forEach(asset => {
            if (asset.name === selectedCoin.name) {
                setAvailableFunds(availableFunds + asset.price)
                assets =  assets.filter(asset => {
                    return asset.name !== selectedCoin.name
                })
                localStorage.setItem('cryptoUser', JSON.stringify({assets: assets, availableFunds: availableFunds + asset.price, totalValue: totalValue}))
                setLocalData(JSON.parse(localStorage.getItem('cryptoUser')));
            }
        })
        setCurrentAssets(assets)
        refreshEveryMinute();
    }

    const onSell = () => {
        if (buffer) {
            setTimeout(() => {
                sellFunctionHandler();
            }, 5000)
        } else {
            sellFunctionHandler();
        }
    }

    const setAmountToBuyHandler = (e) => {
        setAmountToBuy(e)
    }

    // const getCurrentAssetPrice = (asset) => {
    //     let assetPrice;
    //     if (asset.name === selectedCoin.name) {
    //         console.log(asset.price)
    //         const assetFraction = asset.fraction;
    //         assetPrice = selectedCoin.price * assetFraction;
    //     } 
    //     console.log(assetPrice)
    //     // return(assetPrice[0])
    // }

    // const currentAssetPrice = () => user.assets ? user.assets.filter(asset => {
    //     getCurrentAssetPrice(asset)
    // }) : assets.filter(asset => {
    //     getCurrentAssetPrice(asset)
    // })
    const currentAssetPrice = currentAssets.length ? currentAssets.filter(asset => {
        console.log(asset)
        let tempAssetPrice
        if (asset.name === selectedCoin.name) {
            console.log(selectedCoin.price)
            tempAssetPrice = asset.fraction * selectedCoin.price[selectedCoin.price.length - 1]
            console.log(asset)
        }
        console.log(tempAssetPrice)
        return tempAssetPrice
    })
    : assets.find(asset => asset.name === selectedCoin.name);

    return (
        <div className="dash">
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <Plot
                    layout={{
                        title: {
                            text: selectedCoin.name ? capitalizeFirstLetter(selectedCoin.name) : null
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
                        width: window.innerWidth * .9,
                    }}
                    config={{ responsive: false, displayModeBar: false }}
                    data={
                        [{
                            x: selectedCoin.price ? selectedCoin.price.index.map((t) => new Date(t)) : null,
                            y: selectedCoin.price ? selectedCoin.price.price : null,
                            xaxis: "x",
                            yaxis: "y1",
                            type: "scatter",
                            mode: "lines+markers",
                            marker: { color: "blue", size: 2 }
                        }]
                    }
                    />
                    <div className="single-plot-div">
                        <h2>Price: ${selectedCoin.price ? selectedCoin.price.price[selectedCoin.price.price.length - 1].toString().slice(0, 7) : null}</h2>
                        <div className="buy-div">
                            <h2>$</h2><input value={amountToBuy} onChange={(e) => {setAmountToBuyHandler(e.target.value); console.log(e.target.value)}} className="buy-input" placeholder="1000"/>
                            <button onClick={onBuy} className="buy-button">Buy</button>
                            {disabled ? <p style={{color: 'red', display: 'flex', alignSelf: 'center', marginLeft: '.5rem', marginTop: '.5rem'}}>Not enough funds.</p> : null}
                        </div>
                        <div className="sell-div">
                            {/* <input className="sell-input" placeholder="$1000"/> */}
                            <h2>${currentAssetPrice ? currentAssetPrice[0] : '0'}</h2>
                            <button onClick={onSell} className="sell-button">Sell All</button>
                        </div>
                        <h2>Available Funds: ${availableFunds}</h2>
                    </div>
            </Modal>
            <div className="funds-div">
                <h1 className="available-funds">Available Funds: ${availableFunds.toString().slice(0, 8)}</h1>
                <h1 className="total-funds">Total Value: ${totalValue.toString().slice(0, 8)}</h1>
            </div>
            {isLoading || !coinData[0].price || !coinData[1].price || !coinData[2].price ?
                <div className="loading-spinner">
                    <LoadingBar height={4} color="gold" ref={ref} progress={progress} loaderSpeed={7000} />
                    <BallTriangle color="dodgerblue" height={100} width={100} />
                </div>
            :
            <div className="dash-sub">
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
                                marker: { color: "green", size: 2 }
                            }]
                        }
                        />
                        <div className="price-trade">
                            <h2>Price: ${coinData[0].price ? coinData[0].price.price[coinData[0].price.price.length - 1].toString().slice(0, 4) : null}</h2>
                            <button onClick={() => {openModal(coinData[0])}} className="trade-button">Trade</button>
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
                            <button onClick={() => {openModal(coinData[1])}} className="trade-button">Trade</button>
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
                            <button onClick={() => {openModal(coinData[2])}} className="trade-button">Trade</button>
                        </div>
                    </div>
                    
                    <div className="plot-div">

                    <Plot
                        divId='4'
                        layout={{
                            title: {
                                text: 'LiteCoin'
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
                                x: coinData[3].price ? coinData[3].price.index.map((t) => new Date(t)) : null,
                                y: coinData[3].price ? coinData[3].price.price : null,
                                xaxis: "x",
                                yaxis: "y1",
                                type: "scatter",
                                mode: "lines+markers",
                                marker: { color: "purple", size: 2 }
                            }]
                        }
                        />
                        <div className="price-trade">
                            <h2>Price: ${coinData[3].price ? coinData[3].price.price[coinData[3].price.price.length - 1].toString().slice(0, 3) : null}</h2>
                            <button onClick={() => {openModal(coinData[3])}} className="trade-button">Trade</button>
                        </div>
                </div>
                </div>
            }
            
		</div>
    )
}

export default Dashboard;