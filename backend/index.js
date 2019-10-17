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
app.use(bodyParser({limit: '50mb'}));
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
  let sql = "SELECT * From bandc.inspections Where jobid="+jobid
  //console.log("bingo",jobid, sql, state)
  connection.query(sql, (err, rows) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err);
    } else {
      if(rows.length){
        //merge
        console.log('merge')
        let insp = JSON.parse(rows[0].state)
        let newinsp = JSON.parse(state)
        insp.insSheets = [...insp.insSheets, ...newinsp.insSheets]
        insp.data = [...insp.data, ...newinsp.data]
        let newState = JSON.stringify(insp)
        let sql = `UPDATE inspections set state = '`+newState+`' WHERE jobid="`+jobid+`"`
        console.log(sql)
        connection.query( sql, function (err, rows, fields) {
          if (err) {
            console.log(err)
            res.status(500).send('merge error '+ err)
          }
          res.json({message: 'merge success'})
        })
      } else {
        //no merge
        connection.query("INSERT INTO inspections ( jobid, state) VALUES ('"+jobid+"', '"+state+"');", function (err, rows, fields) {
          if (err){
            console.log(err)
            res.status(500).send('error during insert ' + err)
          } else {
            res.json({message: 'uploaded success'})
          }
          console.log('got an upload' )
        })
      }
    }
  });
})

app.post('/merge', function (req, res) {
  let jobid = req.body.jobid
  let state = req.body.state
  connection.query(`UPDATE inspections set state = "`+state+`" WHERE jobid="`+jobid+`"`, function (err, rows, fields) {
    if (err) throw err
  })
  console.log(state)
  console.log('merge')
  res.json({message: 'merge success'})
})

app.get('/mailmerge', function (req, res) {
  console.log('mailmerge')
  let sql1 = `TRUNCATE TABLE mailmergeDB`
  let sql2 = `INSERT INTO mailmergeDB ( PROJECT_NAME, PROJECT_ID, PROJECT_INFOADDRESS, PROJECT_INFOCITY,  PROJECT_INFOSTATE, client_id, COMPANY, WordProjectInfoCOMPANYADDRESS, WordProjectInfoCOMPANYCITY, WordProjectInfoCOMPANYSTATE, WordProjectInfoCOMPANYZIP, INSPECTION_START, INSPECTOR_1, CONTACT_1, Project_infophone, Project_infozip, BILLING_CONTACT, COMMENTS_1, CONTACT_2, PHONE_2, INSPECTION_COST)
  SELECT
  	j.name as PROJECT_NAME,
      j.id as PROJECT_ID,
      j.street as PROJECT_INFOADDRESS,
      j.city as  PROJECT_INFOCITY,
      j.state as PROJECT_INFOSTATE,
      c.id as client_id,
      c.name as COMPANY,
      c.street as WordProjectInfoCOMPANYADDRESS,
      c.city as WordProjectInfoCOMPANYCITY,
      c.state as WordProjectInfoCOMPANYSTATE,
      c.postal as WordProjectInfoCOMPANYZIP,
      j.inspectionDate as INSPECTION_START,
      i.name as INSPECTOR_1,
      j.homeownerName as CONTACT_1,
      j.homeownerNumber as Project_infophone,
      j.postal as Project_infozip,
      c.bname as BILLING_CONTACT,
      j.comments as COMMENTS_1,
      j.siteName as CONTACT_2,
      j.siteNumber as PHONE_2,
      j.cost as INSPECTION_COST
  FROM
  	jobs j JOIN clients c ON j.clientid = c.id
    JOIN inspectors i on j.inspector = i.id`
  connection.query(sql1, function (err, rows, fields) {
    if (err) throw err
      connection.query(sql2, function (err, rows, fields) {
        if (err) throw err
        res.json({message: 'mailmerge update sucess'})
      })
  })
})

app.post('/edit', function (req, res) {
  let id = req.body.id
  let state = JSON.stringify(req.body.state[0])
  console.log(state)
  let sql = "UPDATE inspections Set state = '"+state+"' Where id ='"+id+"';"
  console.log('state', sql)
  connection.query(sql , function (err, rows, fields) {
    if (err) throw err
  })

  console.log('got an edit upload' )
  res.json({message: 'edit success'})
})

app.post('/createClient', function (req, res) {

  // connection.query("INSERT INTO inspections ( jobid, state) VALUES ('"+jobid+"', '"+state+"');", function (err, rows, fields) {
  //   if (err) throw err
  // })

  console.log('new client' )
  res.json({message: 'uploaded success'})
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
