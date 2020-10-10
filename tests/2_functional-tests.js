/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNotNaN(res.body.stockData.price);
          assert.isNotNaN(res.body.stockData.like);
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNotNaN(res.body.stockData.price);
          assert.isNotNaN(res.body.stockData.like);
          assert.equal(res.body.stockData.like, 1);
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNotNaN(res.body.stockData.price);
          assert.isNotNaN(res.body.stockData.like);
          assert.equal(res.body.stockData.like, 1);
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'fb']})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].symbol, 'GOOG');
          assert.equal(res.body.stockData[1].symbol, 'FB');
          res.body.stockData.forEach(item => {
            assert.isNotNaN(item.price);
            assert.isNotNaN(item.rel_likes);
          })
          done();
        })
      });
      // Likes were not implemented for 2+ stocks
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'fb']})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].symbol, 'GOOG');
          assert.equal(res.body.stockData[1].symbol, 'FB');
          res.body.stockData.forEach(item => {
            assert.isNotNaN(item.price);
            assert.isNotNaN(item.rel_likes);
          }) 
          done();
        })
      });
      
    });

});
