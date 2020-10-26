const express = require('express')
const path = require('path')
const app = express()

app.get('/hello', function (req, res) {
 return res.json({ text: 'aaaaaaaaaaaaaaaaaaaaa' })
});

app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))

app.listen(process.env.PORT || 8080)

console.log('Listening on port 8080!')
