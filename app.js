var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { blueBright, greenBright, redBright } = require('chalk')
const { redisClient } = require('./redis_client')
require('dotenv').config()


var indexRouter = require('./routes/index');
var compilerRouter = require('./routes/compiler')

var app = express();
const server = http.createServer(app)
const io = new Server(server)

redisClient.connect()
    .then(() => console.log(greenBright.bold('CONNECTED to redis!')))
    .catch(() => {
        console.error(redBright.bold('ERROR connecting to Redis'))
    })

// middleware
app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/', indexRouter);
app.use('/compiler/execute', compilerRouter);

// socketio event handler
io.on('connection', (socket) => {
    socket.on('CODE_CHANGED', async (code) => {
        const { roomId, username } = await redisClient.hGetAll(socket.id)

        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit('CODE_CHANGED', code)
    })

    socket.on('DISSCONNECT_FROM_ROOM', async ({ roomId, username }) => console.log(blueBright.bold(`${username} disconnect from room ${roomId}`)))

    socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
        await redisClient.lPush(`${roomId}:users`, `${username}`)
        await redisClient.hSet(socket.id, { roomId, username })
        const users = await redisClient.lRange(`${roomId}:users`, 0, -1)
        const roomName = `ROOM:${roomId}`
        socket.join(roomName)
        io.in(roomName).emit('ROOM:CONNECTION', users)
    })

    socket.on('disconnect', async () => {
        // TODO if 2 users have the same name
        const { roomId, username } = await redisClient.hGetAll(socket.id)
        const users = await redisClient.lRange(`${roomId}:users`, 0, -1)
        const newUsers = users.filter((user) => username !== user)
        if (newUsers.length) {
            await redisClient.del(`${roomId}:users`)
            await redisClient.lPush(`${roomId}:users`, newUsers)
        } else {
            await redisClient.del(`${roomId}:users`)
        }
        const roomName = `ROOM:${roomId}`
        console.log({ newUsers })
        io.in(roomName).emit('ROOM:CONNECTION', newUsers)
    })
})

server.listen(3001, () => {
    console.log(greenBright.bold(`listening on *:${server.address().port}`))
})


module.exports = app;
