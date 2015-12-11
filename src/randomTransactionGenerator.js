/*
* This module should run independent of the rest. It is an outsider, sending
* spam mail.
*/
var makeTransaction = require('./transaction').createTransactionObject;
// makeTransaction(sendingBlockAddress, receivingBockAddress, amount, time);
var commandLineArgs = require('command-line-args');
var express = require('express')
var app = express()
var coinCap = 100, coinMin = 10;

var request = require('request')

var sendingPortForWallet = 40999
var sendingIPForWallet = 'http://127.0.0.1'
var blocksOwned = [{blockNumber:0, amount:100}]
var tempIpPositionHolder = 0

var ipAddresses = commandLineArgs([
  { name: 'addresses', type: String, multiple: true, defaultOption: true }
]).parse().addresses; // because single-use optimization

//=========================================================================
//express stuff to listen for my wallet
var router = express.Router()
router.get('/', function(req, res) {
  console.log('corey corey corey', req)
})

app.listen(sendingPortForWallet)


// inclusive range function, finagling the magic that is Math.floor()
var randomIntInRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randomCoinAmount = function() {
	return randomIntInRange(coinMin, coinCap);
}

var randomOwnedBlock = function() {
  var random = Math.floor(Math.random() * blocksOwned.length)
  return random
}

var sendRequest = function(uri, body, typeOfRequest) {
  request({
    url: uri,
    method: typeOfRequest,
    json: true,
    body: body
  },
  function(error, res, body) {
    if (error) {
      console.log(error)
    }
    else {
      console.log(body)
      if(body.indexOf('--') > -1) {
        blocksOwned.push({ blockNumber: body.split('--')[1] | 0, amount: body.split('--')[2]})
      }
    }
  })
}

var makeTransaction = function() {
  if(blocksOwned.length > 0) {
    var blockToSpend = blocksOwned[randomOwnedBlock()]
    console.log("Block to spend", blockToSpend)
      var newTransaction = {'sendingBlockAddress':blockToSpend.blockNumber,
        'receivingIPAddress':sendingIPForWallet + ':' + sendingPortForWallet,
        'amount':10/*randomCoinAmount()*/, 'time':new Date()}

      console.log("blocks owned:", blocksOwned)
      var ip = ipAddresses[tempIpPositionHolder]

      sendRequest(ip + '/api/transaction', newTransaction, 'POST')
      blocksOwned.pop(blockToSpend)

      tempIpPositionHolder++
      if(tempIpPositionHolder >= ipAddresses.length) {
        tempIpPositionHolder = 0
      }
    }
    else {
      console.log('You don\'t own any coins')
    }
   }

setInterval(makeTransaction, 3000)
