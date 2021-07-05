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
  let redisClient = redis.createClient(base.config().redis)
  let hour = 3600000
  let week = hour * 24 * 7
  let sess = {
    secret: base.config().session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: new Date(Date.now() + week),
      maxAge: week
    }, 
    store: new RedisStore({client: redisClient}),
    name: '_redisDemo',
  }
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sess.cookie.secure = true
    sess.name = 'bamap'
  }
  app.use(session(sess))

  // set poty to 3000 or the value set by environment var PORT
  app.set('port', process.env.PORT || 3000)
  app.set('host', process.env.HOST || "localhost")

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
    res.render('index')
  })

  app.listen(app.get('port'), () => {
    console.log(`App listening at http://${app.get('host')}:${app.get('port')}`)
  })
})()
