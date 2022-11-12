const express = require('express');
const app = express()
const mongoose = require('mongoose');
const dotenv = require('dotenv');
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')
var Keygrip = require('keygrip')
app.set('trust proxy', 1)
const routers = require('./routers');
const autoCk = require('./controllers/autoCk');

const session = cookieSession({
    name: 'session',
    keys: ["aigidfhidfh","4567ytyj","rdtyhrfth"],
    maxAge: 2400 * 60 * 60 * 24,
    cookie: {
        httpOnly: true,
        secure: true
    }
})

app.use(session)
dotenv.config()
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to db'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.set("view engine", "ejs")
app.set("views", "./views")


routers(app)
const server = require('http').createServer(app);
server.listen(2903, () => console.log('Server Running on port 2903'));