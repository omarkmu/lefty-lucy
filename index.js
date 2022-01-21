const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (_, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(8080, () => {
  console.log('Listening on http://localhost:8080');
});
