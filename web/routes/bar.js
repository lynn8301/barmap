const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/add', (req, res) => {
  let data = {
    title: 'BarMap',
    description: 'To explore the amazing bar',
  }
  res.render('bar/add', data)
})

router.get('/bar-csv-sample-file', (req, res) => {
  let dir = path.join(`${__dirname}`, '..', 'views/bar/file')
  let file = `${dir}/BarSample.csv`
  res.download(file, 'BarSample.csv', (error) => {
    if (error) {
      console.log(error)
    }
  })
})

router.post('/check', (req, res) => {
  let params = req.body
  let data = {
    title: 'BarMap',
    description: 'To explore the amazing bar',
    name: params.name,
    address: params.address,
    phone: params.phone,
    lat: params.lat,
    lng: params.lng,
  }
  res.render('bar/check', data)
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
