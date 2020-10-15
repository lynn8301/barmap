const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  let data = {
    title: 'BarMap',
    description: 'To explore the amazing bar',
  }
  res.render('index', data)
})

// router.get('/add', (req, res) => {
//     let data = {
//       title: 'BarMap',
//     }
//     res.render('/bar/addBar', data)
//   })

module.exports = router
