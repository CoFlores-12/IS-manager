const express = require('express');
const app = express();
const register = require('./routes/registro')
const database = require('./modules/database');
const db = require('./routes/db')
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

require('dotenv').config()
app.use(sessions({
    secret: process.env.secret,
    saveUninitialized:true,
    resave: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/',express.static(__dirname + '/public'))

app.use('/register', register);
app.use('/db', db);

app.listen(process.env.NODE_PORT, async () => {
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});
