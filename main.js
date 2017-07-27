/**
 * Created by Manu Masson on 6/27/2017.
 *
 */

console.log('Starting app...');

//request for pulling JSON from api.
const request = require('request');
const _ = require('lodash')
const app = require('express')();
// const helmet = require('helmet');
// const http = require('http').Server(app);
// const io = require('socket.io')(http);
// const port = process.env.PORT || 3000;

// app.use(helmet.hidePoweredBy({setTo: 'PHP/5.4.0'}));

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

// http.listen(port, function () {
//     console.log('listening on', port);
// });

const { marketNames, markets } = require('./settings'); //Includes settings file.
// coin_prices is an object with data on price differences between markets. = {BTC : {market1 : 2000, market2: 4000, p : 2}, } (P for percentage difference)
// results is a 2D array with coin name and percentage difference, sorted from low to high.
let coin_prices = {};
let numberOfRequests = 0;
let results = []; // GLOBAL variables to get pushed to browser.

function getMarketData(options, coin_prices, callback) { //GET JSON DATA
    return new Promise(function (resolve, reject) {
        request(options.URL, function (error, response, body) {
            try {
                let data = JSON.parse(body);
                console.log("Success", options.marketName);
                if (options.marketName) {
                    let newCoinPrices;
                    newCoinPrices = options.last(data, coin_prices, options.toBTCURL);
                    numberOfRequests++;
                    if (numberOfRequests >= 1) computePrices(coin_prices);
                    resolve(newCoinPrices);

                }
                else {
                    resolve(data);
                }

            } catch (error) {
                console.log("Error getting JSON response from", options.URL, error); //Throws error
                reject(error);
            }

        });


    });
}

function pairwise(list) {
  if (_.size(list) < 2) {
    return [];
  }
  const first = _.first(list);
  const rest  = _.tail(list);
  const pairs = _.map(rest, function (x) { return [first, x]; });
  return _.flatten([pairs, pairwise(rest)], true);
}


function computePrices(data) {
    if (numberOfRequests < 2) {
        return
    }

    const arbitrageOpts = _.pickBy(data, (markets, coinName) => _.size(markets) > 1)

    const results = _.reduce(arbitrageOpts, (result, markets, coin) => {
        const normalised = _.map(markets, (marketPrice, marketName) => {
            return [marketPrice, marketName];
        });
        console.log(normalised)
        process.exit(1)
        const pairs = pairwise(normalised)

        const arr = _.reverse(_.sortBy(pairs, a => a[0]));

        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                results.push([coin, arr[i][0] / arr[j][0], arr[i][0], arr[j][0], arr[i][1], arr[j][1] ], [coin, arr[j][0] / arr[i][0], arr[j][0], arr[i][0], arr[j][1], arr[i][1]]);
            }
        }
    }, []);
    results.sort(function (a, b) {
        return a[1] - b[1];
    });

    // console.log(results)
}


(async function main() {
    let arrayOfRequests = [];

    for (let i = 0; i < markets.length; i++) {
        arrayOfRequests.push(getMarketData(markets[i], coin_prices));
    }

    await Promise.all(arrayOfRequests.map(p => p.catch(e => e)))
        .then(results => computePrices(coin_prices))
        .catch(e => console.log(e));

    setTimeout(main, 10000);
})();

// .then(v => {
//        // console.log(v);
//    });
