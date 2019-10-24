const path = require('path')
const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const request = require('request')
const urlencode = require('urlencode');
const user = require(path.resolve(__dirname, '../model/user.js'))
const verify = require(path.resolve(__dirname, '../utils/verify.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))

const router = express.Router()
const verifyFunc = new verify({}, {})
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
            min: 2,
            max: 15
        }],
        password: [{
            required: true,
            message: '请输入正确的密码',
            type: 'string',
            min: 1,
            max: 15
        }]
    })
    console.log(params);
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
                "userName": data.userName,
                "password": data.password,
                data: data.data
            }
            const way = {
                algorithm: 'RS256'
            }
            const token = jwt.sign(payload, privateKey, way)
            delete data.data.password
            res.send({
                code: 0,
                data: {
                    token: token,
                    userData: data.data
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

router.post('/user/enditUser', (req, res, next) => {
    const params = req.body
    const tokenData = utils.verifyToken(req.headers.token)
    params.id = tokenData.data.id
    const isNull = Object.keys(params).some(v => params[v])
    if (!params || (params && params.constructor.name !== 'Object') || !isNull) {
        res.send({code: -1, message: "传点东西吧"})
        return
    }
    user.enditUser(params).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/simple/weather', (req, res, next) => {
    if (!req.query.city) {
        res.send({code: -1, message: '传城市过来'})
    }
    const city = urlencode(req.query.city)
    const url = `http://apis.juhe.cn/simpleWeather/query?key=f078319e5f88aebcfa077bf9801650e1&city=${city}`
    request(url, function (error, response, body) {
        if (body) {
            res.send({code: 0, data: body})
            return
        }
        res.send({code: -1, message: '请求失败'})
    })
})

router.get('/get/photo/data', (req, res, next) => {
    user.getPhotoData().then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/user/details', (req, res) => {
    const tokenData = utils.verifyToken(req.headers.token)
    try {
        if (!tokenData || !(tokenData || tokenData.data || tokenData.data.data.id)) {
            res.send({code: -1, data: { message: '请登陆账号' }})
            return
        }
    } catch(err) {
        res.send({code: -1, data: { message: '请先登陆账号' }})
        return
    }
    user.getUserDetials(tokenData).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

module.exports = router