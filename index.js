require("dotenv").config();
const ccxt = require("ccxt");
const axios = require ('axios');
const TradingView = require("@mathieuc/tradingview");
const client = new TradingView.Client();
const getData = require("./indicator.js");
let longMore = 0;
let shortMore = 0;
const kwota = 16;
let jeden = 0;
let dwa = 0;
let trzy = 0;
let cztery = 0;

async function tick () {
    binanceClient = new ccxt.binanceusdm({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });


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
    const positions = await binanceClient.fetchPositions(symbols=[market])
    
    //LONG first buy
    //dziala lo i so na półowe kwoty zamienic
    const lo = positions.some(position => position.side === 'long');
    const so = positions.some(position => position.side === 'short');
    if (lo == false) {
        await binanceClient.createOrder(market, 'limit', 'buy', kwota/data['MediumCycleBottom'], data['MediumCycleBottom'], paramsLong)
    }
    if (so == false) {          
        await binanceClient.createOrder(market, 'limit', 'sell', kwota/data['MediumCycleTop'], data['MediumCycleTop'], paramsShort)
    }
   //////// 
    positions.forEach(async pos => {
        if (pos.side === 'long') {
            if(data['MediumCycleBottom']*(kwota/data['MediumCycleBottom']-pos.contracts) > 5){
                await binanceClient.createOrder(market, 'limit', 'buy', kwota/data['MediumCycleBottom']-pos.contracts, data['MediumCycleBottom'], paramsLong)
            }
        }
        if (pos.side === 'short') {
            if(-kwota/data['MediumCycleTop']*(kwota/data['MediumCycleTop']+pos.contracts) > 5){
                await binanceClient.createOrder(market, 'limit', 'sell', kwota/data['MediumCycleTop']+pos.contracts, data['MediumCycleTop'], paramsShort)
            }  
        }
    });
      /////////////////
    
    if(FastOsc <= -0.5){
        longMore = 1;
    }
    console.log("LM: " + longMore)
    if(longMore == 1 && FastOsc >= 0){
        console.log('wdwd')
        positions.forEach(async pos => {
            if (pos.side === 'short') {
                console.log('dwefrgtw')
                //await binanceClient.createOrder(market, 'TAKE_PROFIT_MARKET', 'buy', pos.contracts, params = {'positionSide': 'LONG'});
                await binanceClient.createOrder(market, 'limit', 'buy', pos.contracts, data['MediumCycleTop'], paramsShort)
            }
            if (pos.side === 'long') {
                longMore = 0
                if(pos.contracts * data['MediumCycleBottom'] < 1.5 * kwota){
                    console.log('dwefw')
                    longMore = 0
                    await binanceClient.createOrder(market, 'limit', 'buy', kwota/data['MediumCycleBottom'], 1.02*data['MediumCycleBottom'], paramsLong)
                    
                }
            }
        });
        
    }
    
    if(FastOsc >= 1.5){
        shortMore = 1;
    }
    console.log("SM: " + shortMore)

    if(shortMore == 1 && FastOsc <= 1){
        console.log(shortMore)
        positions.forEach(async pos => {
            if (pos.side === 'long') {
                console.log('d')
                //await binanceClient.createOrder(market, 'TAKE_PROFIT_MARKET', 'sell', pos.contracts, params = {'positionSide': 'LONG'});
                await binanceClient.createOrder(market, 'limit', 'sell', pos.contracts, data['MediumCycleBottom'], paramsLong)
            }
            if (pos.side === 'short') {
                shortMore = 0
                if(-pos.contracts * data['MediumCycleBottom'] < 1.5 * kwota){
                    console.log('dww')
                    shortMore = 0
                    await binanceClient.createOrder(market, 'limit', 'sell', kwota/data['MediumCycleTop'], 0.98*data['MediumCycleTop'], paramsShort)
                    
                }
            }
        });
        
    }
    //dziala
    //dodac zmienną ze sie wykonało?
    positions.forEach(async pos => {
        if (pos.side === 'long') {
            if(pos.contracts * data['MediumCycleTop'] > 0.85 * kwota){
                await binanceClient.createOrder(market, 'TAKE_PROFIT', 'sell', pos.contracts/2, price = 0.99*data['MediumCycleTop'], params = {'stopPrice': data['MediumCycleTop'], 'positionSide': 'LONG'});
            }
        }
        if (pos.side === 'short') {
            if(-pos.contracts * data['MediumCycleBottom'] > 0.85 * kwota){
                await binanceClient.createOrder(market, 'TAKE_PROFIT', 'buy', pos.contracts/2, price = 1.01*data['MediumCycleBottom'], params = {'stopPrice': data['MediumCycleBottom'], 'positionSide': 'SHORT'});
            }  
        }
    });
};
const run = async() => {
    tick()

    //const d = new Date();
    //const minutes = 3 - (d.getMinutes() % 3);

    setInterval(tick, 30*1000)
};


run();