;(async () => {
  let express = require('express')
  let bodyParser = require('body-parser')
  let cookieParser = require('cookie-parser')
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

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.listen(port, () => {
    console.log(`Exapmle app listening at http://localhost:${port}`)
  })
})()
