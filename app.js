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
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit('CODE_CHANGED', code)
    })

    socket.on('DISSCONNECT_FROM_ROOM', async ({ roomId, username }) => console.log(blueBright.bold(`${username} disconnect from room ${roomId}`)))

    socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
        const userId = socket.id
        await redisClient.hSet(`${userId}:userInfo`, {
            "username": username,
            "roomId": roomId,
        })
            .catch((err) => {
                console.error(redBright.bold(`create user info with ${err}`))
                // TODO: handle error
                return
            })

        await redisClient.lPush(`${roomId}:users`, `${userId}`)
            .catch((err) => {
                console.error(redBright.bold(`add user to room with ${err}`))
                // TODO: handle error
                return
            })

        const users = await redisClient.lRange(`${roomId}:users`, 0, -1)
            .catch((err) => {
                console.error(redBright.bold(`get users with ${err}`))
                // TODO: handle error
                return
            })

        const roomName = `ROOM:${roomId}`
        socket.join(roomName)
        io.in(roomName).emit('ROOM:CONNECTION', users)

        // // get current code of roomName
        // const code = await redisClient.hGet(`${roomId}:roomInfo`, 'code')
        //     .catch((err) => {
        //         console.error(redBright.bold(`get code of room with ${err}`))
        //         // TODO: handle error
        //         return
        //     })
        // console.log(`id: ${userId} get code: ${code}`)
        // // emit event CODE_CHANGED to just connect user
        // if (code.length != 0) socket.emit("CODE_CHANGED", code)
    })

    socket.on('disconnect', async () => {
        const userId = socket.id
        const userInfo = await redisClient.hGetAll(`${userId}:userInfo`).catch((err) => {
            console.error(redBright.bold(`get disconnect user with ${err}`))
            // TODO: handle error
            return
        })
        const roomId = userInfo['roomId']

        await redisClient.del(`${userId}:userInfo`).catch((err) => {
            console.error(redBright.bold(`delete user info with ${err}`))
            // TODO: handle error
            return
        })
        await redisClient.lRem(`${roomId}:users`, 0, userId).catch((err) => {
            console.error(redBright.bold(`remove user from room with ${err}`))
            // TODO: handle error
            return
        })

        const remainUsers = await redisClient.lRange(`${roomId}:users`, 0, -1).catch((err) => {
            console.error(redBright.bold(`get remain users with ${err}`))
            // TODO: handle error
            return
        })

        if (remainUsers.length != 0) {
            const roomName = `ROOM:${roomId}`
            io.in(roomName).emit('ROOM:CONNECTION', remainUsers)
        }
        else {
            // consider remove room
        }
    })
})

server.listen(3001, () => {
    console.log(greenBright.bold(`listening on *:${server.address().port}`))
})


module.exports = app;
