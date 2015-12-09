

var verifier = {
  verify : function(block, solution, nonce) {
    return block.header + 1 == solution
  },
  findSolution : function(block, nonce) {
    return block.header + 1
  }
}

module.exports = verifier
