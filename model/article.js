import moment from 'moment'
const path = require('path')
const connection = require(path.resolve(__dirname, '../db/index.js'))
const utils = require(path.resolve(__dirname, '../utils/index.js'))


module.exports = {
    addArticle (params = {}) {
        return new Promise((res, rej) => {
            const createDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            params.createDate = createDate
            const arr = ['title', 'content', 'html', 'markdown', 'tags', 'createDate']
            const sqlData = {...params}
            params = utils.joinArray(arr, params)
            const sql = `INSERT INTO article (title, content, html, markdown, tags, createDate) VALUES ('${sqlData.title}', '${sqlData.content}', '${sqlData.html}', '${sqlData.markdown}', '${sqlData.tags}', '${sqlData.createDate}')`
            console.log(sql);
            connection.query(sql, (err, data) => {
                if (err) {
                    rej({code: -1, message: 'sql出错', data: {}})
                    return
                }
                res({code: 0, data})
            })
        })
    }
}