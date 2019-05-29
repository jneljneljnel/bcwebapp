const db = require('../db');
const router = require('express').Router();

router.post('/get', (req, res, next) => {
  db.getConnection((error, connection) => {
    if (error) console.log('err', error);
    let sql = "SELECT * From bandc.inspections Where jobid="+req.body.id
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


// router.post('/update', (req, res, next) => {
//   console.log('GOT CALLED UPDATE')
//   let id = req.body.id
//   let state = req.body.state
//   console.log(state)
//   if(req.body.id && req.body.state)
//   {
//     console.log(req.body)
//     const sql = "UPDATE bandc.inspections set state = '"+state+"' WHERE id ='"+id+"';"
//
//     console.log(sql)
//     db.getConnection((error, connection) => {
//         if (error) console.log('err', error);
//         // connection.query(sql, (err, rows) => {
//         //   if (err) {
//         //     return res.status(500).send(err);
//         //   } else {
//         //     res.send(rows);
//         //   }
//         //   connection.release();
//         // });
//     })
//   }
// })


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
