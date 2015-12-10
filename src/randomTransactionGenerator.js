/*
* This module should run independent of the rest. It is an outsider, sending
* spam mail.
*/
var makeTransaction = require('./transaction').createTransactionObject;
// makeTransaction(sendingBlockAddress, receivingBockAddress, amount, time);
var commandLineArgs = require('command-line-args');
var coinCap = 100, coinMin = 10;

var request = require('request')

var sendingPortForWallet = 40999
var sendingIPForWallet = 'http://127.0.0.1'
var blocksOwned = [0]
var tempIpPositionHolder = 0

var ipAddresses = commandLineArgs([
  { name: 'addresses', type: String, multiple: true, defaultOption: true }
]).parse().addresses; // because single-use optimization

// inclusive range function, finagling the magic that is Math.floor()
var randomIntInRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randomCoinAmount = function() {
	return randomIntInRange(coinMin, coinCap);
}

var randomOwnedBlock = function() {
  var random = Math.floor(Math.random() * blocksOwned.length)
  console.log('the value im returning is ' + random)
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
    if(body.indexOf('--') > -1) {
      blocksOwned.push(body.split('--')[1])
    }
  })
}

var makeTransaction = function() {
  var blockToSpend = blocksOwned[randomOwnedBlock()]
    var newTransaction = {'sendingBlockAddress':blockToSpend,
      'receivingIPAddress':sendingIPForWallet + ':' + sendingPortForWallet,
      'amount':randomCoinAmount(), 'time':new Date()}

    var ip = ipAddresses[tempIpPositionHolder]

    sendRequest(ip + '/api/transaction', newTransaction, 'POST')
    blocksOwned.pop(blockToSpend)
   }

setInterval(makeTransaction, 3000)
