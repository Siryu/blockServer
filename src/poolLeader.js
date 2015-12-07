var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var commandLineArgs = require('command-line-args')
var currentBlock = require('./block')
var verifier = require('./verifier')
var localPort = 43214
var app = express()

var pools = []
var blockDuration = 10
var blockChain = []
var remoteIp
var remotePort
var name

var cli = commandLineArgs([
  { name: 'name', alias: 'n', type: String},
  { name: 'localPort', alias: 'l', type: Number},
  { name: 'remoteIp', alias: 'i', type: String },
  { name: 'remotePort', alias: 'p', type: String}
])
var options = cli.parse()

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
      'header':0,
      'value':1,
      'startTime':Date(),
      'nonce':0,
      'merkleRoot':'defaultmerklenotinyet'
    }
    console.log('block is ', block)
    blockChain.push(block)
  }
  // subscribe to given ip / port
  //=========================================================
  remoteIp = options.remoteIp
  remotePort = options.remotePort
  localPort = options.localPort
  name = options.name
  var pool = {'name':'', 'address':remoteIp, 'port': remotePort};
  pools.push(pool)

  var remoteAPI = '/api/subscribe'
  request({
    url: remoteIp + ":" + remotePort + remoteAPI,
    method: 'POST',
    json: true,
    body: {'name': name, 'port': localPort}
  },
   function(error, res, body) {
    console.log('got a response for registering......', res.statusCode)
  })
}

// configure app to allow us to parse body content from post
//=========================================================
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//=========================================================

// create routes for our API
//=========================================================
var router = express.Router()

router.use(function(req, res, next) {
  console.log('we recieved a request ...')
  next()
})

router.get('/work', function(req, res) {
  res.json({ message: 'Yay!!!, some work' })
})

router.post('/solution', function(req, res) {
  var block = req.body.blockWorked
  var solution = req.body.solution
  var nonce = req.body.nonce
  var verifiedSolution = verifier.verify(blockWorked, solution, nonce)
  var alreadyPartOfBlockChain = inBlockChain(solution)
  if(!alreadyPartOfBlockChain) {
    var remoteAPI = '/api/solution'
    for(var i = 0; i < pools.length; i++) {
      request({
        url: pools[i].address + ":" + pools[i].port + remoteAPI,
        method: 'POST',
        json: true,
        body: {'blockWorked': block, 'solution': solution, 'nonce': nonce}
        },
        function(error, res, body) {
          console.log('got a response by sending solution......', res.statusCode)
      })
    }
    blockChain.push({'header': solution})
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
    var pool = {'name':remoteName, 'address':remoteAddress, 'port': remotePort};
    if ( !pools.contains(pool) ) {
        pools.push(pool);
    }
    res.status(200)
    res.send('OK')
  }
  else {
    console.log('couldnt register this person')
    res.status(422)
    res.send('Unprocessable Entity, Not enough information to register.')
  }
})

router.post('/unsubscribe', function(req, res) {
  var name = req.body.Name
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
  block.addTransaction(transaction)
})
// register all routes here
//=========================================================

//all our routes will be prefixed with /api
app.use('/api', router)

// Start the server
// ========================================================
start()

app.set('port', (process.env.PORT || 5000))
app.listen(app.get('port'), function() {
  console.log("Application running on port", app.get('port'));
});
//app.listen(localPort)
console.log('Pool Host Started .....')
