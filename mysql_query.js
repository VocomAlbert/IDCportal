const PATH = require('path');
require('dotenv').config({ path: PATH.resolve(__dirname, './.env') });
const MYSQL = require('mysql');
const MOMENT = require('moment');
// const LOG = require('../modules/logs.js');
// const Mail = require('../modules/mail.js');


// log
// const mysqlLogger = LOG.mysqlLogger
// const OCSmysqlLogger = LOG.OCSmysqlLogger;

const pool = MYSQL.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_IDCDATABASE,
  multipleStatements: true,
  connectionLimit: 10
})

/**
 * 
 * @param {String} sql The SQL command
 * @param {Array} values The corresponding data in the command
 * @returns 
 */
function Query (sql, values, type = 'boss') {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      } else {
        //do sql query
        connection.query(sql, values, (err, rows) => {
          if ((sql.indexOf('delete') > -1 || sql.indexOf('update') > -1 || sql.indexOf('insert') > -1) && sql.indexOf('locationLog') == -1) {
            // if (type == 'ocs') {
            //   OCSmysqlLogger.debug(sql, JSON.stringify(values));
            // } else {
            //   mysqlLogger.debug(sql, JSON.stringify(values));
            // }
          }
          if (err) {
            // let message = {
            //   subject: `ERROR from Sandbox database operation!`,
            //   text: `Time:\r\n${MOMENT().format('YYYY-MM-DD HH:mm:ss')},\r\nError Message:\r\n${err.message},\r\nError Stack:\r\n${err.stack},\r\nQuery:\r\n${sql},` + `\r\nvalues:\r\n${JSON.stringify(values, null, 1)}`
            // }
            // Mail(message);
            // reject(err, mysqlLogger.error(sql, JSON.stringify(values)));
          } else {
            resolve(rows);
          }
          connection.release();
        })
      }
    })
  })
}

module.exports =  Query 
