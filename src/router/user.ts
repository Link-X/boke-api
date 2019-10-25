
import jwt = require('jsonwebtoken')
import request = require('request')
import urlencode = require('urlencode');
import Express = require('express');
import fs = require('fs')
import path = require('path');
import { TokenData, UserModel, AddUserData, EnditUser, Utils } from '../interface-data/index'
const userModel: UserModel = require(path.resolve(__dirname, '../model/user.js'))
const verify = require(path.resolve(__dirname, '../utils/verify.js'))
const utils: Utils = require(path.resolve(__dirname, '../utils/index.js'))
import { Request, Response, NextFunction } from 'express'

const router = Express.Router()
const verifyFunc = new verify({}, {})


router.post('/user/addUser', (req: Request, res: Response, next: NextFunction) => {
    // 新增用户
    const params: AddUserData = req.body
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
        userModel.addUser(params).then(data => {
            res.send(data)
        }).catch(err => {
            res.send({
                code: err.code,
                message: err.message
            })
        })
    })
})

router.post('/user/login', (req: Request, res: Response, next: NextFunction) => {
    const params: AddUserData = req.body
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
    verifyFunc.validate(status => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            })
            return
        }
        const privateKey: Buffer = fs.readFileSync(__dirname + '/../utils/private.key')
        userModel.userLogin(params).then(data => {
            const payload: TokenData = {
                "iss": "xdb",
                "name": "xdbChat",
                "admin": true,
                "userName": data.userName,
                "password": data.password,
                data: data.data
            }
            const token: string = jwt.sign(payload, privateKey, {
                algorithm: 'RS256'
            })
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

router.post('/user/enditUser', (req: Request, res: Response, next: NextFunction) => {
    const params: EnditUser = req.body
    const tokenData: TokenData = utils.verifyToken(req.headers.token)
    params.id = tokenData.data.id
    const isNull: boolean = Object.keys(params).some(v => params[v])
    if (!params || (params && params.constructor.name !== 'Object') || !isNull) {
        res.send({code: -1, message: "传点东西吧"})
        return
    }
    userModel.enditUser(params).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/simple/weather', (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.city) {
        res.send({code: -1, message: '传城市过来'})
    }
    const city: string = urlencode(req.query.city)
    const url: string = `http://apis.juhe.cn/simpleWeather/query?key=f078319e5f88aebcfa077bf9801650e1&city=${city}`
    request(url, function (error, response, body) {
        if (body) {
            res.send({code: 0, data: body})
            return
        }
        res.send({code: -1, message: '请求失败'})
    })
})

router.get('/get/photo/data', (req: Request, res: Response, next: NextFunction) => {
    userModel.getPhotoData().then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/user/details', (req, res) => {
    const tokenData: TokenData = utils.verifyToken(req.headers.token)
    try {
        if (!tokenData || !(tokenData || tokenData.data || tokenData.data.data.id)) {
            res.send({code: -1, data: { message: '请登陆账号' }})
            return
        }
    } catch(err) {
        res.send({code: -1, data: { message: '请先登陆账号' }})
        return
    }
    userModel.getUserDetials(tokenData).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

module.exports = router