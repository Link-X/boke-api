const Express = require('express')
const bodyParse = require('body-parser')
const path = require('path')
const app = Express()
const server = require('http').Server(app)

const user = require(path.resolve(__dirname, '../router/user.js'))
const article = require((path.resolve(__dirname, '../router/article.js')))
const JSONData = require((path.resolve(__dirname, '../utils/data.json')))
const utils = require(path.resolve(__dirname, '../utils/index.js'))

const localPort = 3009

// 开发使用（跨越）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials','true');
    next();
})

// 公共静态文件
app.use(Express.static('./public'))
app.use('/', Express.static('./www'))

// 解析参数
app.use(bodyParse.urlencoded())
app.use(bodyParse.json())


app.all('/*', function (req, res, next) {
    const isCheck = JSONData.check.some(v => v === req.url)
    if (isCheck) {
        const data = utils.verifyToken(req.headers.token)
        if (data && data.iss) {
            next()
            return
        }
        res.send({code: -1, message: '请先登陆'});
        return
    }
    next()
})


// 路由
app.use('/api', user, article)

server.listen(localPort, () => {
    console.log('server runing at 127.0.0.1:3009')
})