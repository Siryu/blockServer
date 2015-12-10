var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var commandLineArgs = require('command-line-args')
var blockFactory = require('./block')
var verifier = require('./verifier')
var localPort = 43214
var app = express()

var pools = []
var blockDuration = 10
var blockChain = []
var remoteIp, remotePort, name

var cli = commandLineArgs([
  { name: 'name', alias: 'n', type: String},
  { name: 'localPort', alias: 'l', type: Number},
  { name: 'remoteIp', alias: 'i', type: String },
  { name: 'remotePort', alias: 'p', type: String},
  { name: 'help', alias: 'h', type: Boolean}
  ])
var options = cli.parse()

if (options.help) {
  console.log(cli.getUsage())
} else {
  Array.prototype.contains = function(obj) {
    var i = this.length
    while (i--) {
      if (this[i] === obj) {
        return true
      }
    }
    return false
  }


  var inBlockChain = function(data) {
    for(var i = 0; i < blockChain.length; i++) {
      if(blockChain[i].header == data) {
        return true
      }
    }
    return false
  }


  var start = function() {
    // if there is no blockchain, create a new one
    //=========================================================
    if(blockChain.length == 0) {
      var block = {
        'header': 0,
        'value': 1,
        'startTime': Date(),
        'nonce': 0,
        'coinValue' : 100,
        'merkleRoot': 'defaultmerklenotinyet'
      }
      console.log('block is', block)
      blockChain.push(block)
    }
    // subscribe to given ip / port
    //=========================================================
    remoteIp = options.remoteIp
    remotePort = options.remotePort
    localPort = options.localPort
    name = options.name
    var pool = {'name': '', 'address': remoteIp, 'port': remotePort}
    pools.push(pool)

    var remoteAPI = '/api/subscribe'
    var uri = remoteIp + ":" + remotePort + remoteAPI
    var body = {'name': name, 'port': localPort}
    sendPostRequest(uri, body)
  }


  var sendPostRequest = function(uri, body) {
    request({
      url: uri,
      method: 'POST',
      json: true,
      body: body
    },
    function(error, res, body) {
      console.log('got a response......', res.statusCode)
    })
  }

  // configure app to allow us to parse body content from post
  //=========================================================
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  //=========================================================

  // create routes for our API
  //=========================================================
  remoteIp = options.remoteIp
  remotePort = options.remotePort
  localPort = options.localPort
  name = options.name
  var pool = {'name':'', 'address':remoteIp, 'port': remotePort};
  pools.push(pool)

  //var remoteAPI = '/api/subscribe'
  //request({
  //  url: remoteIp + ":" + remotePort + remoteAPI,
  //  method: 'POST',
  //  json: true,
  //  body: {'name': name, 'port': localPort}
  //},
  // function(error, res, body) {
  //  console.log('got a response for registering......', res.statusCode)
  //})
}

var router = express.Router()

router.use(function(req, res, next) {
  console.log('we recieved a request ...')
  next()
})



router.get('/work', function(req, res) {
 var block = req.body.block
 if(block) {
  var toReturn = -1
  for(var i = 0; i < blockChain.length; i++) {
   if(blockChain[i].header == block) {
    if(i < blockChain.length - 1) {
     toReturn = i + 1;
   } else {
     toReturn = i;
   }
 }
}

if(toReturn == -1) {
  res.status = 404
  res.send('Block not in my chain')
} else {
  res.send(blockChain[toReturn])
}

} else {
  res.send(blockChain[0])
}

})


router.post('/solution', function(req, res) {
  var block = req.body.blockWorked
  var solution = req.body.solution
  var canBeSpent = req.body.canBeSpent
  var nonce = req.body.nonce
  var verifiedSolution = verifier.verify(blockWorked, solution, nonce)
  var alreadyPartOfBlockChain = inBlockChain(solution)
  if(!alreadyPartOfBlockChain) {
    var remoteAPI = '/api/solution'
    for(var i = 0; i < pools.length; i++) {
      var uri = pools[i].address + ":" + pools[i].port + remoteAPI
      var body = {'blockWorked': block, 'solution': solution, 'nonce': nonce}
      sendPostRequest(uri, body)
    }
    blockChain[block.sender].canBeSpent = false
    blockChain.push(block)
    if(block.secondTransaction) {
      var solution = verifier.findSolution(block.secondTransaction)
      blockChain.push(block.secondTransaction)
      var remoteAPI = '/api/solution'
      for(var i = 0; i < pools.length; i++) {
        var uri = pools[i].address + ":" + pools[i].port + remoteAPI
        var body = block.secondTransaction
        sendPostRequest(uri, body)
      }
    }
  }
  res.status(200)
  res.send('OK')
})




