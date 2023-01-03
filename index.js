const express = require('express');
const app = express();
const register = require('./routes/registro')
const database = require('./modules/database');
const db = require('./routes/db')

require('dotenv').config()


app.use('/register', register);
app.use('/db', db);

app.listen(process.env.NODE_PORT, async () => {
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});
