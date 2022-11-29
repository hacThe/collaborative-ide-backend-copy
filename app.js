var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { blueBright, greenBright, redBright } = require('chalk')
const { redisClient } = require('./redis_client')
require('dotenv').config()
const SOCKET_IO_EVENT = require('./utils/constants')


var indexRouter = require('./routes/index');
var compilerRouter = require('./routes/compiler')
var saveCodeRouter = require('./routes/save-data')

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
app.use('/compiler', compilerRouter);
app.use('/data/save', saveCodeRouter)

// socketio event handler
io.on(SOCKET_IO_EVENT.CONNECTION, (socket) => {
    socket.on(SOCKET_IO_EVENT.CODE_INSERT, async (data) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.CODE_INSERT, data);
    })

    socket.on(SOCKET_IO_EVENT.CODE_REPLACE, async (data) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.CODE_REPLACE, data);
    })

    socket.on(SOCKET_IO_EVENT.CODE_DELETE, async (data) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.CODE_DELETE, data);
    })

    socket.on(SOCKET_IO_EVENT.OUTPUT_CHANGED, async (output) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.OUTPUT_CHANGED, output);
    })

    socket.on(SOCKET_IO_EVENT.CURSOR_CHANGED, async (cursorData) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.CURSOR_CHANGED, cursorData);
    })

    socket.on(SOCKET_IO_EVENT.SELECTION_CHANGED, async (selectionData) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', userId)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.SELECTION_CHANGED, selectionData);
    })

    socket.on(SOCKET_IO_EVENT.CODE_CHANGED, async (code) => {
        const userId = socket.id
        const user_info = await redisClient.hGetAll(`${userId}:userInfo`)
            .catch((err) => {
                console.error(redBright.bold(`get user info with ${err}`))
                // TODO: handle error
                handleError('Can\'t get user information', socket.id)
                return
            })
        const roomId = user_info['roomId']
        const roomName = `ROOM:${roomId}`
        socket.to(roomName).emit(SOCKET_IO_EVENT.CODE_CHANGED, code)
    })

    socket.on('DISSCONNECT_FROM_ROOM', async ({ roomId, username }) => console.log(blueBright.bold(`${username} disconnect from room ${roomId}`)))

    socket.on(SOCKET_IO_EVENT.CONNECTED_TO_ROOM, async ({ roomId, username }) => {
        const userId = socket.id
        // create user info
        await redisClient.hSet(`${userId}:userInfo`, {
            "username": username,
            "roomId": roomId,
        }).catch((err) => {
            console.error(redBright.bold(`create user info with ${err}`))
            // TODO: handle error
            handleError('Can\'t create new user information', userId)
            return
        })

        // add user to room
        await redisClient.lPush(`${roomId}:users`, `${userId}`)
            .catch((err) => {
                console.error(redBright.bold(`add user to room with ${err}`))
                // TODO: handle error
                handleError('Can\'t add user to room', userId)
                return
            })

        // get current connected to room users
        const users = await redisClient.lRange(`${roomId}:users`, 0, -1)
            .catch((err) => {
                console.error(redBright.bold(`get users with ${err}`))
                // TODO: handle error
                handleError('Can\'t get information of users in roon', userId)
                return
            })

        // get user info (id, username) by ids
        const userIds = users.map((ids) => `${ids}:userInfo`)

        const userInfors = await Promise.all(userIds.map(async (id, index) => {
            userIn4 = await redisClient.hGetAll(id)
                .catch((err) => {
                    console.error(redBright.bold(`get users with ${err}`))
                    // TODO: handle error
                    return
                })

            if (userIn4 != null) {
                userIn4['id'] = users[index]
                return userIn4
            }
        }))

        const roomName = `ROOM:${roomId}`
        socket.join(roomName)
        io.in(roomName).emit(SOCKET_IO_EVENT.ROOM_CONNECTION, {
            'users': userInfors,
            'newUserId': socket.id
        })

        // get current code of roomName
        const code = await redisClient.hGet(`${roomId}:roomInfo`, 'code')
            .catch((err) => {
                console.error(redBright.bold(`get code of room with ${err}`))
                // TODO: handle error
                handleError('Can\'t get room information', userId)
                return
            })
        // emit event CODE_CHANGED to just connect user
        io.to(userId).emit(SOCKET_IO_EVENT.CODE_CHANGED, code)
    })

    socket.on(SOCKET_IO_EVENT.DISCONNECT, async () => {
        const userId = socket.id
        // get disconnecting user info
        const userInfo = await redisClient.hGetAll(`${userId}:userInfo`).catch((err) => {
            console.error(redBright.bold(`get disconnect user with ${err}`))
            // TODO: handle error
            handleError('Can\'t get user information', userId)
            return
        })
        const roomId = userInfo['roomId']

        // delete user info
        await redisClient.del(`${userId}:userInfo`).catch((err) => {
            console.error(redBright.bold(`delete user info with ${err}`))
            // TODO: handle error
            handleError('Can\'t delete user', userId)
            return
        })

        // remove user from room
        await redisClient.lRem(`${roomId}:users`, 0, userId).catch((err) => {
            console.error(redBright.bold(`remove user from room with ${err}`))
            // TODO: handle error
            handleError('Can\'t remove user from room', userId)
            return
        })

        const remainUsers = await redisClient.lRange(`${roomId}:users`, 0, -1).catch((err) => {
            console.error(redBright.bold(`get remain users with ${err}`))
            // TODO: handle error
            handleError('Can\'t get information of user in room', userId)
            return
        })

        if (remainUsers.length != 0) {
            const roomName = `ROOM:${roomId}`
            io.in(roomName).emit(SOCKET_IO_EVENT.ROOM_DISCONNECT, socket.id)
        }
        else {
            // delete user list in a room
            await redisClient.del(`${roomId}:users`).catch((err) => {
                console.error(redBright.bold(`delete user list in room with ${err}`))
                // TODO: handle error
                handleError('Can\'t delete room\s user list', userId)
                return
            })

            // delete room info
            await redisClient.del(`${roomId}:roomInfo`).catch((err) => {
                console.error(redBright.bold(`delete roomInfo with ${err}`))
                // TODO: handle error
                handleError('Can\'t delete room', userId)
                return
            })
        }
    })
})

const handleError = (message, socketId) => {
    io.to(socketId).emit(SOCKET_IO_EVENT.DB_ERROR, message)
}

server.listen(3001, () => {
    console.log(greenBright.bold(`listening on *:${server.address().port}`))
})


module.exports = app;
