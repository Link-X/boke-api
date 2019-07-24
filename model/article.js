import moment from 'moment'
const path = require('path')
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))


module.exports = {
    addArticle (params = {}) {
        return new Promise((res, rej) => {
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            params.createDate = createDate
            const arr = ['title', 'content', 'html', 'markdown', 'tagId', 'createDate']
            const sqlData = {...params}
            // params = utils.joinArray(arr, params)
            const sql = `INSERT INTO article (title, content, html, markdown, tagId, introduce, createDate) VALUES ('${sqlData.title}', '${sqlData.content}', '${sqlData.html}', '${sqlData.markdown}', '${sqlData.tagId}', '${sqlData.introduce}', '${sqlData.createDate}')`
            connection.query(sql, (err, data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错', data: {}})
                    return
                }
                res({code: 0, data})
            })
        })
    },
    getArticleList (params = { page: 1, pageSize: 10 }) {
        return new Promise((res, rej) => {
            const sql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg FROM article where id>=(${params.page - 1})*${params.pageSize} limit ${params.pageSize}`
            const getMajorSql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg FROM article where major=1`
            const getMajorSql2 = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg FROM article where major2=1`
            connection.query(sql, (err,data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                connection.query(getMajorSql, (err, moajorData) => {
                    if (err) {
                        rej({code: -1, message: 'sql出错'})
                        return
                    }
                    connection.query(getMajorSql2, (err, moajorData2) => {
                        if (err) {
                            rej({code: -1, message: 'sql出错'})
                            return
                        }    
                        res({code: 0, data: {
                            major: moajorData,
                            major2: moajorData2,
                            list: data
                        }})
                    })
                })
            })
        })
    },
    getArticle (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT * from article WHERE id = ${params.id}`
            console.log(sql)
            connection.query(sql, (err, data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                res({code: 0, data: data})
            })
        })
    },
    enditArticle (params = {}) {
        return new Promise((res, rej) => {
            const arr = ['title', 'content', 'html', 'markdown', 'tagId']
            // params = utils.joinArray(arr, params)
            const sql = `UPDATE article SET title = '${params.title}', content = '${params.content}',  html = '${params.html}', markdown = 'params.markdown', tagId = '${params.tagId}' WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res({code: 0, message: '修改成功', data})
                    } else {
                        rej({code: 0, message: '未修改', data: count})
                    }
                })
            })
        })
    },
    seachArticle (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT * FROM article a WHERE concat(a.markdown, a.title) like '%${params.query}%'`
            console.log(sql)
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                res({code: 0, data})
            })
        })
    },
    tabTags (params = {}) {
        return new Promise((res, rej) => {
            const tagId = params.tagId
            const sql = `SELECT * FROM article a, tags t WHERE '${tagId}'=t.id`
            connection.query(sql, (err, data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                res({code: 0, data})
            })
        })
    },
    getTags (params = {}) {
        return new Promise((res, rej) => {
            const sql = 'SELECT * FROM tags'
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                res({code: 0, data})
            })
        })
    }
}