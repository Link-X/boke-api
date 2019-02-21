const express = require('express')
const path = require('path')
const markdown = require( "markdown" ).markdown;
const utils = require(path.resolve(__dirname, '../utils/index.js'))
const article = require(path.resolve(__dirname, '../model/article.js'))
const verify = require(path.resolve(__dirname, '../utils/verify.js'))

const verifyFunc = new verify({}, {})

const router = express.Router()
router.put('/add/article', (req, res, next) => {
    
    const params = req.body
    const data = utils.verifyToken(params.token)
    if (!data || data && !data.iss) {
        res.send({code: 2008, message: '用户信息错误', data: {}})
        return
    }

    verifyFunc.$init(params, {
        title: [{
            required: true,
            message: '标题不能小于1大于30',
            type: 'string',
            min: 1,
            max: 35
        }],
        markdown: [{
            required: true,
            message: '请输入内容',
            type: 'string',
            min: 1,
            max: 999999999
        }],
        tags: [{
            required: true,
            message: '请选择标签',
            type: 'array'
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
        const html = markdown.toHTML(params.markdown)
        params.html = html
        article.addArticle(params).then((data) => {
            res.send({code: 0, data})
        }).catch((err) => {
            res.send(err)
        })
    })
})


module.exports = router