const fs = require('fs')
const path = require('path')
var jwt = require('jsonwebtoken');
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'))
const isArray = (data) => {
    return Object.prototype.toString.call(data) === '[object Array]'
}

module.exports = {
    verifyToken(token) {
        let res = ''
        try {
            const result = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            })
            res = result
        } catch (err) {
            console.log(err)
        }
        return res
    },
    joinArray(key, data) {
        const retData = {
            ...data
        }
        if (!isArray(key)) {
            return retData
        }
        key.forEach(v => {
            if (!retData[v]) {
                retData[v] = null
            }
            if (isArray(retData[v])) {
                retData[v] = JSON.stringify(retData[v])
            }
        })
        return retData
    }
}