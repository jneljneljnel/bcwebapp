const express = require('express')
const cors = require('cors');
const api = require('./api/');
const path = require('path');
const bodyParser = require('body-parser')
var officegen = require('officegen');
const docx3 = require("docx")
var fs = require("fs");
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
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api', api);
app.use(function (err, req, res, next) {
  res.status(500).send(err.message);
})

const PORT = process.env.PORT || 8002


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const { Document, Paragraph, Packer } = docx3;

app.get("/test", async (req, res) => {
    const doc = new Document();

    doc.createImage(fs.readFileSync("Jeremy.jpeg"), 800, 1100, {
      allowOverlap: true
    });
    const paragraph = new Paragraph("Hello World");
    doc.addParagraph(paragraph);
    // const b64string = await packer.toBase64String(doc);
    // res.setHeader('Content-Disposition', 'attachment; filename=My Document.docx');
    // res.send(Buffer.from(b64string, 'base64'));

    var packer = new docx3.Packer();
    packer.toBuffer(doc).then((buffer) => {
      console.log('writing')
      fs.writeFileSync("My First Document.docx", buffer);
       res.sendFile(path.join(__dirname + '/My First Document.docx'));
    });

})


app.all('/report', function (req, res){
    var docx = officegen ({
        'type': 'docx',
        'subject': 'testing it',
        'keywords': 'some keywords',
        'description': 'a description'
    });

    var pObj = docx.createP ();
    pObj.addText ( 'a very simple paragraph' );

    res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        'Content-disposition': 'attachment; filename=blah.docx'
    });
    docx.generate(res);
});



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

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
