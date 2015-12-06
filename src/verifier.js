

var verifier = {
  verify : function(block, solution, nonce) {
    return block.header + 1 == solution
  }
}

module.exports = verifier
