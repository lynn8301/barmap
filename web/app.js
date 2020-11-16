;(async () => {
  let express = require('express')
  let bodyParser = require('body-parser')
  let cookieParser = require('cookie-parser')
  let path = require('path')
  let cors = require('cors')
  let app = express()
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(cookieParser())
  app.use(cors())

  // set poty to 3000 or the value set by environment var PORT
  app.set('port', (process.env.PORT || 3000))

  // set the view engine to ejs
  app.set('view engine', 'ejs')

  // include all folders
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))

  let barmap = require(`${__dirname}/routes/bar.js`)
  app.use('/barmap', barmap)

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
