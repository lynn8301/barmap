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

module.exports = router
