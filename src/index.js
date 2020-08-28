const express = require('express')
const app = express()
const port = 3000

// User interface where users will be prompted to login and then autorize the app
app.get('/authorize', (req, res) => {
  res.send('Hello, World!')
})

// The URL Discord will redirect users to after they login
app.get('/callback', (req, res) => {
  res.send('ok')
})

// Token Introspection Endpoint (RFC 7662 https://tools.ietf.org/html/rfc7662)
app.get('/token_information', (req, res) => {
  res.send('ok')
})

// Authorization Server Metadata Endpoint (RFC 8414 https://tools.ietf.org/html/rfc8414)
// This can contain a signed_metadata field containing the same information but signed as a JSON Web Token (See Section 2.1 of RFC 8114)
app.get('/server_metadata', (req, res) => {
  res.json({
    hello: 'world'
  })
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})