var transactions = []
var header

var block = {

  addTransaction : function(transaction) {
  transactions.push(transaction)
  },
  
  removeAllTransactions : function() {
    transactions = []
  }
}

module.exports = block
