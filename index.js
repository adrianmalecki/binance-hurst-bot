require("dotenv").config();
const ccxt = require("ccxt");
const TradingView = require("@mathieuc/tradingview");
const client = new TradingView.Client();
const getData = require("./indicator.js");


const tick = async (config, binanceClient) =>{
    const { asset, base } = config;
    const market = `${asset}/${base}`;
    console.log(config)
    data = await getData(TradingView, client);
    console.log('MediumCycleTop: ' + data['MediumCycleTop'])
    console.log("MediumCycleBottom: " + data['MediumCycleBottom'])
    params = {
        'positionSide': 'LONG' 
    }  
    await binanceClient.createOrder(market, 'limit', 'buy', 0.01, data['MediumCycleBottom'], params);
    //await binanceClient.createLimitSellOrder(market, 0.01, data['MediumCycleTop']);
};

const run = async() => {
    const config = {
        asset: "ETH",
        base: "BUSD",
        //allocation: 0.1,
        //spread: 0.2,
        //tickInterval: 60 * 1000,
    };
    const binanceClient = new ccxt.binanceusdm({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
        //hedgeMode: True,
    });

    tick(config, binanceClient)
    setInterval(tick, 60*1000)
};


run();