router.post('/subscribe', function(req, res) {
  if(req.body.name && req.body.port)
  {
    var remoteName = req.body.name;
    var remotePort = req.body.port;
    var remoteAddress = req.connection.remoteAddress
    var pool = {'name': remoteName, 'address': remoteAddress, 'port': remotePort};
    if ( !pools.contains(pool) ) {
      pools.push(pool);
    }
    res.status(200)
    res.send('OK')
  }
  else {
    console.log('couldnt register this pool')
    res.status(422)
    res.send('Unprocessable Entity, Not enough information to register.')
  }
})




router.post('/unsubscribe', function(req, res) {
  var name = req.body.name
  var pool
  for(var i = 0; i < pools.length && !pool; i++) {
    if(pools[i].name == name) {
      pool = pools[i]
    }
  }
  pools.pop(pool)
  if(pool) {
    res.status(200)
    res.send('OK')
  }
  else {
    res.status(404)
    res.send('Resource Not Found')
  }
})




router.post('/transaction', function(req, res) {
  var transaction = req.body.transaction

  var lastBlock = blockChain[blockChain.length - 1]

  var transAmount = transaction.amount
  var sendingBlockAddress = transaction.sendingBlockAddress
  var amountCanBeSpent
  var blockToChange
  for (var i = 0; i < blockChain.length && !blockToChange; i++) {
    if(blockChain[i].header == sendingBlockAddress && blockChain[i].canBeSpent) {
      amountCanBeSpent = blockChain[i].coinValue
      blockToChange = blockChain[i]
    }
  }
  var leftOverAmount = amountCanBeSpent - transAmount
    // create the new blocks to be worked.
    if(leftOverAmount >= 0) {
      var transBlock = blockFactory.createNextBlock(lastBlock, transAmount)
      if(leftOverAmount != 0) {
      var leftOverBlock = blockFactory.createNextBlock(transBlock, leftOverAmount)  // send two blocks to be worked!
      transBlock.secondTransaction = transaction.createTransactionObject(blockToChange.amount, lastBlock.amount + 1, leftOverAmount, Date())
    }
  }
    // solve blocks and set the old block so it can't be spent again.
    var solution = verifier.findSolution(transBlock)
    if(solution == transBlock.value) {
      blockChain.push(transBlock)
      blockToChange.canBeSpent = false
      var remoteAPI = '/api/solution'
      res.status(200)
      res.send('block with your change --' + leftOverBlock.header)
      for(var i = 0; i < pools.length; i++) {
        var uri = uripools[i].address + ":" + pools[i].port + remoteAPI
        var body = {'blockWorked': transBlock, 'solution': solution, 'nonce': 0}
        sendPostRequest(uri, body)
      }
    // second transaction for your left over amount
    if(transBlock.secondTransaction) {
      var solution = verifier.findSolution(transBlock.secondTransaction)
      if(solution == transBlock.secondTransaction.value) {
        blockChain.push(transBlock.secondTransaction)
        var remoteAPI = '/api/solution'
        for(var i = 0; i < pools.length; i++) {
          var uri = uripools[i].address + ":" + pools[i].port + remoteAPI
          var body = {'blockWorked': transBlock.secondTransaction, 'solution': solution, 'nonce': 0}
          sendPostRequest(uri, body)
        }
      }
    }
  }
  else {
    res.status(400)
    res.send('transaction not accepted')
  }
})
  // register all routes here
  //=========================================================

  //all our routes will be prefixed with /api
  app.use('/api', router)


  // Start the server
  // ========================================================
  start()
  app.listen(localPort)
  console.log('Pool Host Started .....')
}
