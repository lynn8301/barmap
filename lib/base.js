const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql')
const baseConfig = JSON.parse(fs.readFileSync(`${__dirname}/baseConfig.json`))

function config() {
  let config_temp
  if(process.env.NODE_ENV === 'production') {
    config_temp = process.env.CLEARDB_DATABASE_URL
  } else {
    let devConfig = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.json`),
    )
    config_temp = devConfig.development
  }
  return config_temp
}

function mysqlPool(mysqlConfig) {
  try {
    let db = Promise.promisifyAll(mysql.createPool(mysqlConfig))
    return db
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Check Path and Make
 * @return {string} File path
 */
function checkPathAndMake(dir) {
  dir = path.normalize(dir)
  let dics = dir.split(path.sep)
  let path_temp = ''
  for (let dic of dics) {
    try {
      if ('' == dic && dic == dics[dics.lenght - 1]) continue

      path_temp = `${path_temp}${dic}${path.sep}`
      if (false == fs.existsSync(path_temp)) {
        fs.mkdirSync(path_temp)
      } else {
        continue
      }
    } catch (e) {
      throw new Error(e)
    }
  }
  return dir
}

/**
 * Get Latest File
 * @param {*} dirPath
 * @param {*} regexp
 */
function getLatestFile(dirPath, regexp) {
  try {
    let latest = null
    let files = fs.readdirSync(dirPath)
    let one_matched = 0

    for (i = 0; i < files.length; i++) {
      let file = files[i]
      if (regexp.test(file) == false) {
        continue
      } else if (one_matched == 0) {
        latest = file
        one_matched = 1
        continue
      }

      let f1_time = fs.statSync(`${dirPath}/${file}`).mtime.getTime()
      let f2_time = fs.statSync(`${dirPath}/${latest}`).mtime.getTime()
      if (f1_time > f2_time) latest[i] = files[i]
    }
    if (latest != null) {
      let latestFile = path.join(dirPath, latest)
      return latestFile
    }
    return null
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

/**
 * Bar csv file transform to JSON
 * @param {*} row
 */
function Bar2Json(row) {
  try {
    let info = {}
    let barColRef = baseConfig.barColRef
    let cols = row.split(',')
    info.name = (cols[barColRef.name] || '').trim().replace(/"[\s\t\n]/g, '')
    info.address = (cols[barColRef.address] || '')
      .trim()
      .replace(/"[\s\t\n]/g, '')
    info.phone = (cols[barColRef.phone] || '').trim().replace(/"[\s\t\n]/g, '')
    info.lat = (cols[barColRef.lat] || '').trim().replace(/"[\s\t\n]/g, '')
    info.lng = (cols[barColRef.lng] || '').trim().replace(/"[\s\t\n]/g, '')

    return info
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Insert BARs
 * @param {*} dirPath
 * @return{*} existedBars Array
 */
async function insertBars(dirPath) {
  try {
    let rows
    let db = mysqlPool(config())
    let file = getLatestFile(dirPath, /\.(csv)$/)
    let datas = fs.readFileSync(file).toString()
    rows = datas.split('\n')
    rows.splice(0, 1)

    let existedBars = []
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i]
      if (row.length == 0) continue
      let data = Bar2Json(row)
      if (undefined == data) continue
      let existed = await db.queryAsync(
        'SELECT * FROM bar WHERE name = ?',
        data.name,
      )
      if (existed == 0) {
        await db.queryAsync('INSERT INTO bar SET ? ON DUPLICATE KEY UPDATE ?', [
          data,
          data,
        ])
      } else {
        existedBars.push(data.name)
      }
    }

    await db.end()

    return existedBars
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}
module.exports = {
  config,
  mysqlPool,
  checkPathAndMake,
  insertBars,
}
