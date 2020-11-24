const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql')
const baseConfig = JSON.parse(fs.readFileSync(`${__dirname}/baseConfig.json`))

function config() {
  let config_temp
  if(process.env.NODE_ENV === 'production') {
    let prodConfig = require(`${__dirname}/../config/config.js`)
    config_temp = prodConfig
  } else {
    let devConfig = JSON.parse(fs.readFileSync(`${__dirname}/../config/config.json`))
    config_temp = devConfig
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
 * @param {*} filePath
 * @return{*} existedBars Array
 */
async function insertBars(filePath) {
  try {
    let rows
    let db = mysqlPool(config().mysql)
    let datas = fs.readFileSync(filePath).toString()
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
    throw new Error(e)
  }
}
module.exports = {
  config,
  mysqlPool,
  checkPathAndMake,
  insertBars,
}
