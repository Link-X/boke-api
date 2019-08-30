const mysql = require('mysql')
const os = require('os')
const sysType = os.type()
const addree = sysType === 'Linux' ? 'localhost' : '39.108.184.64'

const mysqlData = {
    host: addree,
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
            cb && cb(err, data)
        })
     }
}
const connectObj = new connect()
module.exports = connectObj

