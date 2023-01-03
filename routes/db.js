const express    =  require('express')
const app        = express()
const career = require('../models/careers')

app.get('/:nameCareer', async (req, res)=>{
    if (req.session.number === undefined) {
        res.redirect('/');
        return
    }
    const careerRes = await career.find({'name': req.params.nameCareer})
    if (careerRes.length == 0) {
        res.status(500).send('Not found for '+ req.params.nameCareer)
        return
    }
    res.send(careerRes[0]);
})

module.exports = app