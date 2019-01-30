const express = require('express')
const cors = require('cors');
const api = require('./api/');
const path = require('path');
const bodyParser = require('body-parser')
var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'mydb.cyy0q7m6symi.us-east-1.rds.amazonaws.com',
  user     : 'jnelson',
  password : 'bandcmysql',
  database: 'bandc'

});

connection.connect()

connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
  if (err) throw err

  console.log('The solution is: ', rows[0].solution)
})


let app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../../build')));
app.use('/api', api);
app.use(function (err, req, res, next) {
  res.status(500).send(err.message);
})

const port = process.env.API_PORT || 8002;

app.post('/upload', function (req, res) {
  let jobid = req.body.jobid
  let state = req.body.state
  connection.query("INSERT INTO inspections ( jobid, state) VALUES ('"+jobid+"', '"+state+"');", function (err, rows, fields) {
    if (err) throw err
  })
  console.log(state)
  console.log('got an upload' )
  res.json({message: 'uploaded success'})
})

app.post('/createClient', function (req, res) {

  // connection.query("INSERT INTO inspections ( jobid, state) VALUES ('"+jobid+"', '"+state+"');", function (err, rows, fields) {
  //   if (err) throw err
  // })

  console.log('new client' )
  res.json({message: 'uploaded success'})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
