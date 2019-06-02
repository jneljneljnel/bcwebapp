const router = require('express').Router();
const db = require('../db');
var path = require('path');

router.post('/update', (req, res, next) => {
  console.log('GOT CALLED UPDATE')
  console.log(req.body.name,req.body.clientId)
  if(req.body.name && req.body.clientId)
  {
    console.log(req.body)
    const sql = `UPDATE bandc.jobs
                  set name = "`+req.body.name+`",
                  recievedDate ="`+req.body.recievedDate+`",
                  scheduledDate ="`+req.body.scheduledDate+`",
                  inspectionDate ="`+req.body.inspectionDate+`",
                  homeownerName ="`+req.body.homeownerName+`",
                  homeownerNumber ="`+req.body.homeownerNumber+`",
                  address ="`+req.body.address+`",
                  street ="`+req.body.street+`",
                  city ="`+req.body.city+`",
                  state ="`+req.body.state+`",
                  county ="`+req.body.county+`",
                  postal ="`+req.body.postal+`",
                  siteName ="`+req.body.siteName+`",
                  siteNumber ="`+req.body.siteNumber+`",
                  appointmetPerson ="`+req.body.appointmetPerson+`",
                  billingName ="`+req.body.billingName+`",
                  clientId ="`+req.body.clientId+`",
                  comments ="`+req.body.comments+`",
                  inspector ="`+req.body.inspectorId+`",
                  actionLevel = "`+req.body.actionLevel+`",
                  type = "`+req.body.type+`",
                  numbeds = "`+req.body.numbed+`",
                  numbaths = "`+req.body.numbath+`",
                  sqft = "`+req.body.sqft+`",
                  early = "`+req.body.early+`",
                  dogs = "`+req.body.dogs+`",
                  gooddogs = "`+req.body.gooddogs+`",
                  cost ="`+req.body.cost+`"
                  WHERE id =`+req.body.id+` ;`
    console.log(sql)
    db.getConnection((error, connection) => {
        if (error) console.log('err', error);
        connection.query(sql, (err, rows) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            res.send(rows);
          }
          connection.release();
        });
    })
  }
})

router.post('/new', (req, res, next) => {
  if(req.body.name && req.body.clientId)
  {
    console.log(req.body)
    const sql = `INSERT INTO bandc.jobs
                  (
                    name,
                    recievedDate,
                    scheduledDate,
                    inspectionDate,
                    homeownerName,
                    homeownerNumber,
                    appointmetPerson,
                    billingName,
                    siteName,
                    siteNumber,
                    actionLevel,
                    type,
                    cost,
                    clientId,
                    address,
                    street,
                    city,
                    state,
                    county,
                    postal,
                    inspector,
                    numbeds,
                    numbaths,
                    sqft,
                    early,
                    dogs,
                    gooddogs,
                    comments)
                VALUES
                  ("`+req.body.name+`",
                  "`+req.body.recievedDate+`",
                  "`+req.body.scheduledDate+`",
                  "`+req.body.inspectionDate+`",
                  "`+req.body.homeownerName+`",
                  "`+req.body.homeownerNumber+`",
                  "`+req.body.appointmetPerson+`",
                  "`+req.body.billingName+`",
                  "`+req.body.siteName+`",
                  "`+req.body.siteNumber+`",
                  "`+req.body.actionLevel+`",
                  "`+req.body.type+`",
                  "`+req.body.cost+`",
                  "`+req.body.clientId+`",
                  "`+req.body.address+`",
                  "`+req.body.street+`",
                  "`+req.body.city+`",
                  "`+req.body.state+`",
                  "`+req.body.county+`",
                  "`+req.body.postal+`",
                  "`+req.body.inspectorId+`",
                  "`+req.body.numbeds+`",
                  "`+req.body.numbaths+`",
                  "`+req.body.sqft+`",
                  "`+req.body.early+`",
                  "`+req.body.dogs+`",
                  "`+req.body.gooddogs+`",
                  "`+req.body.comments+`");`
    db.getConnection((error, connection) => {
        if (error) console.log('err', error);
        console.log(sql)
        connection.query(sql, (err, rows) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            res.send(rows);
          }
          connection.release();
        });
    })
  }
})

router.get('/pending', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT j.*, c.name as client From bandc.jobs j join bandc.clients c on j.clientId= c.id WHERE completed=0 AND inspected=0 AND inspectionDate=''"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/scheduled', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE completed=0 AND inspected=0 AND inspectionDate <> ''"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/inspected', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE completed=0 AND inspected=1"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/open', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE completed=0 AND inspected=0"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})
router.get('/done', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE completed=1"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})


router.get('/inspectors', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.inspectors"
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})



router.get('/uncomplete/:id', (req, res, next) => {
  console.log('markdone', req.params.id)
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = `UPDATE bandc.jobs set completed=0 where id=${req.params.id}`
    console.log(sql)
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/sendBack/:id', (req, res, next) => {
  console.log('markdone', req.params.id)
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = `UPDATE bandc.jobs set inspected=0 where id=${req.params.id}`
    console.log(sql)
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/markDone/:id', (req, res, next) => {
  console.log('markdone', req.params.id)
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = `UPDATE bandc.jobs set completed=1 where id=${req.params.id}`
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/markInspected/:id', (req, res, next) => {
  console.log('markINSPECTED', req.params.id)
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = `UPDATE bandc.jobs set inspected=1 where id=${req.params.id}`
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.get('/today', (req, res, next) => {
  console.log('markdone', req.params.id)
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = `SELECT * FROM bandc.jobs WHERE DATE(inspectionDate) = CURDATE()`
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.post('/get', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE id="+req.body.id
    console.log(sql)
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})

router.post('/inspector', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.inspectors WHERE id="+req.body.id
    console.log(sql)
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.send(rows);
      }
      connection.release();
    });
  });
})


router.get('/test', (req, res, next) => {
    db.getConnection((err, connection) => {
      if (err) {
        res.send(err)
      }
      if(connection){
        res.send('connected to mysql')
      }
    })
})

router.get('/pdf', (req, res, next) => {
    res.download(path.join(__dirname + '/Rest.docx'));
})

router.get('/pic', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/house.jpg'));
})
module.exports = router;
