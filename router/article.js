const express = require('express')
const fs = require('fs')
const router = express.Router()
const utils = require(__dirname + '/../utils/index.js')
router.put('/add/article', (req, res, next) => {
    const params = req.body
    const data = utils.verifyToken(params.token)
    res.send(data)
})


module.exports = router