var express = require('express')
var router = express.Router()
const { redisClient } = require('../database/redis_client')
const { redBright } = require('chalk')

/* POST save code to Redis */
router.post('/', async (req, res) => {
    const roomId = req.body['roomId']
    const code = req.body['code']

    // save data to redis
    await redisClient.hSet(`${roomId}:roomInfo`, {
        "code": code
    }).catch((err) => {
        console.error(redBright.bold(`save code with ${err}`))
        return
    })

    res.status(201).send({ "message": "Code saved!" })
})

module.exports = router