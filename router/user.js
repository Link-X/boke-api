const express = require('express')
const router = express.Router()
const user = require(__dirname + '/../model/user.js')
const verify = require(__dirname + '/../utils/verify.js')
const fs = require('fs')
const verifyFunc = new verify({}, {})
var jwt = require('jsonwebtoken')
router.post('/user/addUser', (req, res, next) => {
    // 新增用户
    const params = req.body
    verifyFunc.$init(params, {
        userName: [{
            required: true,
            message: '用户名最小为6位，最大为15位',
            type: 'string',
            min: 6,
            max: 15
        }],
        password: [{
            required: true,
            message: '密码长度不能小于6位，大于15位',
            type: 'string',
            min: 6,
            max: 15
        }]
    })
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            })
            return
        }
        user.addUser(params).then(data => {
            res.send(data)
        }).catch(err => {
            res.send({
                code: err.code,
                message: err.message
            })
        })
    })
})

router.post('/user/login', (req, res, next) => {
    const params = req.body
    verifyFunc.$init(params, {
        userName: [{
            required: true,
            message: '请输入正确的用户名',
            type: 'string',
            min: 6,
            max: 15
        }],
        password: [{
            required: true,
            message: '请输入正确的密码',
            type: 'string',
            min: 6,
            max: 15
        }]
    })
    verifyFunc.validate(status => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            })
            return
        }
        const privateKey = fs.readFileSync(__dirname + '/../utils/private.key')
        user.userLogin(params).then(data => {
            const payload = {
                "iss": "xdb",
                "name": "xdbChat",
                "admin": true,
                "userName": params.userName,
                "password": params.password
            }
            const way = {
                algorithm: 'RS256'
            }
            const token = jwt.sign(payload, privateKey, way)
            res.send({
                code: 0,
                data: {
                    token: token
                }
            })
        }).catch(err => {
            res.send({
                code: err.code,
                message: err.message
            })
        })
    })
})
module.exports = router