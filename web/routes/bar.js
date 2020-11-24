const express = require('express')
const router = express.Router()
const path = require('path')
const base = require(`${__dirname}/../../lib/base.js`)
const moment = require('moment')
const fs = require('fs')

// Upload File
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let des = `tmp/uploads/${file.fieldname}`
    base.checkPathAndMake(des)
    cb(null, des)
  },
  filename: function (req, file, cb) {
    let date = moment().format('X')
    let typeArray = file.originalname.split('.')
    let fileType = typeArray[typeArray.length - 1]

    cb(null, `${date}.${fileType}`)
  },
})
const fileFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(csv)$/)) {
    return cb(new Error('Please upload CSV'), false)
  }

  cb(null, true)
}

// Send File To Cloudinary
const cloudinary = require('cloudinary').v2
cloudinary.config(base.config().cloudinary)

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
  let db = base.mysqlPool(base.config().mysql)
  let params = req.body
  let barInfo = {
    name: params.name,
    address: params.address,
    phone: params.phone,
    lat: params.lat,
    lng: params.lng,
  }
  let existed = await db.queryAsync(
    'SELECT * FROM bar WHERE name = ?',
    barInfo.name,
  )
  if (existed == 0) {
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
router.post('/submitCSV', async(req, res) => {
  let upload = multer({storage, fileFilter: fileFilter}).single('barCSV')
  upload(req, res, async (err) => {
    let barInfo = {}
    if (err) {
      barInfo.error = '請上傳正確的檔案格式'
    } else {
      barInfo.success = '上傳成功'

      // Upload to cloudinary
      let filePath = req.file.path
      let fileName = req.file.filename
      cloudinary.uploader.upload(
        filePath,
        {public_id: `${fileName}`, folder: 'barCSV',resource_type: "auto"},
        async (err, result) => {
          if(err) res.send(err)
          try {
            let info = await base.insertBars(filePath)
            barInfo.existed = info
          } catch (e) {
            barInfo.error = '請再次檢查資料格式'
          }
          // remove file from server
          fs.unlinkSync(filePath)
        }
      )
    }
    let data = {
      title: 'BarMap',
      description: 'To explore the amazing bar',
      barInfo: barInfo,
    }
    res.render('bar/add', data)
  })
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
