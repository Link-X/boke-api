const express = require('express')
const path = require('path')
const utils = require(path.resolve(__dirname, '../utils/index.js'))

const router = express.Router()
router.put('/add/article', (req, res, next) => {
    const params = req.body
    const data = utils.verifyToken(params.token)
    res.send(data)
})


module.exports = router