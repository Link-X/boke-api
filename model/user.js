import moment from 'moment'
const connection = require('../db/index.js')
module.exports = {
    addUser (params = {}) {
        // 新增用户
        return new Promise((res, rej) => {
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            const sql = `INSERT INTO user(userName, password, createDate) SELECT '${params.userName}','${params.password}','${createDate}' FROM DUAL WHERE NOT EXISTS(SELECT * FROM user WHERE userName = '${params.userName}')`
            connection.query(sql, (err, data) => {
                const response = {
                    code: 200,
                    message: '',
                    data: {
                        userName: params.userName,
                        createDate: createDate
                    }
                }
                if (err) {
                    response.code = -1
                    rej(response)
                    return
                }
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res(response)
                    } else {
                        response.code = 201
                        response.message = count
                        rej(response)
                    }
                })
            })
        })
    },
    userLogin (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT * FROM user WHERE userName='${params.userName}' AND password='${params.password}'`
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                if (data.length) {
                    res({code: 0, message: '登陆成功', data: {token: '1'}})
                }
            })
        })
    }
}