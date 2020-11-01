const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')

const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true })

const queryString = require('querystring')
const DiscordAPI = require('./DiscordAPI')

let database

const discord = new DiscordAPI()

const aes256 = require('aes256')
const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY
const crypto = require('crypto')

const cookieParser = require('cookie-parser')

client.connect().then(() => {
  database = client.db('id')
  console.log('Connected to the database')
  app.listen(process.env.PORT || 8080)
  console.log('Listening on port 8080!')
})

app.use(cookieParser())
app.use(bodyParser.json())

const application = {
  image: 'https://play-lh.googleusercontent.com/ORzWxi-sIo_hCgSa6uzVvBUE4osKUqRVzHnniUUxA2WXD7BnZ95BNVpWFLUTKRyJRdU',
  name: 'Google Assistant',
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

app.get('/api/login', (req, res) => {
  res.json({
    application,
    login_url: discord.getAuthorizeUrl()
  })
})

app.get('/api/callback', async (req, res) => {
  const response = await discord.exchangeCode(req.query.code)
  const user = await discord.getUser(response.access_token)
  const sessionId = crypto.randomBytes(32).toString('hex')
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
  }).redirect('/authorize')
})

app.get('/api/authorize', async (req, res) => {
  if (!req.session) return res.json({ location: discord.getAuthorizeUrl() })
  res.json({
    application,
    user: req.user
  })
})

app.post('/api/authorize', async (req, res) => {
  if (req.body.authorize) {
    res.json({ location: 'http://localhost:3000?code=tgr8uhvb94t65hb8043j58906jnko5e6m' })
  } else {
    res.json({ location: 'http://localhost:3000?error=invalid_grant' })
  }
})

app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))
