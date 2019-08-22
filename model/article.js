import moment from 'moment'
const path = require('path')
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))


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
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错', data: {}})
                    return
                }
                res({code: 0, data})
            })
        })
    },
    readArticle (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT readNumber FROM article WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                if (data && data[0]) {
                    const readNumber = data[0].readNumber || 0
                    if (readNumber > 9999) {
                        res({code: 0, data: {message: '成功'}})
                        return
                    }
                    const sql2 = `UPDATE article SET readNumber=${readNumber+1} WHERE id=${params.id}`
                    connection.query(sql2, (err2, data2) => {
                        res({code: 0, data: {message: '成功'}})
                    })
                } else {
                    res({code: 0, data: {message: '没用数据'}})
                }
            })
        })
    },
    getArticleList (params = { page: 1, pageSize: 10 }) {
        return new Promise((res, rej) => {
            const sql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where id>=(${params.page - 1})*${params.pageSize} limit ${params.pageSize}`
            connection.query(sql, (err,data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                res({code: 0, data: {
                    list: data
                }})
            })
        })
    },
    getMajor() {
        const getMajorSql = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where major=1`
        const getMajorSql2 = `SELECT introduce,tagId,loverNumber,readNumber,createDate,title,id,articleImg,userName,userImage FROM article where major2=1`
        return new Promise((res, rej) => {
            connection.query(getMajorSql, (err, data) => {
                if (err) {
                    console.log(err)
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                connection.query(getMajorSql2, (err, data2) => {
                    if (err) {
                        console.log(err)
                        rej({code: -1, message: 'sql出错'})
                        return
                    }
                    res({code: 0, data: {
                        major: data,
                        major2: data2
                    }})
                })
            })
        }) 
    },
    getArticle (params = {}) {
        return new Promise((res, rej) => {
            const sql = `SELECT * from article WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错'})
                    return
                }
                this.readArticle({id: params.id})
                res({code: 0, data: data})
            })
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