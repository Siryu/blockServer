var header
var canBeSpent
var coinValue
var value
var secondTransaction

var block = {
  createBlock : function(lastBlock, amount) {
    return { 'header': lastBlock.value, 'coinValue': amount, 'value': lastBlock.value + 1, 'canBeSpent': true}
  }
}

module.exports = block
