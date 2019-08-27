const os = require('os')
const sysType = os.type()
const addree = sysType === 'Linux' ? 'localhost' : '39.108.184.64'

const redis = require('redis')
const redisClient = redis.createClient(6379, addree)
redisClient.auth('React1010', function (err) { 
    console.log(err)
})
redisClient.on("error", function (err) {
    console.log("redisError " + err)
})

module.exports = redisClient