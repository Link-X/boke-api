const Express = require('express')
const bodyParse = require('body-parser')
const path = require('path')
const fs = require('fs')
const url = require('url')
const app = Express()
const server = require('http').Server(app)
const os = require('os')
const sysType = os.type()
const user = require(path.resolve(__dirname, '../router/user.js'))
const article = require((path.resolve(__dirname, '../router/article.js')))
const JSONData = require((path.resolve(__dirname, '../utils/data.json')))
const utils = require(path.resolve(__dirname, '../utils/index.js'))
const timingTask = require(path.resolve(__dirname, '../timing-task/index.js')) 
const connectHistoryApiFallback = require('connect-history-api-fallback')
const localPort = sysType === 'Linux' ? 80 : 9008

// 开发使用（跨域）
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
//     res.header('Access-Control-Allow-Credentials','true');
//     next();
// })

app.use('/', connectHistoryApiFallback())
// 公共静态文件
app.use('/', Express.static('./www'))
// app.use('/.well-known/pki-validation', Express.static('./httpsSSl', {maxage: '2h'}))
app.use('/image', Express.static('./www/image', {maxage: '2h'}))
// 解析参数
app.use(bodyParse.urlencoded())
app.use(bodyParse.json({limit: '20mb'}))


app.all('/api/*', function (req, res, next) {
    const isCheck = JSONData.check.some(v => v === req.url)
    if (isCheck) {
        // 拦截是否登陆
        const data = utils.verifyToken(req.headers.token)
        if (data && data.iss) {
            next()
            return
        }
        res.send({code: '0001', message: '请先登陆'});
        return
    }
    next()
})


// 路由
app.use('/api', user, article)

// 404处理
app.get('*', (req, res, next) => {
    // options 快速返回
    if(req.method === 'OPTIONS') { 
        res.send(200)
    }

    const pathname = url.parse(req.url).pathname
    const isCheck = JSONData.apiGather.get.some(v => {
        return v === pathname
    })
    const ext = path.extname(pathname)
    const paths = path.resolve(__dirname, `../www/nodeWww/${pathname}`)
    if (isCheck) {
        // 如果是get接口不检验
        next()
        return
    }
    if (pathname !== '/favicon.ico') {
        fs.readFile(paths, (err, data) => {
            if (err) {
                const paths404 = path.resolve(__dirname, `../www/nodeWww/404.html`)
                fs.readFile(paths404, (err, data) => {
                    res.writeHead(200, {
                        "Content-Type":  "text/html; charset='utf-8'"
                    })
                    res.write(paths404)
                    res.end()
                })
                return
            }
            res.writeHead(200, {
                "Content-Type":  ext + "; charset='utf-8'"
            })
            res.write(data)
            res.end()
        })
        return
    }
})

server.listen(localPort, () => {
    console.log('server runing at 127.0.0.1:80')
})

timingTask.synchronousArticleLove()