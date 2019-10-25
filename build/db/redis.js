"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const osTwo = require("os");
const osSysType = osTwo.type();
const addree = osSysType === 'Linux' ? 'localhost' : '39.108.184.64';
const redis = require('redis');
const RedisClient = redis.createClient(6379, addree);
RedisClient.auth('React1010', function (err) {
    console.log(err);
});
RedisClient.on("error", function (err) {
    console.log("redisError " + err);
});
module.exports = RedisClient;
