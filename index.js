require("dotenv").config();
const ccxt = require("ccxt");
const axios = require ('axios');
const TradingView = require("@mathieuc/tradingview");
const client = new TradingView.Client();
const getData = require("./indicator.js");


async function tick () {
    binanceClient = new ccxt.binanceusdm({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });

    //const { asset, base } = config;
    //const market = `${asset}/${base}`;
    //console.log(config)
    const market = 'ETH/BUSD'
    data = await getData(TradingView, client);
    console.log('MediumCycleTop: ' + data['MediumCycleTop'])
    console.log("MediumCycleBottom: " + data['MediumCycleBottom'])
    paramsLong = {
        'positionSide': 'LONG' 
    }  
    paramsShort = {
        'positionSide': 'SHORT' 
    }
    const orders = await binanceClient.fetchOpenOrders(symbol=market);
    orders.forEach(async order => {
        await binanceClient.cancelOrder(order.id, order.symbol);
        console.log(order)
    });
    await binanceClient.createOrder(market, 'limit', 'buy', 10/data['MediumCycleBottom'], data['MediumCycleBottom'], paramsLong)
    

    //close_position = binance.create_order(symbol=symbol, type="MARKET", side="buy", amount=pos['positionAmt'], params={"reduceOnly": True}) 
    //await binanceClient.createLimitSellOrder(market, 0.01, data['MediumCycleTop']);
};
//fetchTicker(market)
const run = async() => {
    tick()

    const d = new Date();
    const minutes = 15 - (d.getMinutes() % 15);

    setInterval(tick, minutes*60*1000)
};


run();