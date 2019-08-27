
const path = require('path')
const redisClient = require(path.resolve(__dirname, '../db/redis.js'))
/*
    redis hash 保存文章阅读量和点赞状态，已登陆才记录数量
    hashKey：string  用户id
    hashVal： obj { [articleId]: status }
*/
module.exports = {
    readArticle (params = {}) {
        // 增加文章阅读量
        return new Promise((res, rej) => {
            const hashKey = params.id
            redisClient.hexists(hashKey, userData.data.id, (err, val) => {
                if (err) {
                    rej(err)
                    return
                }
                if (val !== 1) {
                    redisClient.hmset(hashKey, {
                        [userData.data.id]: '0'
                    })
                }
                res()
            })
        })
    },
    getArticleReadLength (params = {}) {
        // 获取文章阅读量 和点赞量
        return new Promise((res, rej) => {
            this.getArticleLoveLength(params).then(allData => {
                const resData = {
                    ...allData,
                    ...{ userLoveStatus: '0' }
                }
                if (params.userId) {
                    // 没有登陆 点赞状态为0
                    this.getUserIsLoveArticle(params).then(data => {
                        resData.userLoveStatus = data
                        res(resData)
                    })
                    return
                }
                res(resData)
            })
        })
    },
    loveArticle (params = {}) {
        // 文章点赞 -- 取消点赞
        return new Promise((res, rej) => {
            const hashKey = params.id
            this.getUserIsLoveArticle(params).then(status => {
                const val = status === '0' ? '1' : '0'
                redisClient.hmset(hashKey, {
                    [params.userId]: val
                })
                setTimeout(() => {
                    this.getArticleLoveLength(params).then(data => {
                        res(data)
                    })
                }, 20)
            })
        })
    },
    getArticleLoveLength (params) {
        return new Promise((res, rej) => {
            const hashKey = params.id
            redisClient.hvals(hashKey, (err, allData) => {
                const loveLen = allData.filter(v => v === '1')
                res({
                    articleReadCountLen: allData.length,
                    loveLen: loveLen.length
                })
            })
        })
    },
    getUserIsLoveArticle (params) {
        return new Promise((res, rej) => {
            const hashKey = params.id
            redisClient.hget(hashKey, params.userId, (err, data) => {
                if (err) {
                    rej(err)
                    return
                }
                res(data)
            })
        })
    },
    flushdb () {
        redisClient.flushdb()
    }
}