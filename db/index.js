const mysql = require('mysql')

const mysqlData = {
    host: '39.108.184.64',
    user: 'root',
    password: 'React1010',
    database: 'xChat'
}
const connection = mysql.createConnection(mysqlData)
connection.connect()

module.exports = connection

