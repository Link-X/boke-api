const express = require('express')
const path = require('path')
const markdown = require("markdown").markdown;
// const utils = require(path.resolve(__dirname, '../utils/index.js'))
const article = require(path.resolve(__dirname, '../model/article.js'))
const verify = require(path.resolve(__dirname, '../utils/verify.js'))

const verifyFunc = new verify({}, {})

const router = express.Router()
router.put('/add/article', (req, res, next) => {

    const params = req.body
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
    params.tags.push('all')
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
            res.send({
                code: 0,
                data
            })
        }).catch((err) => {
            res.send(err)
        })
    })
})

router.get('/get/article', (req, res, next) => {
    const params = req.body
    verifyFunc.$init(params, {
        id: [{
            required: true,
            message: '请选择需要查看的文章',
            type: 'string',
            min: 1,
            max: 9999
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
        article.getArticle(params).then(data => {
            res.send(data)
        }).catch(err => {
            res.send(err)
        })
    })
})

router.post('/endit/article', (req, res, next) => {
    const params = req.body
    verifyFunc.$init(params, {
        id: [{
            required: true,
            message: '请输入文章id',
            type: 'string',
            min: 1,
            max: 9999
        }],
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
        article.enditArticle(params).then(data => {
            res.send(data)
        }).catch(err => {
            res.send(err)
        })
    })
})

router.get('/seach/article', (req, res, next) => {
    const params = req.body
    verifyFunc.$init(params, {
        query: [{
            required: true,
            message: '请输入需要搜索的内容',
            type: 'string',
            min: 1,
            max: 35
        }],
        type: [{
            required: true,
            message: '搜索的类型',
            type: 'string',
            min: 1,
            max: 35
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
        article.seachArticle(params).then(data => {
            let result = []
            console.log(data)
            res.send({code: data.code, data: data.data})
        }).catch(err => {
            res.send(err)
        })
    })
})

module.exports = router