var express = require('express')
var bodyParser = require('body-parser')
var port = 43214
var app = express()

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

router.get('/', function(req, res) {
  res.json({ message: 'yay!!! the api responded to you!' })
})
// register all routes here
//=========================================================

//all our routes will be prefixed with /api
app.use('/api', router)

// Start the server
// ========================================================
app.listen(port)
console.log('Block Server started .....')

//
// /api/bears	GET	Get all the bears.
// /api/bears	POST	Create a bear.
// /api/bears/:bear_id	GET	Get a single bear.
// /api/bears/:bear_id	PUT	Update a bear with new info.
// /api/bears/:bear_id	DELETE	Delete a bear.
