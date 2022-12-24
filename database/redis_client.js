const { createClient } = require('redis')
const { redBright } = require('chalk')
const REDIS_EVENT = require('../utils/constants')

const redisClient = createClient({
    url: 'redis://red-cejaj5la4991ihma51rg:6379'
})
// redis event handler
redisClient.on(REDIS_EVENT.ERROR, (e) => console.log(redBright.bold(`ERROR connecting to Redis ${e}`)))

module.exports.redisClient = redisClient
