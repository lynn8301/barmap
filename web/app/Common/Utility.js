class Utility {
  /**
   * Initial API Result
   */
  static initialApiResult() {
    let apiResult = {}
    apiResult.success = false
    apiResult.message = null
    return apiResult
  }

  /**
   * Check column
   * @param {Object} params key & value
   * @param {Array<String>} requireColumns
   */
  static checkRequired(params, requireColumns) {
    let check = {
      success: false,
      message: '',
    }
    for (let requireColumn of requireColumns) {
      if (undefined == params[requireColumns]) {
        check.message = `parameter: <${requireColumn}> is required`
        return check
      }
    }
    check['success'] = true
    return check
  }
}

module.exports = Utility
