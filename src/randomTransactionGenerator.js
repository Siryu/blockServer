/*
* This module should run independent of the rest. It is an outsider, sending
* spam mail.
*/
var makeTransaction = require('./transaction').createTransactionObject;
var http = require('http');
http.post = require('http-post');
// makeTransaction(sendingBlockAddress, receivingBockAddress, amount, time);
var commandLineArgs = require('command-line-args');
var coinCap = 100, coinMin = 10, transactionRoute = "/api/transaction";

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

var increment = 0;

setInterval(function() {
	try {
		// send the transaction to anyone that will be listening
		var newTransaction = makeTransaction(increment++, 
				"127.0.0.1",
				randomCoinAmount(), new Date());
		console.log("Made the transaction object to send");
		// go through all the registered addresses
		for (var i = ipAddresses.length - 1; i >= 0; i--) {
			var currentIP = ipAddresses[i];
			/*
			http POST - address = currentIP/api/transaction
			body = newTransaction
			*/
			http.post(currentIP + transactionRoute, newTransaction, function(res){
				response.setEncoding('utf8');
				res.on('data', function(chunk) {
					console.log(chunk);
				});
			});
		};
	} catch (error) {
		console.error(error);
	}
}, 3000);