String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

var transaction = {
  createTransactionObject : function(sendingBlockAddress, receivingIPAddress, amount, time) {
    return {'sendingBlockAddress':sendingBlockAddress/*block header number*/,
     'receivingIPAddress':receivingIPAddress /* this needs to be the receivers wallet IP*/,
     'amount':amount/*coin amount to transfer*/, 'time':time}
  },

  createTransactionHash : function(transactionObject) {
    var theString = "" + transactionObject.senderId + transactionObject.receiverId +
      transactionObject.amount + transactionObject.time
      return theString.hashCode
  }
}

module.exports = transaction
