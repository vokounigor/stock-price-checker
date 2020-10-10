/*
*
*
*       Complete the API routing below
*
*
*/

/* Use this API: https://financialmodelingprep.com/developer/docs/#Stock-Price */

/* Company Tickers - some of them
  GOOG - google
  AAPL - apple
  AMZN - amazon
  FB - facebook
  MSFT - microsoft
  BABA - alibaba
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const fetch = require("node-fetch");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

async function getStockData(name) {
  const response = await fetch(`https://financialmodelingprep.com/api/v3/stock/real-time-price/${name}`);
  return await response.json();
}

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    const db = client.db('stocks');
    
    app.route('/api/stock-prices')
      .get(async (req, res) => {
        const { stock, like } = req.query;
        // IP address -> console.log(req.connection.remoteAddress);
        // If stock is not an array, it means only 1 company name was passed
        if (!Array.isArray(stock)) {
          const result = await getStockData(stock);
          if (Object.keys(result).length === 0 && result.constructor === Object) {
            return res.send({error: "no company with that name"});
          }
          if (like === undefined) {
            db.collection('stock').findOneAndUpdate(
              {stock: result.symbol},
              {
                $setOnInsert: {
                  stock: result.symbol,
                  price: result.price,
                  ips: []
                }
              },
              { upsert: true, returnOriginal: false },
              (err, resp) => {
                if (err) throw err;
                const { stock, like, price } = resp.value;
                const likes = resp.value.ips.length;
                res.send({stockData: {
                  stock,
                  price,
                  like: likes
                }});
              }
            );
          } else if (like == 'true') {
            db.collection('stock').findOneAndUpdate(
              {stock: result.symbol},
              {
                $addToSet: { ips: req.connection.remoteAddress },
              },
              (err, resp) => {
                if (err) throw err;
                const toSet = resp.value.ips.length;
                res.send({stockData: {
                  stock: resp.value.stock,
                  price: resp.value.price,
                  like: toSet
                }});
              }
            )
          }
        } else if (stock.length > 2) {
            return res.send({error: "too many arguments passed"});
        } else {
          let arr = [];
          // It always returns 1 less, so we have to go length + 1
          for (let i = 0; i < stock.length + 1; i++) {
            let temp = await getStockData(stock[i]);
            db.collection('stock').findOne({
              stock: temp.symbol
            }, (err, rslt) => {
              if (rslt === null) return;
              temp.like = rslt.ips.length;
              arr.push(temp);
            })
          }
          let prev = arr[0].like;
          let next = arr[1].like;
          arr[0].rel_likes = arr[0].like - next;
          arr[1].rel_likes = arr[1].like - prev;
          delete arr[0].like;
          delete arr[1].like;
          res.send({stockData: arr});
        }
      });
    

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  })
};
