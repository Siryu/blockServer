/*
* This module should run independent of the rest. It is an outsider, sending
* spam mail.
*/
var makeTransaction = require('./transaction').createTransactionObject;
// makeTransaction(sendingBlockAddress, receivingBockAddress, amount, time);
var commandLineArgs = require('command-line-args');
var coinCap = 100, coinMin = 10;

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

while (true) {

	try {
		// send the transaction to anyone that will be listening
		var newTransaction = makeTransaction("someSenderAddress", 
				"someReceiverAddress",
				randomCoinAmount(), new Date());
		// go through all the registered addresses
		for (var i = ipAddresses.length - 1; i >= 0; i--) {
			var currentIP = ipAddresses[i];
			/*
			http POST - address = currentIP/api/transaction
			body = newTransaction
			*/
		};
	} catch (error) {
		console.error(error);
		break;
	}

}