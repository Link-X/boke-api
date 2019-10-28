import pathCope = require('path')
const redisClientLine = require(pathCope.resolve(__dirname, '../db/redis.js'))
const connection = require(pathCope.resolve(__dirname, '../db/index.js'))
import schedule = require('node-schedule')

interface readeData {
    u_id: number | string,
    id?: number,
    a_id: number,
    status: number
}

module.exports = {
  synchronousArticleLove() {
      // 每天凌晨1点30 更新 redis 用户浏览文章数量 和点赞状况 到user_artical_tb数据库
    try {
      // 30 * * * * *
      // 30 1 1 * * *
        schedule.scheduleJob('30 1 1 * * *', function () {
            const getSql: string = 'SELECT id FROM article'
            connection.query(getSql, ((err, sqlData: Array<readeData>) => {
              const updateData: Array<readeData> = []
              new Promise((res, rej) => {
                  // 收集redis 的数据
                  sqlData.forEach((v, i) => {
                    redisClientLine.hgetall(v.id, (err, data) => {
                      if (err) {
                        console.error(err)
                        return
                      }
                      if (data) {
                          Object.keys(data).forEach(dataKey => {
                              updateData.push({
                                  u_id: dataKey,
                                  a_id: v.id,
                                  status: data[dataKey]
                              })
                          })
                      }
                      if (i === sqlData.length - 1) {
                          res(updateData)
                      }
                    })
                  })
              }).then((sqlData: Array<readeData>) => {
                  // 同步数据库
                  if (!sqlData || (sqlData && sqlData.length < 1)) {
                    return
                  }
                  sqlData.forEach(v => {
                      const sql: string = `SELECT * FROM user_artical_tb WHERE u_id=${v.u_id} AND a_id=${v.a_id}`
                      connection.query(sql, (err, dataarr) => {
                          const data: readeData = dataarr && dataarr[0]
                          if (!data) {
                              const setSql: string = `INSERT INTO user_artical_tb (u_id, a_id, status) VALUES (${v.u_id}, ${v.a_id}, ${v.status})`
                              // console.log('setsql');
                              connection.query(setSql, function (err, data) { 
                               })
                          } else if (data && data.a_id === Number(v.a_id) && data.u_id === Number(v.u_id) && data.status !== Number(v.status)) {
                              const update: string = `UPDATE user_artical_tb SET status = ${v.status} WHERE u_id=${v.u_id} AND a_id=${v.a_id}`
                              connection.query(update, function (err, data) { 
                              })
                          }
                      })
                  })
              })
            }), (err) => {
              console.error(err)
            })
          })
    } catch(err) {
        console.error(err)
    }
  }
}
