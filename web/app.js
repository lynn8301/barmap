;(async () => {
  let express = require('express')
  let bodyParser = require('body-parser')
  let cookieParser = require('cookie-parser')
  let router = express.Router()
  let path = require('path')
  let cors = require('cors')
  let app = express()
  let port = 3000
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(cookieParser())
  app.use(cors())
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

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

  app.listen(port, () => {
    console.log(`Exapmle app listening at http://localhost:${port}`)
  })
})()
