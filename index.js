const express = require('express');
const app = express();
require('dotenv').config()

app.get('/', (req, res) => {
    res.send("init IS-manager")
});

app.listen(process.env.NODE_PORT, () => {
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});