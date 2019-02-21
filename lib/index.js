const Express = require('express')
const bodyParse = require('body-parser')

const localPort = 80
const app = Express()
const server = require('http').Server(app)

const user = require('../router/user.js')
const article = require('../router/article.js')

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


// 路由
app.use('/api', user, article)

server.listen(localPort, () => {
    console.log('server runing at 127.0.0.1:80')
})