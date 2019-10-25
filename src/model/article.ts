import moment = require('moment')
import path = require('path')
import { RedisModel } from '../interface-data/index'
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils: Utils = require(path.resolve(__dirname, '../utils/index.js'))
const redisMode: RedisModel = require(path.resolve(__dirname, '../redis-model/index.js'))
import { 
    AddArticleComment,
    TabArticle,
    AddArticle,
    DelArticle, 
    Id, 
    TokenData, 
    Page, 
    EditArticle, 
    ArticleDetails,
    SearchArticle,
    ArticleModel,
    Utils
 } from '../interface-data/index'

const articleModel: ArticleModel = {
    addArticle (params: AddArticle = {
        html: '',
        markdown: '',
        introduce: '',
        userName: '',
        userId: null,
        userImage: '',
        title: '',
        tagId: '',
        articleImg: ''
    }) {
        return new Promise((res, rej) => {
            const createDate: string = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            params.createDate = createDate
            const sqlData: AddArticle = { ...params }
            sqlData.markdown = utils.toLiteral(sqlData.markdown)
            // sqlData.html = utils.toLiteral(sqlData.html)
            const sql: string = `INSERT INTO article (title, markdown, tagId, introduce, createDate, userName, userImage, articleImg, userId) VALUES ('${sqlData.title}', "${sqlData.markdown}", '${sqlData.tagId}', "${sqlData.introduce}", '${sqlData.createDate}', '${sqlData.userName}', '${sqlData.userImage}', '${sqlData.articleImg}', '${sqlData.userId || ''}')`
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    delArticle (params: DelArticle = {
        id: null,
        userName: '',
        userId: null
    }) {
        return new Promise((res, rej) => {
            const sql: string = `DELETE FROM article WHERE id=${params.id} AND userId=${params.userId}`
            connection.query(sql, (err, data) => {
                res({code: 0, data: { message: '删除成功' }})
            }, rej)
        })
    },
    loveArticle(params: Id, userData: TokenData) {
        return new Promise((res, rej) => {
            redisMode.loveArticle({id: params.id, userId: userData.data.id}).then(data => {
                res({code: 0, data})
            })
        })
    },
    getArticleList (params: Page = { page: 0, pageSize: 10 }) {
        return new Promise((res, rej) => {
            const sql: string = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage,major,major2 FROM article ORDER BY createDate DESC LIMIT ${params.page * params.pageSize}, ${params.pageSize}`
            connection.query(sql, (err,data) => {
                res({code: 0, data: {
                    list: data
                }})
            }, rej)
        })
    },
    getMajor() {
        const getMajorSql: string = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage FROM article where major=1`
        const getMajorSql2: string = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage FROM article where major2=1`
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
    getArticle (params: Id = { id: null }, userData: TokenData) {
        return new Promise((res, rej) => {
            const sql: string = `SELECT * from article WHERE id = ${params.id}`
            connection.query(sql, (err, data) => {
                const articleData: ArticleDetails = (data && data[0]) || {}
                articleData.isEdit = false
                if (userData.data && userData.data.id) {
                    redisMode.readArticle({
                        id: params.id,
                        userId: userData.data.id
                    })
                    // 判断是否可以编辑
                    articleData.isEdit = articleData.userId === userData.data.id
                }
                redisMode.getArticleReadLength({
                    id: params.id,
                    userId: userData && userData.data && userData.data.id
                }).then(articleReadData => {
                    const resData = { ...articleData, ...articleReadData }
                    connection.query(`SELECT * FROM comment WHERE articleId=${params.id} ORDER BY createDate DESC`, (err, pinglunList) => {
                        resData.pinglunList = pinglunList || []
                        res({code: 0, data: resData})
                    })
                })
            }, rej)
        })
    },
    enditArticle (params: EditArticle = {
        markdown: '',
        title: '',
        tagId: null,
        articleImg: '',
        id: null
    }) {
        return new Promise((res, rej) => {
            params.markdown = utils.toLiteral(params.markdown)
            const sql = `UPDATE article SET title = '${params.title}', markdown = "${params.markdown}", tagId = '${params.tagId}', articleImg = '${params.articleImg}' WHERE id = '${params.id}'`
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
    seachArticle (params: SearchArticle = { query: '' }) {
        return new Promise((res, rej) => {
            const sql: string = `SELECT * FROM article a WHERE concat(a.markdown, a.title) like '%${params.query}%'`
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    tabTags (params: TabArticle = { tagId: null }) {
        return new Promise((res, rej) => {
            const tagId: number = params.tagId
            const sql: string = `SELECT * FROM article a, tags t WHERE '${tagId}'=t.id`
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    getTags () {
        return new Promise((res, rej) => {
            const sql: string = 'SELECT * FROM tags'
            connection.query(sql, (err, data) => {
                res({code: 0, data})
            }, rej)
        })
    },
    addArticleComment(params: AddArticleComment = {
        text: '',
        userName: '',
        userImage: '',
        articleId: '',
        userId: null
    }) {
        return new Promise((res, rej) => {
            const createDate: string = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            params.createDate = createDate
            params.text = utils.toLiteral(params.text)
            const sql: string = `INSERT INTO comment (userName, userId, userImage, articleId, text, createDate) VALUES('${params.userName}', '${params.userId}', '${params.userImage}', '${params.articleId}', '${params.text}', '${params.createDate}')`
            connection.query(sql, (err, data) => {
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res({code: 0, message: '评论成功', data: params})
                    } else {
                        rej({code: 0, message: '评论失败', data: count})
                    }
                })
            }, rej)
        })
    }
}
module.exports = articleModel