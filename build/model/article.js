"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const path = require("path");
const connection = require(path.resolve(__dirname, '../db/index.js'));
const utils = require(path.resolve(__dirname, '../utils/index.js'));
const redisMode = require(path.resolve(__dirname, '../redis-model/index.js'));
const articleModel = {
    addArticle(params = {
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
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            params.createDate = createDate;
            const sqlData = Object.assign({}, params);
            sqlData.markdown = utils.toLiteral(sqlData.markdown);
            // sqlData.html = utils.toLiteral(sqlData.html)
            const sql = `INSERT INTO article (title, markdown, tagId, introduce, createDate, userName, userImage, articleImg, userId) VALUES ('${sqlData.title}', "${sqlData.markdown}", '${sqlData.tagId}', "${sqlData.introduce}", '${sqlData.createDate}', '${sqlData.userName}', '${sqlData.userImage}', '${sqlData.articleImg}', '${sqlData.userId || ''}')`;
            connection.query(sql, (err, data) => {
                res({ code: 0, data });
            }, rej);
        });
    },
    delArticle(params = {
        id: null,
        userName: '',
        userId: null
    }) {
        return new Promise((res, rej) => {
            const sql = `DELETE FROM article WHERE id=${params.id} AND userId=${params.userId}`;
            connection.query(sql, (err, data) => {
                res({ code: 0, data: { message: '删除成功' } });
            }, rej);
        });
    },
    loveArticle(params, userData) {
        return new Promise((res, rej) => {
            redisMode.loveArticle({ id: params.id, userId: userData.data.id }).then(data => {
                res({ code: 0, data });
            });
        });
    },
    getArticleList(params = { page: 0, pageSize: 10 }) {
        return new Promise((res, rej) => {
            const sql = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage,major,major2 FROM article ORDER BY createDate DESC LIMIT ${params.page * params.pageSize}, ${params.pageSize}`;
            connection.query(sql, (err, data) => {
                res({ code: 0, data: {
                        list: data
                    } });
            }, rej);
        });
    },
    getMajor() {
        const getMajorSql = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage FROM article where major=1`;
        const getMajorSql2 = `SELECT introduce,tagId,createDate,title,id,articleImg,userName,userImage FROM article where major2=1`;
        return new Promise((res, rej) => {
            connection.query(getMajorSql, (err, data) => {
                connection.query(getMajorSql2, (err, data2) => {
                    res({ code: 0, data: {
                            major: data,
                            major2: data2
                        } });
                }, rej);
            }, rej);
        });
    },
    getArticle(params = { id: null }, userData) {
        return new Promise((res, rej) => {
            const sql = `SELECT * from article WHERE id = ${params.id}`;
            connection.query(sql, (err, data) => {
                const articleData = (data && data[0]) || {};
                articleData.isEdit = false;
                if (userData.data && userData.data.id) {
                    redisMode.readArticle({
                        id: params.id,
                        userId: userData.data.id
                    });
                    // 判断是否可以编辑
                    articleData.isEdit = articleData.userId === userData.data.id;
                }
                redisMode.getArticleReadLength({
                    id: params.id,
                    userId: userData && userData.data && userData.data.id
                }).then(articleReadData => {
                    const resData = Object.assign(Object.assign({}, articleData), articleReadData);
                    connection.query(`SELECT * FROM comment WHERE articleId=${params.id} ORDER BY createDate DESC`, (err, pinglunList) => {
                        resData.pinglunList = pinglunList || [];
                        res({ code: 0, data: resData });
                    });
                });
            }, rej);
        });
    },
    enditArticle(params = {
        markdown: '',
        title: '',
        tagId: null,
        articleImg: '',
        id: null
    }) {
        return new Promise((res, rej) => {
            params.markdown = utils.toLiteral(params.markdown);
            const sql = `UPDATE article SET title = '${params.title}', markdown = "${params.markdown}", tagId = '${params.tagId}', articleImg = '${params.articleImg}' WHERE id = '${params.id}'`;
            connection.query(sql, (err, data) => {
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res({ code: 0, message: '修改成功', data });
                    }
                    else {
                        rej({ code: 0, message: '未修改', data: count });
                    }
                });
            }, rej);
        });
    },
    seachArticle(params = { query: '' }) {
        return new Promise((res, rej) => {
            const sql = `SELECT * FROM article a WHERE concat(a.markdown, a.title) like '%${params.query}%'`;
            connection.query(sql, (err, data) => {
                res({ code: 0, data });
            }, rej);
        });
    },
    tabTags(params = { tagId: null }) {
        return new Promise((res, rej) => {
            const tagId = params.tagId;
            const sql = `SELECT * FROM article a, tags t WHERE '${tagId}'=t.id`;
            connection.query(sql, (err, data) => {
                res({ code: 0, data });
            }, rej);
        });
    },
    getTags() {
        return new Promise((res, rej) => {
            const sql = 'SELECT * FROM tags';
            connection.query(sql, (err, data) => {
                res({ code: 0, data });
            }, rej);
        });
    },
    addArticleComment(params = {
        text: '',
        userName: '',
        userImage: '',
        articleId: '',
        userId: null
    }) {
        return new Promise((res, rej) => {
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            params.createDate = createDate;
            params.text = utils.toLiteral(params.text);
            const sql = `INSERT INTO comment (userName, userId, userImage, articleId, text, createDate) VALUES('${params.userName}', '${params.userId}', '${params.userImage}', '${params.articleId}', '${params.text}', '${params.createDate}')`;
            connection.query(sql, (err, data) => {
                connection.query('select row_count()', (err, count) => {
                    if (count[0]['row_count()'] > 0) {
                        res({ code: 0, message: '评论成功', data: params });
                    }
                    else {
                        rej({ code: 0, message: '评论失败', data: count });
                    }
                });
            }, rej);
        });
    }
};
module.exports = articleModel;
