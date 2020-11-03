const express = require('express')
const router = express.Router()
const path = require('path')
const base = require(`${__dirname}/../../lib/base.js`)

router.get('/add', (req, res) => {
  let data = {
    title: 'BarMap',
    description: 'To explore the amazing bar',
  }
  res.render('bar/add', data)
})

// Bar CSV Sample
router.get('/bar-csv-sample-file', (req, res) => {
  let dir = path.join(`${__dirname}`, '..', 'views/bar/file')
  let file = `${dir}/BarSample.csv`
  res.download(file, 'BarSample.csv', (error) => {
    if (error) {
      console.log(error)
    }
  })
})

// 單筆資料
router.post('/submit', async (req, res) => {
  let db = base.mysqlPool(base.config().development)
  let params = req.body
  let barInfo = {
    name: params.name,
    address: params.address,
    phone: params.phone,
    lat: params.lat,
    lng: params.lng,
  }

  await db.queryAsync('INSERT INTO bar SET ?', barInfo)
  await db.end()

  let message = `You sent the data as the following\n
  Name: ${barInfo.name}\n
  Address: ${barInfo.address}\n
  Phone: ${barInfo.phone}\n
  Lat: ${barInfo.lat}\n
  Lng: ${barInfo.lng}`
  
  res.write(message)
  res.end()
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
