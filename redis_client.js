const { createClient } = require('redis')
const { greenBright, redBright } = require('chalk')
const REDIS_EVENT = require('./utils/constants')

const redisClient = createClient()
// redis event handler
redisClient.on(REDIS_EVENT.ERROR, () => console.log(redBright.bold('ERROR connecting to Redis')))

module.exports.redisClient = redisClient