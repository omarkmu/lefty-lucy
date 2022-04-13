// Authors: Omar Muhammad

const express = require('express')
const PORT = process.env.PORT ?? 8080

function runServer() {
    express()
        .use(express.static(`${__dirname}/public`))
        .get('/', (_, res) => res.sendFile(`${__dirname}/index.html`))
        .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
}

if (process.argv[2] === 'run') {
    runServer()
}

module.exports.runServer = runServer
