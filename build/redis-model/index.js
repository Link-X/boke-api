"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const redisClient = require(path.resolve(__dirname, '../db/redis.js'));
/*
    redis hash 保存文章阅读量和点赞状态，已登陆才记录数量
    hashKey：string  用户id
    hashVal： obj { [articleId]: status }
*/
const redisModel = {
    readArticle(params = {
        id: null,
        userId: null
    }) {
        // 增加文章阅读量
        return new Promise((res, rej) => {
            const hashKey = params.id;
            redisClient.hexists(hashKey, params.userId, (err, val) => {
                if (err) {
                    rej(err);
                    return;
                }
                if (val !== 1) {
                    redisClient.hmset(hashKey, {
                        [params.userId]: '0'
                    });
                }
                res();
            });
        });
    },
    getArticleReadLength(params = {
        id: null,
        userId: null
    }) {
        // 获取文章阅读量 和点赞量
        return new Promise((res, rej) => {
            this.getArticleReadDataLen(params).then(allDataLen => {
                const resData = Object.assign(Object.assign({}, allDataLen), { userLoveStatus: '0' });
                // 没有登陆 点赞状态为0
                if (params.userId) {
                    this.getUserIsLoveArticle(params).then(data => {
                        resData.userLoveStatus = data;
                        res(resData);
                    });
                    return;
                }
                res(resData);
            });
        });
    },
    loveArticle(params = {
        id: null,
        userId: null
    }) {
        // 文章点赞 -- 取消点赞
        return new Promise((res, rej) => {
            const hashKey = params.id;
            this.getUserIsLoveArticle(params).then(status => {
                const val = status === '0' ? '1' : '0';
                redisClient.hmset(hashKey, {
                    [params.userId]: val
                });
                setTimeout(() => {
                    this.getArticleReadDataLen(params).then(data => {
                        res(Object.assign({ status: val }, data));
                    });
                }, 20);
            });
        });
    },
    getArticleReadDataLen(params = {
        id: null,
        userId: null
    }) {
        return new Promise((res, rej) => {
            const hashKey = params.id;
            redisClient.hvals(hashKey, (err, allData) => {
                const loveLen = allData.filter(v => v === '1');
                res({
                    articleReadCountLen: allData.length,
                    loveLen: loveLen.length
                });
            });
        });
    },
    getUserIsLoveArticle(params = {
        id: null,
        userId: null
    }) {
        return new Promise((res, rej) => {
            const hashKey = params.id;
            redisClient.hget(hashKey, params.userId, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(data);
            });
        });
    },
    getArticleAllData(id) {
        return new Promise((res, rej) => {
            redisClient.hgetall(id, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(data);
            });
        });
    },
    flushdb() {
        redisClient.flushdb();
    }
};
module.exports = redisModel;
