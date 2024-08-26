const express    =  require('express')
const app        = express()
const career = require('../models/careers')

const cors       = require('cors')
const corsOptions = {
    origin: 'https://is-manager-astro.vercel.app',
    optionsSuccessStatus: 200,
    credentials: true,
  };
  app.use(cors(corsOptions));

app.post('/:nameCareer', async (req, res)=>{
    const careerRes = await career.find({'name': req.params.nameCareer})
    if (careerRes.length == 0) {
        res.status(500).send('Not found for '+ req.params.nameCareer)
        return
    }
    
    res.send(careerRes[0]);
})

module.exports = app