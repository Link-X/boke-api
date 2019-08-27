
const path = require('path')
const redisClient = require(path.resolve(__dirname, '../db/redis.js'))
/*
    redis hash 保存文章阅读量和点赞状态，已登陆才记录数量
    hashKey：string  用户id
    hashVal： obj { [articleId]: status }
*/
module.exports = {
    readArticle (params = {}, userData) {
        // 增加文章阅读量
        if (!userData.data.id) {
            return
        }
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
            })
        })
    },
    getArticleReadLength (params = {}) {
        // 获取文章阅读了
        return new Promise((res, rej) => {
            const hashKey = params.id
            redisClient.hlen(hashKey, (err ,len) => {
                if (err) {
                    rej(err)
                    return
                }
                res(len)
            })
        })
    },
    loveArticle (params = {}) {
        // 文章点赞
        return new Promise((res, rej) => {
            const hashKey = params.id
            redisClient.hget(hashKey, params.userId, (err, data) => {
                if (err) {
                    rej(err)
                    return
                }
                const val = data === '0' ? '1' : '0'
                redisClient.hmset(hashKey, {
                    [params.userId]: val
                })
                redisClient.hvals(hashKey, (err, allData) => {
                    const loveLen = allData.filter(v => v === '1')
                    res({
                        status: val,
                        loveLen: loveLen.length
                    })
                })
            })
        })
    },
    flushdb () {
        redisClient.flushdb()
    }
}