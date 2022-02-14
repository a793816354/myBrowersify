const http = require("http")
const colors = require('colors-console')
const { static } = require('./server/static.js')

const server = http.createServer((req, res) => {
    static(req, res)
});

const port = 8000
server.listen(port, () => {
    console.log('App running at: ', colors(['blue', 'underline'], `http://localhost:${port}/`))
});
