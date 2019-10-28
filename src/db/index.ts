import mysql = require('mysql')
import os = require('os')
import path = require('path')
import { MysqlData } from '../interface-data/index'
const sysType = os.type()
const mysqlJson: MysqlData = require(path.resolve(__dirname, '../md/mysql.json'))

mysqlJson.addree = sysType === 'Linux' ? 'localhost' : mysqlJson.addree
const pool = mysql.createPool(mysqlJson);
// const connection = mysql.createConnection(mysqlData)
// connection.connect()

function connect() {
    this.query = function (sql: string, cb: Function, rej: Function) {
        pool.getConnection(function(err,conn){
            if(err){
                rej({
                    code: -1,
                    message: 'sql出错',
                    data: {}
                })
                cb(err)
            } else {
                conn.query(sql,function(qerr,vals,fields){
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    cb && cb(qerr,vals,fields);
                });
            }
        });
        // connection.query(sql, (err, data) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     if (err && rej) {
        //         rej({
        //             code: -1,
        //             message: 'sql出错',
        //             data: {}
        //         })
        //         cb(err, data)
        //         return
        //     }
        //     cb && cb(err, data)
        // })
     }
}
const connectObj = new connect()

module.exports = connectObj

