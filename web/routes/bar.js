const express = require('express')
const router = express.Router()
const path = require('path')
const base = require(`${__dirname}/../../lib/base.js`)
const multer  = require('multer')
const upload = multer({dest: 'uploads/'})

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
  let existed = await db.queryAsync("SELECT * FROM bar WHERE name = ?", barInfo.name)
  if(existed == 0) {
    await db.queryAsync('INSERT INTO bar SET ?', barInfo)
  } else {
    barInfo.error = '資料以存在'
  }
  await db.end()

  let data = {
    title: 'BarMap',
    description: 'To explore the amazing bar',
    barInfo: barInfo,
  }

  res.render('bar/add', data)
})

// 多筆資料
router.post('/submitCSV', upload.single('BarMultiple'), async(req, res) => {
  let file = req.file
  console.log(file)
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
