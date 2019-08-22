const mysql = require('mysql')

const mysqlData = {
    host: '39.108.184.64',
    user: 'root',
    password: 'React1010',
    database: 'xChat'
}
const connection = mysql.createConnection(mysqlData)
connection.connect()

function connect() {
    this.query = function (sql, cb, rej) { 
        connection.query(sql, (err, data) => {
            if (err && rej) {
                rej({
                    code: -1,
                    message: 'sql出错',
                    data: {}
                })
                cb(err, data)
                return
            }
            cb(err, data)
        })
     }
}

module.exports = new connect()

