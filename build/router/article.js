"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const path = require("path");
const fs = require("fs");
const markdown = require("markdown").markdown;
const utils = require(path.resolve(__dirname, '../utils/index.js'));
const articleModel = require(path.resolve(__dirname, '../model/article.js'));
const verify = require(path.resolve(__dirname, '../utils/verify.js'));
const verifyFunc = new verify({}, {});
const router = Express.Router();
router.put('/add/article', (req, res, next) => {
    const params = req.body;
    verifyFunc.$init(params, {
        title: [{
                required: true,
                message: '标题不能小于1大于30',
                type: 'string',
                min: 1,
                max: 35
            }],
        markdown: [{
                required: true,
                message: '请输入内容',
                type: 'string',
                min: 1,
                max: 999999999
            }],
        tagId: [{
                required: true,
                message: '请选择标签',
                type: 'number',
                validator: function (val, cb) {
                    if (!val && val !== 0) {
                        cb(new Error());
                    }
                    else {
                        cb();
                    }
                }
            }]
    });
    verifyFunc.validate(status => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        try {
            params.html = markdown.toHTML(params.markdown);
            params.introduce = params.html.replace(/<(?:.|\s)*?>/g, "").substring(0, 630);
            const userData = utils.verifyToken(req.headers.token);
            params.userName = userData.data.userName;
            params.userId = userData.data.id;
            params.userImage = userData.data.userImage;
        }
        catch (err) {
            res.send({
                code: -1,
                message: "解析不了"
            });
            return;
        }
        articleModel.addArticle(params).then((data) => {
            res.send({
                code: 0,
                data
            });
        }).catch((err) => {
            res.send(err);
        });
    });
});
router.get('/get/article/list', (req, res, next) => {
    const params = Object.assign({ page: 1, pageSize: 10 }, req.query);
    articleModel.getArticleList(params).then(data => {
        res.send(data);
    }).catch(err => {
        res.send(err);
    });
});
router.post('/del/article', (req, res, next) => {
    const params = req.body;
    verifyFunc.$init(params, {
        id: [{
                required: true,
                message: '请选择要删除的文章',
                min: 1,
                max: 1000
            }]
    });
    verifyFunc.validate(status => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        const userData = utils.verifyToken(req.headers.token);
        params.userName = userData.data.userName;
        params.userId = userData.data.id;
        articleModel.delArticle(params).then(data => {
            res.send({
                code: 0,
                data
            });
        }).catch(err => {
            res.send(err);
        });
    });
});
router.get('/get/article/major', (req, res, next) => {
    articleModel.getMajor().then(data => {
        res.send(data);
    }).catch(err => {
        res.send(err);
    });
});
router.get('/get/article/details', (req, res, next) => {
    const params = req.query;
    params.id = Number(params.id);
    verifyFunc.$init(params, {
        id: [{
                required: true,
                message: '请选择需要查看的文章',
                type: "Number"
            }]
    });
    let userData;
    if (req && req.headers && req.headers.token) {
        userData = utils.verifyToken(req.headers.token);
    }
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        articleModel.getArticle(params, userData || {
            iss: '',
            name: '',
            admin: false,
            userName: '',
            password: '',
            data: {
                id: null,
                userName: '',
                password: '',
                create: '',
            },
        }).then(data => {
            res.send(data);
        }).catch(err => {
            res.send(err);
        });
    });
});
router.post('/love/article', (req, res, next) => {
    const params = req.body;
    const userData = (req.headers && req.headers.token && utils.verifyToken(req.headers.token));
    verifyFunc.$init(params, {
        id: [{
                required: true,
                message: '请输入文章id',
                type: "Number"
            }]
    });
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        articleModel.loveArticle(params, userData).then(data => {
            res.send(data);
        }).catch(err => {
            res.send(err);
        });
    });
});
router.post('/endit/article', (req, res, next) => {
    const params = req.body;
    verifyFunc.$init(params, {
        id: [{
                required: true,
                message: '请输入文章id',
                type: 'Number',
                min: 1,
                max: 9999
            }],
        title: [{
                required: true,
                message: '标题不能小于1大于30',
                type: 'string',
                min: 1,
                max: 35
            }],
        markdown: [{
                required: true,
                message: '请输入内容',
                type: 'string',
                min: 1,
                max: 999999999
            }]
    });
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        // const html = markdown.toHTML(params.markdown)
        // params.html = html
        articleModel.enditArticle(params).then(data => {
            res.send(data);
        }).catch(err => {
            res.send(err);
        });
    });
});
router.get('/seach/article', (req, res, next) => {
    const params = req.query;
    verifyFunc.$init(params, {
        query: [{
                required: true,
                message: '请输入需要搜索的内容',
                type: 'string',
                min: 1,
                max: 35
            }]
    });
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        articleModel.seachArticle(params).then(data => {
            let result = [];
            res.send({ code: data.code, data: data.data });
        }).catch(err => {
            res.send(err);
        });
    });
});
router.get('/tab/tags', (req, res, next) => {
    const params = req.query;
    verifyFunc.$init(params, {
        tagId: [{
                required: true,
                message: '请选择搜索的类型',
                type: 'string',
                min: 1,
                max: 35
            }]
    });
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        articleModel.tabTags(params).then(data => {
            res.send({ code: data.code, data: data.data });
        }).catch(err => {
            res.send(err);
        });
    });
});
router.get('/get/tags', (req, res, next) => {
    const params = req.query;
    articleModel.getTags().then(data => {
        res.send({ code: data.code, data: data.data });
    }).catch(err => {
        res.send(err);
    });
});
router.post('/upload-image', (req, res, next) => {
    const file = req.body.file;
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = new Buffer(base64Data, 'base64');
    const randomStr = Math.random().toString().split('.')[1] + Date.now() + '.jpg';
    const pathHref = '../www/image/' + randomStr;
    fs.writeFile(path.resolve(__dirname, pathHref), dataBuffer, function (err) {
        const ip = utils.getIp();
        if (err) {
            res.send({ code: -1, message: '上传失败' });
            return;
        }
        res.json({ code: 0, data: { path: `http://${ip}/image/${randomStr}` }, message: '图片上传成功' });
    });
});
router.post('/add/article-comment', (req, res, next) => {
    const params = req.body;
    verifyFunc.$init(params, {
        text: [{
                required: true,
                message: '请输入评论内容，最少5个字符',
                type: 'string',
                min: 5,
                max: 9999999
            }]
    });
    verifyFunc.validate((status) => {
        if (status.result) {
            res.send({
                code: -1,
                message: status.message,
                data: {}
            });
            return;
        }
        const userData = (req.headers && req.headers.token && utils.verifyToken(req.headers.token));
        params.userId = userData.data.id;
        params.userName = userData.data.userName;
        params.userImage = userData.data.userImage;
        articleModel.addArticleComment(params).then(data => {
            res.send(data);
        }).catch(err => {
            res.send(err);
        });
    });
});
module.exports = router;
