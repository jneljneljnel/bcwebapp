const router = require('express').Router();
const db = require('../db');
router.get('/new', (req, res, next) => {
  res.send('clients')
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

router.post('/get', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.clients Where id="+req.body.id
    console.log(sql)
    connection.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.json(rows);
      }
      connection.release();
    });
});
})

router.get('/all', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.clients"
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

router.post('/update', (req, res, next) => {
  console.log('client update')
    console.log(req.body)
    const sql = `UPDATE bandc.clients
                  set name = "`+req.body.name+`",
                  company = "`+req.body.company+`",
                  phone1 = "`+req.body.phone1+`",
                  phone2 = "`+req.body.phone2+`",
                  email = "`+req.body.email+`",
                  street = "`+req.body.street+`",
                  city = "`+req.body.city+`",
                  postal = "`+req.body.postal+`",
                  state = "`+req.body.state+`"
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
})

router.post('/new', (req, res, next) => {
  console.log(req.body)
  const sql = `INSERT INTO bandc.clients
                (
                name,
                company,
                phone1,
                phone2,
                email,
                street,
                city,
                postal,
                state)
              VALUES
                ("`+req.body.name+`",
                "`+req.body.company+`",
                "`+req.body.phone1+`",
                "`+req.body.phone2+`",
                "`+req.body.email+`",
                "`+req.body.street+`",
                "`+req.body.city+`",
                "`+req.body.postal+`",
                "`+req.body.state+`");`
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
  });
})


module.exports = router;
