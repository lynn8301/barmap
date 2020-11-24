const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const AppIndex = require(`${__dirname}/../app/Index.js`)

// Index
// router.get('/', (req, res) => {
//     let sess = req.session
//     sess.username
//     res.render('index/main', {title: "Main"})
// })
// router.get('/success', (req, res) => {
//     let sess = req.session
//     if(sess.email) {
//         console.log(sess)
//         return res.redirect('/')
//     }
//     res.send('Not Success')
// })
// router.post('/login', async (req, res) => {
//     let sess = req.session
//     sess.email = req.body.email
//     res.redirect('success')
// })


//For Login
router.get('/login', (req, res) => {
    res.render('index/login', {title: 'Login'})
})

router.post('/login', async(req, res) => {
    let params= req.body
    let userInfo = {
        username: params.userName,
        password: params.userPwd
    }
    let existed = await AppIndex.findUser(userInfo)
    existed = existed.payload
    if(existed == undefined) {
        res.send('使用者不存在')
        return
    }
    
    let checkPwd = await bcrypt.compare(userInfo.password, existed.password)
    if(existed.username != userInfo.username || !checkPwd) {
        res.send('使用者帳號或密碼錯誤')
    } else {
        let sess = req.session
        sess.username = userInfo.user
        let data = {
            title: 'Login Page',
            username: existed.username,
        }
        res.render('main', data)
    }
})

// For Signup
router.get('/signup', (req, res) => {
    res.render('index/signup', {title: 'Signup'})
})

router.post('/signup', async (req, res) => {
    let params = req.body    
    // Password using bcrypt
    if(params.userPwd != params.userRePwd) {
        res.send('密碼錯誤不同呦!')
    } else {
        let userPwd = bcrypt.hashSync(params.userPwd, 10)
        let userInfo = {
            username: params.userName,
            password: userPwd,
            first_name: params.firstName,
            last_name: params.lastName
        }
        let existed = await AppIndex.findUser(userInfo)
        if(existed.payload == undefined) {
            await AppIndex.saveUser(userInfo)
            let sess = req.session
            sess.username = userInfo.username    
            res.redirect('main')
        } else {
            res.send('帳號已存在')            
        }
    }
})

module.exports = router