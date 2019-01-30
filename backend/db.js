const mysql = require('mysql');
//const process = require('process');
let db;

function connectDatabase() {
  if (!db) {
      db = mysql.createPool({
        host     : 'mydb.cyy0q7m6symi.us-east-1.rds.amazonaws.com',
        user     : 'jnelson',
        password : 'bandcmysql',
        database: 'bandc'
      });
  }

  return db;
}
module.exports = connectDatabase();
