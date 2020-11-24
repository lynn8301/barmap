const base = require(`${__dirname}/../../lib/base.js`)
const Utility = require(`${__dirname}/Common/Utility.js`)

class Index {
  /**
   * Store user info into DB
   * @param {*} userInfo JSON
   */
  static async saveUser(userInfo) {
    let apiResult = Utility.initialApiResult()
    let db = base.mysqlPool(base.config().mysql)
    try {
      let results = await db.queryAsync('INSERT INTO users SET ?', userInfo)
      apiResult.success = true
      apiResult.payload = results[0]
    } catch (e) {
      apiResult.success = false
      apiResult.message = e.message
    }
    await db.end()
    return apiResult
  }
  /**
   * Find User Info
   * @param {*} userInfo JSON
   */
  static async findUser(userInfo) {
    let apiResult = Utility.initialApiResult()
    let db = base.mysqlPool(base.config().mysql)
    try {
      let results = await db.queryAsync(
        'SELECT * FROM users WHERE username = ?',
        userInfo.username,
      )
      apiResult.success = true
      apiResult.payload = results[0]
    } catch (e) {
      apiResult.success = false
      apiResult.message = e.message
    }
    await db.end()
    return apiResult
  }
}

module.exports = Index
