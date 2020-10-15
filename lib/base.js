const fs = require('fs')
const path = require('path')
const config_temp = JSON.parse(fs.readfileSync(`${__dirname}/../config.json`))

function config() {
    return config_temp
}

module.exports = {
    config
}