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

// Router -> show
router.get('/show', async (req, res) => {
  let sess = req.session
  if (sess.login) {
    let params = {
      by: req.query.by,
      order: req.query.order,
      limit: req.query.limit,
      pageNum: req.query.pageNum,
    }
    let bars = await AppBar.readBarInfo(params)
    res.render('bar/show', bars)
  } else {
    res.redirect('../account/login')
  }
})

// Bar Info
router.get('/api/v1/bar', async (req, res) => {
  let data = await AppBar.getBarInfo()
  res.json(data)
})

// For Display
router.get('/api/v1/barRead', async (req, res) => {
  let params = {
    by: req.query.by,
    order: req.query.order,
    limit: req.query.limit,
    pageNum: req.query.pageNum,
  }
  let data = await AppBar.readBarInfo(params)
  res.json(data)
})

/**
 * Edit Bar Info
 * Router -> edit
 */
router.post('/edit', async (req, res) => {
  let params = req.body
  let result = await AppBar.editTable(params)
  res.json(result)
})

/**
 * Delete Bar Info
 * Router -> delete
 */
router.get('/delete?:id', async (req, res) => {
  let params = req.query
  let result = await AppBar.deleteTable(params)
  res.redirect('/bar/show')
})

router.get('/map', (req, res) => {
  res.render('bar/map')
})

module.exports = router
