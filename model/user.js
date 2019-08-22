import moment from 'moment'
const path = require('path')
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))
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
                        console.log('get2', response)
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
        const that = this
        return new Promise((res, rej) => {
            const sql = `SELECT * FROM user WHERE userName='${params.userName}' AND password='${params.password}'`
            connection.query(sql, (err, data) => {
                if (data.length) {
                    res({code: 0, message: '登陆成功', data: data[0]})
                } else {
                    console.log(params);
                    // 没有找到账号直接帮他注册一个
                    that.addUser({
                        userName: params.userName,
                        password: params.password
                    }).then(userData => {
                        res({code: 0, message: '登陆成功', data: data})
                    }).catch(err => {
                        rej({code: -1, message: '密码错误或账号已存在'})
                    })
                }
            }, rej)
        })
    },
    enditUser (params = {}) {
        return new Promise((res, rej) => {
            const arr = ['name', 'userType', 'remark', 'iphone', 'addres', 'friendId', 'label', 'groupId', 'loverArticleId', 'userArticleId']
            params = utils.joinArray(arr, params)
            const sqlData = arr.reduce((v, j) => {
                const symbol = v ? ',' : ''
                let val = params[j] ? params[j] : ''
                return v += `${symbol}${j} = '${val}'`
            }, '')
            const sql = `UPDATE user SET ${sqlData} WHERE id = '${params.id}'`
            console.log(sql)
            connection.query(sql, function (err, data) {
                res({code: 0, message: '修改成功', data: data})
             }, rej)
        })
    }
}