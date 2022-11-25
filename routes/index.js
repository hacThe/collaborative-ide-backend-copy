var express = require('express');
var router = express.Router();
const { redisClient } = require('../redis_client')
const moment = require('moment')
const { greenBright, redBright } = require('chalk')
const { v4 } = require('uuid')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.end('CONNECTED')
});

/* POST create room with user */
router.post('/create-room-with-user', async (req, res) => {
  const roomId = v4()

  await redisClient.hSet(`${roomId}:roomInfo`, {
    "created": moment().toString(),
    "code": ""
  })
    .catch((err) => {
      console.log(redBright.bold(`create room info with ${err}`))
      return
    })

  res.status(201).send({ roomId })
})

module.exports = router;
