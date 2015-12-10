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
var blocksOwned = [0]
var tempIpPositionHolder = 0

var ipAddresses = commandLineArgs([
  { name: 'addresses', type: String, multiple: true, defaultOption: true }
]).parse().addresses; // because single-use optimization

//=========================================================================
//express stuff to listen for my wallet
var router = express.Router()
router.get('/', function(req, res) {
  console.log(req)
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
        blocksOwned.push(body.split('--')[1] | 0)
      }
    }
  })
}

var makeTransaction = function() {
  var blockToSpend = blocksOwned[randomOwnedBlock()]
  console.log("Block to spend", blockToSpend)
    var newTransaction = {'sendingBlockAddress':blockToSpend,
      'receivingIPAddress':sendingIPForWallet + ':' + sendingPortForWallet,
      'amount':10/*randomCoinAmount()*/, 'time':new Date()}

    console.log("blocks owned:", blocksOwned)
    var ip = ipAddresses[tempIpPositionHolder]

    sendRequest(ip + '/api/transaction', newTransaction, 'POST')
    blocksOwned.pop(blockToSpend)
   }

setInterval(makeTransaction, 10000)
