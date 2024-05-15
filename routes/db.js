const express    =  require('express')
const app        = express()
const career = require('../models/careers')

app.post('/:nameCareer', async (req, res)=>{
    const careerRes = await career.find({'name': req.params.nameCareer})
    if (careerRes.length == 0) {
        res.status(500).send('Not found for '+ req.params.nameCareer)
        return
    }
    res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', 'https://is-manager-astro.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
    res.send(careerRes[0]);
})

module.exports = app