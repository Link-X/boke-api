const fs = require('fs')
const path = require('path')
var jwt = require('jsonwebtoken');
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'))
module.exports = {
    verifyToken(token) {
        let res = ''
        try {
            const result = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            })
            res = result
        } catch (err) {
            console.log(e)
        }
        return res
    }
}