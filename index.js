require("dotenv").config();
const ccxt = require("ccxt");
const axios = require ('axios');
const TradingView = require("@mathieuc/tradingview");
const client = new TradingView.Client();
const getData = require("./indicator.js");
const longMore = 0;
const shortMore = 0;
const kwota = 10;

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

    

    //ETHBUSD
    const orders = await binanceClient.fetchOpenOrders(symbol=market);
    orders.forEach(async order => {
        await binanceClient.cancelOrder(order.id, order.symbol);
    });
    
    //LONG 
    await binanceClient.createOrder(market, 'limit', 'buy', kwota/data['MediumCycleBottom'], data['MediumCycleBottom'], paramsLong)
    
    if(FastOsc <= -0.5){
        longMore = 1;
    }

    if(longMore == 1 && FastOsc >= 0){
        await binanceClient.createOrder(market, 'market', 'buy', kwota/data['MediumCycleBottom'], paramsLong)
        longMore = 0
    }

    //close_position = await binanceClient.closeLong(symbol=market, type="MARKET", kwota/2) 

    //SHORT
    await binanceClient.createOrder(market, 'limit', 'sell', kwota/data['MediumCycleTop'], data['MediumCycleTop'], paramsShort)
    
    if(FastOsc >= 1.5){
        shortMore = 1;
    }

    if(shortMore == 1 && FastOsc <= 1){
        await binanceClient.createOrder(market, 'market', 'sell', kwota/data['MediumCycleTop'], paramsShort)
        shortMore = 0
    }

    const positions = await binanceClient.fetchPositions(symbols=[market])
    positions.forEach(async pos => {
        console.log(pos)
        if (pos.side === 'long') {
            console.log('in1')
            console.log(pos.contracts/2)
            await binanceClient.createOrder(market, 'TAKE_PROFIT', 'sell', pos.contracts/2, price = data['MediumCycleTop'], params = {'stopPrice': price, 'positionSide': 'LONG'});
        }
        if (pos.side === 'short') {
            //console.log('in2')
            //console.log(await binanceClient.createOrder(market, 'market', side = 'buy',  amount = kwota, { 'reduceOnly': true}));
        }
    });
};
const run = async() => {
    tick()

    const d = new Date();
    const minutes = 15 - (d.getMinutes() % 15);

    setInterval(tick, minutes*60*1000)
};


run();