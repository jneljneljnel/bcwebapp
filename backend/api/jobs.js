const router = require('express').Router();
const db = require('../db');

router.post('/new', (req, res, next) => {
  if(req.body.name && req.body.clientId)
  {
    console.log(req.body)
    const sql = `INSERT INTO bandc.jobs
                  (
                    name,
                    recievedDate,
                    inspectionDate,
                    actionLevel,
                    cost,
                    clientId,
                    phone,
                    address,
                    comments)
                VALUES
                  ("`+req.body.name+`",
                  "`+req.body.recievedDate+`",
                  "`+req.body.inspectionDate+`",
                  "`+req.body.actionLevel+`",
                  "`+req.body.cost+`",
                  "`+req.body.clientId+`",
                  "`+req.body.phone+`",
                  "`+req.body.address+`",
                  "`+req.body.comments+`");`
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


router.get('/open', (req, res, next) => {
  console.log('open open')
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.jobs WHERE completed=0"
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

module.exports = router;
