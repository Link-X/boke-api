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
                res({code: 0, data})
            }, rej)
        })
    },
    readArticle (params = {}, userData) {
        return new Promise((res, rej) => {
            const sql = `SELECT readNumber FROM article WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                if (data && data[0]) {
                    const readNumber = data[0].readNumber || 0
                    if (readNumber > 9999) {
                        res({code: 0, data: {message: '成功'}})
                        return
                    }
                    const sql2 = `UPDATE article SET readNumber=${readNumber+1} WHERE id=${params.id}`
                    connection.query(sql2, (err2, data2) => {
                        res({code: 0, data: {message: '成功'}})
                        this.setArticalTb({
                            u_id: userData && userData.data && userData.data.id,
                            a_id: params.id
                        })
                    })
                } else {
                    res({code: 0, data: {message: '没用数据'}})
                }
            }, rej)
        })
    },
    setArticalTb(params) {
        // 如果用户登录了，则添加
        if (!(params && params.u_id)) {
            return
        }
        const getSql = `SELECT u_id FROM user_artical_tb WHERE u_id = ${params.u_id} AND a_id = ${params.a_id}`
        connection.query(getSql, (err, data) => {
            if (!(data && data.length)) {
                const setSql = `INSERT INTO  user_artical_tb (u_id, a_id, status) VALUES (${params.u_id}, ${params.a_id}, 0)`
                connection.query(setSql)
            }
        })
    },
    loveArticle(params, userData) {
        return new Promise((res, rej) => {
            const sql = `UPDATE user_artical_tb SET status = ${params.status} WHERE u_id = ${userData.id} AND a_id=${params.id}`
            connection.query(sql, (err, data) => {
                res({
                    code: 0,
                    data: data,
                    message: '成功'
                })
                const getLoveNumber = `SELECT a_id FROM user_artical_tb WHERE a_id = ${params.id} AND status = 1`
                connection.query(getLoveNumber, (err2, data2) => {
                    const setSql = `UPDATE article SET loverNumber = ${data2.length} WHERE id = ${params.id}`
                    connection.query(setSql, (err3, data3) => {
                    }, rej)
                }, rej)
            }, rej)
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
                this.readArticle({id: params.id}, userData)
                res({code: 0, data: data})
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