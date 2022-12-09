require("dotenv").config();
const ccxt = require("ccxt");
const axios = require ('axios');
const TradingView = require("@mathieuc/tradingview");
const client = new TradingView.Client();
const getData = require("./indicator.js");
const longMore = 0;
const shortMore = 0;
const amount = 10;

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
    const FastOsc = data['FastOsc']
    console.log("FastOsc: " + FastOsc)
    paramsLong = {
        'positionSide': 'LONG' 
    }  
    paramsShort = {
        'positionSide': 'SHORT' 
    }

    const pos = await binanceClient.fetchPositions(symbols=[market])

    //ETHBUSD
    const orders = await binanceClient.fetchOpenOrders(symbol=market);
    orders.forEach(async order => {
        await binanceClient.cancelOrder(order.id, order.symbol);
    });
    
    //LONG 
    await binanceClient.createOrder(market, 'limit', 'buy', amount/data['MediumCycleBottom'], data['MediumCycleBottom'], paramsLong)
    
    if(FastOsc <= -0.5){
        longMore = 1;
    }

    if(longMore == 1 && FastOsc >= 0){
        await binanceClient.createOrder(market, 'market', 'buy', amount/data['MediumCycleBottom'], paramsLong)
        longMore = 0
    }

    //close_position = await binanceClient.createOrder(symbol=market, type="MARKET", side="buy", amount=pos['positionAmt']/2, params={"reduceOnly": True}) 

    //SHORT
    await binanceClient.createOrder(market, 'limit', 'sell', amount/data['MediumCycleTop'], data['MediumCycleTop'], paramsShort)
    
    if(FastOsc >= 1.5){
        shortMore = 1;
    }

    if(shortMore == 1 && FastOsc <= 1){
        await binanceClient.createOrder(market, 'market', 'sell', amount/data['MediumCycleTop'], paramsShort)
        shortMore = 0
    }

    
};
const run = async() => {
    tick()

    const d = new Date();
    const minutes = 15 - (d.getMinutes() % 15);

    setInterval(tick, minutes*60*1000)
};


run();