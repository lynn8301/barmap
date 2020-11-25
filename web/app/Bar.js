const base = require(`${__dirname}/../../lib/base.js`)
const Utility = require(`${__dirname}/Common/Utility.js`)
class Bar {
  /**
   * Get Bar Info
   */
  static async getBarInfo() {
    let apiResult = Utility.initialApiResult()
    let db = base.mysqlPool(base.config().mysql)
    try {
      let results = await db.queryAsync('SELECT * FROM bar')
      apiResult.success = true
      apiResult.payload = results
    } catch (e) {
      apiResult.success = false
      apiResult.message = e.message
    }
    await db.end()
    return apiResult
  }
}

module.exports = Bar
