const path = require('path')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true })
const cryptoRandomString = require('crypto-random-string')

const DiscordAPI = require('./DiscordAPI')
const discord = new DiscordAPI()

const base64url = require('base64url')

let database

client.connect().then(() => {
  database = client.db('id')
  console.log('Connected to the database')
  app.listen(process.env.PORT || 8080)
  console.log('Listening on port 8080!')
})

app.use(cookieParser())
app.use(bodyParser.json())

const application = {
  image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png',
  name: 'Alexa',
  verified: true
}

app.use(async (req, res, next) => {
  if (!req.cookies['session']) return next()
  const sessionResponse = await database.collection('sessions').findOne({ _id: req.cookies['session'] })
  if (!sessionResponse) return next()
  if (sessionResponse.user_agent !== req.get('User-Agent')) return next()
  const accessTokenResponse = await database.collection('discord_access_tokens').findOne({ _id: sessionResponse.user_id })
  req.session = sessionResponse
  req.discordAccessToken = accessTokenResponse
  const user = await discord.getUser(accessTokenResponse.access_token)
  req.user = user
  next()
})

app.get('/', (req, res) => {
  res.redirect('/login')
})

app.get('/api/login', (req, res) => {
  res.json({
    application,
    login_url: discord.getAuthorizeUrl()
  })
})

app.get('/api/callback', async (req, res) => {
  let redirectPath = '/authorize'

  if (req.query.state) {
    const decoded = JSON.parse(base64url.decode(req.query.state))
    if (decoded.redirect_to) {
        redirectPath = decoded.redirect_to
    } else {
      return res.status(500).send('Bad request, invalid state!')
    }
  }

  const response = await discord.exchangeCode(req.query.code)
  const user = await discord.getUser(response.access_token)
  const sessionId = cryptoRandomString({ length: 64, type: 'alphanumeric' })
  database.collection('sessions').insertOne({
    _id: sessionId,
    user_id: user.id,
    user_agent: req.get('User-Agent')
  })
  database.collection('discord_access_tokens').updateOne({
    _id: user.id
  }, {
    $set: {
      access_token: response.access_token,
      refresh_token: response.refresh_token
    }
  }, {
    upsert: true
  })

  res.cookie('session', sessionId, {
    maxAge: 1000000000000000
  }).redirect(redirectPath)
})

app.get('/api/authorize', async (req, res) => {
  if (!req.session) return res.json({ location: discord.getAuthorizeUrl(req.query) })
  res.json({
    application,
    user: req.user
  })
})

app.post('/api/authorize', async (req, res) => {
  if (req.body.authorize) {
    res.json({ location: `http://localhost:3000?code=${cryptoRandomString({ length: 32, type: 'alphanumeric' })}` })
  } else {
    res.json({ location: 'http://localhost:3000?error=invalid_grant' })
  }
})

app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html')))
