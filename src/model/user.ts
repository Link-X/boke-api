import moment = require('moment')
import path = require('path');
const utils: Utils = require(path.resolve(__dirname, '../utils/index.js'))
const connection = require(path.resolve(__dirname, '../db/index.js'))
import { ResPonseResetData, AddUserData, TokenData, Id, EnditUser, UserModel, Utils } from '../interface-data/index'

 const userModel: UserModel = {
    addUser (params: AddUserData = { userName: '', password: ''}) {
        // 新增用户
        return new Promise((res, rej) => {
            const createDate: string = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            const sql: string = `INSERT INTO user(userName, password, createDate, province, city, district, remark) SELECT '${params.userName}','${params.password}','${createDate}', '${params.province}', '${params.city}', '${params.district}', '命运是机会的影子' FROM DUAL WHERE NOT EXISTS(SELECT * FROM user WHERE userName = '${params.userName}')`
            connection.query(sql, (err, data) => {
                const response: ResPonseResetData = {
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
    userLogin (params: AddUserData = { userName: '', password: ''}) {
        const that = this
        return new Promise((res, rej) => {
            const sql: string = `SELECT * FROM user WHERE userName='${params.userName}' AND password='${params.password}'`
            connection.query(sql, (err, data) => {
                if (Object.prototype.toString.call(data) === '[object Array]' &&  data.length) {
                    res({code: 0, message: '登陆成功', data: data[0]})
                } else {
                    // 没有找到账号直接帮他注册一个
                    that.addUser({
                        userName: params.userName,
                        password: params.password,
                        province: params.province,
                        city: params.city,
                        district: params.district
                    }).then(() => {
                        connection.query(sql, (err, data) => {
                            res({code: 0, message: '登陆成功', data: data[0]})
                        })
                    }).catch(err => {
                        rej({code: -1, message: '密码错误或账号已存在'})
                    })
                }
            }, rej)
        })
    },
    enditUser (params: EnditUser) {
        return new Promise((res, rej) => {
            const arr: string[] = ['name', 'userType', 'remark', 'iphone', 'addres', 'friendId', 'label', 'groupId', 'loverArticleId', 'userArticleId']
            params = utils.joinArray(arr, params)
            const sqlData = arr.reduce((v, j) => {
                const symbol = v ? ',' : ''
                let val = params[j] ? params[j] : ''
                return v += `${symbol}${j} = '${val}'`
            }, '')
            const sql: string = `UPDATE user SET ${sqlData} WHERE id = '${params.id}'`
            connection.query(sql, function (err, data) {
                res({code: 0, message: '修改成功', data: data})
             }, rej)
        })
    },
    getPhotoData () {
        return new Promise((res, rej) => {
            const sql: string = "SELECT * FROM photo_album"
            connection.query(sql, function (err, data) { 
                res({code: 0, data})
             }, rej)
        })
    },
    getUserDetials(params: TokenData) {
        return new Promise((res, rej) => {
            const sql: string = `SELECT name, id, userName, userType, remark, iphone, addres, createDate, label, userImage, province, city, district, email FROM user WHERE id=${params.data.id}`
            connection.query(sql, function (err, data) { 
                res({code: 0, data})
             }, rej)
        })
    }
}

module.exports = userModel