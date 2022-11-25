var express = require('express')
var router = express.Router()
const { redisClient } = require('../redis_client')

/* POST save code to Redis */
router.post('/', async (req, res) => {
    const roomId = req.body['roomId']
    const code = req.body['code']

    // save data to redis
})

module.exports = router