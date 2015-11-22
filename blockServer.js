var express = require('express')
var app = express()

app.get('/getBlock/', function (req, res) {
  // do validation to see where in the block they are before sending out
  // may just need to continue on from where they are
  res.send('You just got a block yo!')
})

app.get('/getNewest/', function (req, res) {
  // just testing to see about get functions
  res.send('You just got the newest block yo!')
})


app.listen(43214)
