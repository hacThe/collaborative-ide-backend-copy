const { createClient } = require('redis')
const { greenBright, redBright } = require('chalk')
const REDIS_EVENT = require('./utils/constants')

const redisClient = createClient()
// redis event handler
redisClient.on('error', () => console.log(redBright.bold('ERROR connecting to Redis')))

var createRoom = async (roomID) => {
    await redisClient.hSet(`${roomID}:info`, {
        created: moment(),
        updated: moment(),
    })
        .catch((err) => console.log(redBright.bold(`ERROR: ${err}`)))
}

module.exports.createRoomWithUser = createRoom
module.exports.redisClient = redisClient