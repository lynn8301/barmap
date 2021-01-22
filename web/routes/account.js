const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const AppIndex = require(`${__dirname}/../app/Index.js`)

// For Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/')
    }
  })
})

// //For Login
router.get('/login', (req, res) => {
  let sess = req.session
  if (sess.login) {
    res.redirect('../bar/show')
  } else {
    res.render('account/login')
  }
})

router.post('/login', async (req, res) => {
  let params = req.body
  let userInfo = {
    username: params.userName,
    password: params.userPwd,
  }
  let existed = await AppIndex.findUser(userInfo)
  existed = existed.payload

  // If user does not exist, go to sign up page
  if (existed == undefined) {
    res.render('account/signup')
  } else {
    let checkPwd = await bcrypt.compare(userInfo.password, existed.password)
    if (existed.username != userInfo.username || !checkPwd) {
      let data = {
        isValid: false,
      }
      res.render('account/login', data)
    } else {
      let sess = req.session
      sess.login = true
      sess.username = userInfo.username
      res.redirect('../bar/show')
    }
  }
})

// For Signup
router.get('/signup', (req, res) => {
  res.render('account/signup')
})

router.post('/signup', async (req, res) => {
  let params = req.body
  // Password using bcrypt
  if (params.userPwd != params.userRePwd) {
    let data = {
      isNotValid: true,
    }
    res.render('account/signup', data)
  } else {
    let userPwd = bcrypt.hashSync(params.userPwd, 10)
    let userInfo = {
      username: params.userName,
      password: userPwd,
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
    }
    let existed = await AppIndex.findUser(userInfo)
    if (existed.payload == undefined) {
      await AppIndex.saveUser(userInfo)
      let sess = req.session
      sess.login = true
      sess.username = userInfo.username
      res.redirect('../bar/show')
    } else {
      let data = {
        username: userInfo.username,
        isExisted: true,
      }
      res.render('account/signup', data)
    }
  }
})

module.exports = router
