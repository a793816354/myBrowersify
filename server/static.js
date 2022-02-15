const path = require("path")
const fs = require("fs")

const staticMimeSet = new Set(['html', 'css', 'js'])
const static = (req, res) => {
    let { url } = req
    //根路径调整为'/index.html'
    if (url === '/') url += 'index.html'

    const dir = '../dist'
    const filePath = path.join(__dirname, dir, url)
    const ext = path.extname(filePath).replace(/^./, '')

    // 是否符合静态文件列表,此处只判断html，css，js
    if (!staticMimeSet.has(ext)) return

    //可根据文件类型调整字符集或二进制流
    try {
        const file = fs.readFileSync(filePath)
        res.end(file)
    } catch (error) {
        res.statusCode = 404
        res.end()
    }
}

module.exports = {
    static
}