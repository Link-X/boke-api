const express = require('express')
const path = require('path')
const fs = require('fs')
const markdown = require("markdown").markdown;
const utils = require(path.resolve(__dirname, '../utils/index.js'))
const article = require(path.resolve(__dirname, '../model/article.js'))
const verify = require(path.resolve(__dirname, '../utils/verify.js'))

const verifyFunc = new verify({}, {})

const router = express.Router()
function htmlDecode(str) { 
    // 一般可以先转换为标准 unicode 格式（有需要就添加：当返回的数据呈现太多\\\u 之类的时）
    str = unescape(str.replace(/\\u/g, "%u"));
    // 再对实体符进行转义
    // 有 x 则表示是16进制，$1 就是匹配是否有 x，$2 就是匹配出的第二个括号捕获到的内容，将 $2 以对应进制表示转换
    str = str.replace(/&#(x)?(\w+);/g, function($, $1, $2) {
    return String.fromCharCode(parseInt($2, $1? 16: 10));
    });
   
    return str;
   }
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
        tagId: [{
            required: true,
            message: '请选择标签',
            type: 'number',
            validator: function (val, cb) {
                if (!val && val !== 0) {
                    cb(new Error())
                } else {
                    cb()
                }
            }
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
        try {
            params.html = markdown.toHTML(params.markdown)
            params.introduce = params.html.replace(/<(?:.|\s)*?>/g,"").substring(0, 630)
            const userData = utils.verifyToken(req.headers.token)
            params.userName = userData.data.userName
            params.userImage = userData.data.userImage
        } catch(err) {
            res.send({
                code: -1,
                message: "解析不了"
            })
            return
        }
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

router.post('/read/article', (req, res, next) => {
    const params = req.body
    if (!(params && params.id)) {
        res.send({
            code: 0,
            message: 'id为空'
        })
        return
    }
    article.readArticle(params).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/article/list', (req, res, next) => {
    const params = { ...{ page: 1, pageSize: 10 }, ...req.query }
    article.getArticleList(params).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/article/major', (req, res, next) => {
    article.getMajor().then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/get/article/details', (req, res, next) => {
    const params = req.query
    params.id = Number(params.id)
    verifyFunc.$init(params, {
        id: [{
            required: true,
            message: '请选择需要查看的文章',
            type: "Number"
        }]
    })
    let userData = { userName: '' }
    if (req && req.headers && req.headers.token) {
        userData = utils.verifyToken(req.headers.token)
    }
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            })
            return
        }
        article.getArticle(params, userData).then(data => {
            res.send(data)
        }).catch(err => {
            res.send(err)
        })
    })
})

router.post('/love/article', (req, res, next) => {
    const params = req.body
    const userData = (req.headers && req.headers.token && utils.verifyToken(req.headers.token)) || {}
    verifyFunc.$init(params, {
        id: [{
            required: true,
            message: '请输入文章id',
            type: "Number"
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
        article.loveArticle(params, userData).then(data => {
            res.send(data)
        }).catch(err => {
            console.log(err)
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
        // const html = markdown.toHTML(params.markdown)
        // params.html = html
        article.enditArticle(params).then(data => {
            res.send(data)
        }).catch(err => {
            res.send(err)
        })
    })
})

router.get('/seach/article', (req, res, next) => {
    const params = req.query
    verifyFunc.$init(params, {
        query: [{
            required: true,
            message: '请输入需要搜索的内容',
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
            res.send({code: data.code, data: data.data})
        }).catch(err => {
            res.send(err)
        })
    })
})

router.get('/tab/tags', (req, res, next) => {
    const params = req.query
    verifyFunc.$init(params, {
        tagId: [{
            required: true,
            message: '请选择搜索的类型',
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
        article.tabTags(params).then(data => {
            res.send({code: data.code, data: data.data})
        }).catch(err => {
            res.send(err)
        })
    })
})

router.get('/get/tags', (req, res, next) => {
    const params = req.query
    article.getTags(params).then(data => {
        res.send({code: data.code, data: data.data})
    }).catch(err => {
        res.send(err)
    })
})

router.post('/upload-image', (req, res, next) => {
    const file = req.body.file
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    const dataBuffer = new Buffer(base64Data, 'base64')
    const randomStr = Math.random().toString().split('.')[1] + Date.now() + '.jpg'
    const pathHref = '../www/image/' + randomStr
    fs.writeFile(path.resolve(__dirname, pathHref), dataBuffer, function (err) {
        const ip = utils.getIp()
        if (err) {
            res.send({code: -1, message: '上传失败'})
            return
        }
        res.json({code: 0, data: {path: `http://${ip}/image/${randomStr}`}, message: '图片上传成功'})
    })
})

module.exports = router