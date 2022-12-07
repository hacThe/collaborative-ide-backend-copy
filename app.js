var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { greenBright, redBright } = require('chalk')
const { redisClient } = require('./database/redis_client')
require('dotenv').config()


var indexRouter = require('./routes/index');
var compilerRouter = require('./routes/compiler')
var saveCodeRouter = require('./routes/save-data')

var app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

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
require('./socketController')(io, redisClient)

server.listen(3001, () => {
    console.log(greenBright.bold(`listening on *:${server.address().port}`))
})


module.exports = app;
