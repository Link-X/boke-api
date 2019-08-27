import moment from 'moment'
const path = require('path')
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))
const redisMode = require(path.resolve(__dirname, '../redis-model/index.js'))

module.exports = {
    addArticle (params = {}) {
        return new Promise((res, rej) => {
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            params.createDate = createDate
            const sqlData = {...params}
            sqlData.markdown = utils.toLiteral(sqlData.markdown)
            // sqlData.html = utils.toLiteral(sqlData.html)
            const sql = `INSERT INTO article (title, markdown, tagId, introduce, createDate, userName, userImage, articleImg) VALUES ('${sqlData.title}', "${sqlData.markdown}", '${sqlData.tagId}', "${sqlData.introduce}", '${sqlData.createDate}', '${sqlData.userName}', '${sqlData.userImage}', '${sqlData.articleImg}')`
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    loveArticle(params, userData) {
        return new Promise((res, rej) => {
            redisMode.loveArticle({id: params.id, userId: userData.data.id}).then(data => {
                res({code: 0, data})
            })
        })
    },
    getArticleList (params = { page: 1, pageSize: 10 }) {
        return new Promise((res, rej) => {
            const sql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where id>=(${params.page - 1})*${params.pageSize} limit ${params.pageSize}`
            connection.query(sql, (err,data) => {
                res({code: 0, data: {
                    list: data
                }})
            }, rej)
        })
    },
    getMajor() {
        const getMajorSql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where major=1`
        const getMajorSql2 = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where major2=1`
        return new Promise((res, rej) => {
            connection.query(getMajorSql, (err, data) => {
                connection.query(getMajorSql2, (err, data2) => {
                    res({code: 0, data: {
                        major: data,
                        major2: data2
                    }})
                }, rej)
            }, rej)
        }) 
    },
    getArticle (params = {}, userData) {
        return new Promise((res, rej) => {
            const sql = `SELECT * from article WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                if (userData.data && userData.data.id) {
                    redisMode.readArticle(params, userData)
                }
                redisMode.getArticleReadLength(params).then(readLength => {
                    const resData = { ...data[0], ...{ readNumber: readLength } }
                    res({code: 0, data: resData})
                })
            }, rej)
        })
    },
    enditArticle (params = {}) {
        return new Promise((res, rej) => {
            const arr = ['title', 'content', 'markdown', 'tagId']
            // params = utils.joinArray(arr, params)
            params.markdown = utils.toLiteral(params.markdown)
            // params.html = utils.toLiteral(params.html)
            const sql = `UPDATE article SET title = '${params.title}', markdown = "params.markdown", tagId = '${params.tagId}' WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res({code: 0, message: '修改成功', data})
                    } else {
                        rej({code: 0, message: '未修改', data: count})
                    }
                })
            }, rej)
        })
    },
    seachArticle (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT * FROM article a WHERE concat(a.markdown, a.title) like '%${params.query}%'`
            console.log(sql)
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    tabTags (params = {}) {
        return new Promise((res, rej) => {
            const tagId = params.tagId
            const sql = `SELECT * FROM article a, tags t WHERE '${tagId}'=t.id`
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    getTags (params = {}) {
        return new Promise((res, rej) => {
            const sql = 'SELECT * FROM tags'
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    }
}