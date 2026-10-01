const fs = require('node:fs/promises')
const path = require('path')

const pathToFile = path.join(__dirname, '..', 'db.json')

async function readData() {
    const data = await fs.readFile(pathToFile, 'utf-8')
    return JSON.parse(data)
}

async function writeData(data) {
    await fs.writeFile(pathToFile, JSON.stringify(data, null, 2))
    return data
}

module.exports = {
    readData,
    writeData
}