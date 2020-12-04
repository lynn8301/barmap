;(async () => {
  let express = require('express')
  let bodyParser = require('body-parser')
  let cookieParser = require('cookie-parser')
  let path = require('path')
  let cors = require('cors')
  let session = require('express-session')
  let redis = require('redis')
  let RedisStore = require('connect-redis')(session)
  let base = require(`${__dirname}/../lib/base.js`)
  let app = express()
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(cookieParser())
  app.use(cors())

  // Session setting
  let redisClient = await redis.createClient(base.config().redis)
  let sess = {
    secret: base.config().session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60 * 60 * 24 * 7}, // one week
    store: new RedisStore({client: redisClient}),
    name: '_redisDemo',
  }
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sess.cookie.secure = true
  }
  app.use(session(sess))

  // set poty to 3000 or the value set by environment var PORT
  app.set('port', process.env.PORT || 3000)

  // set the view engine to ejs
  app.set('view engine', 'ejs')

  // include all folders
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))

  // Account Router
  let account = require(`${__dirname}/routes/account.js`)
  app.use('/account', account)

  // Bar Router
  let bar = require(`${__dirname}/routes/bar.js`)
  app.use('/bar', bar)

  // Set index page
  app.get('/', (req, res) => {
    let data = {
      title: 'BarMap',
      description: 'To explore the amazing bar',
    }
    res.render('index', data)
  })

  app.listen(app.get('port'), () => {
    console.log(`Exapmle app listening at http://localhost:${app.get('port')}`)
  })
})()
