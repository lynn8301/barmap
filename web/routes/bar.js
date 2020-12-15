const express = require('express')
const router = express.Router()
const path = require('path')
const base = require(`${__dirname}/../../lib/base.js`)
const moment = require('moment')
const fs = require('fs')
const AppBar = require(`${__dirname}/../app/Bar.js`)

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

// Main Page
router.get('/add-singular', (req, res) => {
  let sess = req.session
  if (sess.login) {
    res.render('bar/addSingular')
  } else {
    res.redirect('../account/login')
  }
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
router.post('/submit-singular', async (req, res) => {
  let db = base.mysqlPool(base.config().mysql)
  let params = req.body
  let data = {
    name: params.name,
    address: params.address,
    phone: params.phone,
    lat: params.lat,
    lng: params.lng,
  }
  let existed = await db.queryAsync(
    'SELECT * FROM bar WHERE name = ?',
    data.name,
  )
  if (existed == 0) {
    await AppBar.insertBarInfo(data)
  } else {
    data.error = '資料以存在'
  }
  await db.end()

  res.render('bar/addSingular', data)
})

// 多筆資料
router.get('/add-multiple', (req, res) => {
  let sess = req.session
  if (sess.login) {
    res.render('bar/addMultiple')
  } else {
    res.redirect('../account/login')
  }
})

router.post('/submit-multiple', async (req, res) => {
  let upload = multer({storage, fileFilter: fileFilter}).single('barCSV')
  upload(req, res, async (err) => {
    let data = {}
    if (err) {
      data.error = '請上傳正確的檔案格式'
    } else {
      data.success = '上傳成功'

      // Upload to cloudinary
      let filePath = req.file.path
      let fileName = req.file.filename
      cloudinary.uploader.upload(
        filePath,
        {public_id: `${fileName}`, folder: 'barCSV', resource_type: 'auto'},
        async (err, result) => {
          if (err) res.send(err)
          try {
            let info = await base.insertBars(filePath)
            data.existed = info
          } catch (e) {
            data.error = '請再次檢查資料格式'
          }
          // remove file from server
          fs.unlinkSync(filePath)
        },
      )
    }
    res.render('bar/addMultiple', data)
  })
})

// Bar Info
router.get('/api/v1/bar', async (req, res) => {
  let data = await AppBar.getBarInfo()
  res.json(data)
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
