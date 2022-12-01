var express = require('express');
var router = express.Router();
const { redisClient } = require('../database/redis_client')
const moment = require('moment')
const { greenBright, redBright } = require('chalk')
const { v4 } = require('uuid')
const { PLClient } = require('../database/programming_language_client')

const plClient = new PLClient()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.end('CONNECTED')
});

/* POST create room with user */
router.post('/create-room-with-user', async (req, res) => {
  const roomId = v4()

  await redisClient.hSet(`${roomId}:roomInfo`, {
    "created": moment().toString(),
    "code": "",
  })
    .catch((err) => {
      console.log(redBright.bold(`create room info with ${err}`))
      res.status(500).send("Sorry! There are problems that we can't create room. Try again later")
      return
    })

  res.status(201).send({ roomId })
})

router.get('/find-room-with-id', async (req, res) => {
  const findRoomId = `${req.query['roomId']}:roomInfo`

  const findRoomResult = await redisClient.keys(findRoomId).catch((err) => {
    console.log(redBright.bold(`find room with ${err}`))
    res.status(404).send("Not found room")
    return
  })

  if (findRoomResult.length != 0) {
    console.log(greenBright.bold(`found rooms: ${findRoomResult}`))
    res.status(200).send({
      "foundRoomIds": req.query['roomId']
    })
  } else {
    console.log(redBright.bold(`Not found room`))
    res.status(404).send("Not found room")
  }
})

module.exports = router;
