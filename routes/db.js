const express    =  require('express')
const app        = express()
const career = require('../models/careers')

const cors       = require('cors')
app.use(cors())

app.post('/:nameCareer', async (req, res)=>{
    const careerRes = await career.find({'name': req.params.nameCareer})
    if (careerRes.length == 0) {
        res.status(500).send('Not found for '+ req.params.nameCareer)
        return
    }
    
    res.send(careerRes[0]);
})

module.exports = app