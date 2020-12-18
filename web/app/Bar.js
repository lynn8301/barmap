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

  /**
   * Insert Bar Info
   * @data {*} params
   */
  static async insertBarInfo(data) {
    let apiResult = Utility.initialApiResult()
    let db = base.mysqlPool(base.config().mysql)
    try {
      let results = await db.queryAsync('INSERT INTO bar SET ?', data)
      apiResult.success = true
      apiResult.payload = results
    } catch (e) {
      apiResult.success = false
      apiResult.message = e.message
    }
    await db.end()
    return apiResult
  }

  /**
   * Read Bar Info
   */
  static async readBarInfo(
    params,
    by = 'id',
    order = 'ASC',
    limit = 10,
    pageNum = 1,
  ) {
    let apiResult = Utility.initialApiResult()
    let db = base.mysqlPool(base.config().mysql)
    try {
      // Setting Query
      let sort = ''
      if (undefined != params.by) by = params.by
      if (undefined != params.order) order = params.order
      sort = `ORDER BY ${by} ${order}`

      let offset = ''
      if (undefined != params.limit) limit = params.limit
      if (undefined != params.pageNum) pageNum = params.pageNum
      offset = `LIMIT ${limit} OFFSET ${
        parseInt(limit) * (parseInt(pageNum) - 1)
      }`

      let results = await db.queryAsync(`SELECT * FROM bar ${sort} ${offset}`)
      apiResult.success = true
      apiResult.limit = limit
      apiResult.pageNum = pageNum
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
