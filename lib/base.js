const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql')
const config_temp = JSON.parse(fs.readfileSync(`${__dirname}/../config.json`))

function config() {
    return config_temp
}

function mysqlPool(mysqlConfig) {
    try {
        let db = Promise.promisifyAll(mysql.createPool(mysqlConfig))
        return db
    } catch(e) {
        throw new Error(e)
    }
}

module.exports = {
    config,
    mysqlPool
}