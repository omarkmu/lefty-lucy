// Authors: Omar Muhammad

const express = require('express')
const PORT = process.env.PORT ?? 8080

express()
  .use(express.static(`${__dirname}/public`))
  .get('/', (_, res) => res.sendFile(`${__dirname}/index.html`))
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
